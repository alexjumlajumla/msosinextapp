import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import cls from "./profile.module.scss";
import PencilLineIcon from "remixicon-react/PencilLineIcon";
import { Grid, useMediaQuery } from "@mui/material";
import TextInput from "components/inputs/textInput";
import PrimaryButton from "components/button/primaryButton";
import { useFormik } from "formik";
import DarkButton from "components/button/darkButton";
import SelectInput from "components/inputs/selectInput";
import genders from "data/genders";
import dynamic from "next/dynamic";
import { IUser } from "interfaces/user.interface";
import useModal from "hooks/useModal";
import { useMutation } from "react-query";
import galleryService from "services/gallery";
import getAvatar from "utils/getAvatar";
import Loading from "components/loader/loading";
import profileService from "services/profile";
import { error, success } from "components/alert/toast";
import Datepicker from "components/inputs/datepicker";
import dayjs from "dayjs";
import { useAuth } from "contexts/auth/auth.context";
import FallbackImage from "components/fallbackImage/fallbackImage";
import PhoneInputWithVerification from "components/inputs/phoneInputWithVerification";
import { useRouter } from "next/router";
import { getCookie, removeCookie } from "utils/session";

const ModalContainer = dynamic(() => import("containers/modal/modal"));
const MobileDrawer = dynamic(() => import("containers/drawer/mobileDrawer"));
const ProfilePassword = dynamic(
  () => import("components/profilePassword/profilePassword"),
);

type Props = {
  data: IUser;
};

interface FormValues {
  firstname: string;
  lastname: string;
  phone: string; // Make this required
  email?: string;
  gender?: string;
  birthday?: string;
  img?: string;
}

export default function ProfileContainer({ data }: Props) {
  const { t } = useTranslation();
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const [passwordModal, handleOpen, handleClose] = useModal();
  const { setUserData } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const isUsingCustomPhoneSignIn =
    process.env.NEXT_PUBLIC_CUSTOM_PHONE_SINGUP === "true";

  const { mutate: upload, isLoading: isUploading } = useMutation({
    mutationFn: (data: any) => galleryService.upload(data),
    onSuccess: (data) => {
      formik.setFieldValue("img", data.data.title);
    },
  });

  const { mutate: updateProfile, isLoading } = useMutation({
    mutationFn: (data: any) => profileService.update(data),
    onSuccess: (data) => {
      setUserData(data.data);
      success(t("saved"));
      // Check if all required fields are filled
      const { firstname, lastname, phone } = data.data;
      if (firstname && lastname && phone) {
        removeCookie("needs_profile_completion");
        router.push("/"); // Redirect to home if profile is complete
      }
    },
  });

  const formik = useFormik<FormValues>({
    initialValues: {
      firstname: data?.firstname || "",
      lastname: data?.lastname || "",
      phone: data?.phone || "", // Provide default empty string
      email: data?.email || "",
      gender: data?.gender || "",
      birthday: data?.birthday
        ? dayjs(data.birthday).format("YYYY-MM-DD")
        : undefined,
      img: data?.img || "",
    },
    onSubmit: (values: FormValues) => {
      const body = {
        firstname: values.firstname,
        lastname: values.lastname,
        birthday: values.birthday,
        gender: values.gender,
        images: values.img ? [values.img] : undefined,
        phone: values.phone, // Make phone required
        email: values.email,
      };
      updateProfile(body);
    },
    validate: (values: FormValues) => {
      const errors: Partial<FormValues> = {};
      if (!values.firstname) {
        errors.firstname = t("required");
      }
      if (!values.lastname) {
        errors.lastname = t("required");
      }
      if (!values.phone) {
        errors.phone = t("required"); // Add phone validation
      }
      if (!values.email) {
        errors.email = t("required");
      } else if (
        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)
      ) {
        errors.email = t("should.be.valid");
      }
      return errors;
    },
  });

  function uploadImg(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.item(0);
    if (file && file?.size / 1024 / 1024 > 2) {
      error(t("image.size.should.be.less.than.2mb"));
      return;
    }
    if (file) {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("type", "users");
      upload(formData);
    }
  }

  useEffect(() => {
    const needsCompletion = getCookie("needs_profile_completion");
    const editMode = router.query.edit === "true";
    
    if (needsCompletion === "true" || editMode) {
      setIsEditing(true);
    }
  }, [router.query]);

  const handleProfileUpdate = async (values: any) => {
    try {
      // Your existing profile update logic here
      // After successful update:
      setIsEditing(false);
      router.replace("/profile"); // Remove the edit query param
    } catch (err) {
      error(t("error.400"));
    }
  };

  return (
    <div className={cls.root}>
      <div className={`container ${cls.container}`}>
        <div className={cls.header}>
          <h1 className={cls.title}>{t("profile")}</h1>
        </div>
        <form onSubmit={formik.handleSubmit}>
          <Grid container>
            <Grid item xs={12} md={6}>
              <Grid container spacing={isDesktop ? 6 : 4}>
                <Grid item xs={12}>
                  <div className={cls.avatar}>
                    <div className={cls.avatarWrapper}>
                      {!isUploading ? (
                        <FallbackImage
                          fill
                          src={getAvatar(formik.values.img)}
                          alt="Avatar"
                          sizes="100px"
                        />
                      ) : (
                        <Loading />
                      )}
                    </div>
                    <label htmlFor="img" className={cls.uploadBtn}>
                      <PencilLineIcon />
                    </label>
                    <input
                      type="file"
                      id="img"
                      name="img"
                      accept=".png, .jpg, .jpeg, .svg"
                      hidden
                      onChange={uploadImg}
                    />
                  </div>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextInput
                    name="firstname"
                    label={t("firstname")}
                    placeholder={t("type.here")}
                    value={formik.values.firstname}
                    onChange={formik.handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextInput
                    name="lastname"
                    label={t("lastname")}
                    placeholder={t("type.here")}
                    value={formik.values.lastname}
                    onChange={formik.handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <SelectInput
                    name="gender"
                    label={t("gender")}
                    placeholder={t("type.here")}
                    value={formik.values.gender}
                    onChange={formik.handleChange}
                    options={genders}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Datepicker
                    name="birthday"
                    label={t("date.of.birth")}
                    placeholder={t("type.here")}
                    value={formik.values.birthday}
                    onChange={formik.handleChange}
                    inputProps={{
                      max: dayjs().add(-18, "years").format("YYYY-MM-DD"),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextInput
                    name="email"
                    label={t("email")}
                    placeholder={t("type.here")}
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    error={!!formik.errors.email}
                    helperText={formik.errors.email}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextInput
                    label={t("phone")}
                    placeholder={t("type.here")}
                    name="phone"
                    value={formik.values.phone || ""} // Add fallback empty string
                    onChange={
                      isUsingCustomPhoneSignIn ? formik.handleChange : undefined
                    }
                    error={!!formik.errors.phone}
                    helperText={formik.errors.phone}
                  />
                </Grid>
                <Grid item xs={12} md={6} mt={2}>
                  <PrimaryButton type="submit" loading={isLoading}>
                    {t("save")}
                  </PrimaryButton>
                </Grid>
                <Grid item xs={12} md={6} mt={isDesktop ? 2 : -2}>
                  <DarkButton type="button" onClick={handleOpen}>
                    {t("update.password")}
                  </DarkButton>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </div>
      {isDesktop ? (
        <ModalContainer open={passwordModal} onClose={handleClose}>
          <ProfilePassword handleClose={handleClose} />
        </ModalContainer>
      ) : (
        <MobileDrawer open={passwordModal} onClose={handleClose}>
          <ProfilePassword handleClose={handleClose} />
        </MobileDrawer>
      )}
    </div>
  );
}
