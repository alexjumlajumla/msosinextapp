import React from "react";
import cls from "./editPhone.module.scss";
import { useTranslation } from "react-i18next";
import TextInput from "components/inputs/textInput";
import PrimaryButton from "components/button/primaryButton";
import { useFormik } from "formik";
import { error } from "components/alert/toast";
import { useAuth } from "contexts/auth/auth.context";
import authService from "../../services/auth";

type EditPhoneViews = "EDIT" | "VERIFY";
type Props = {
  onSuccess: (data: any) => void;
  changeView: (view: EditPhoneViews) => void;
};

interface formValues {
  phone: string;
}

export default function InsertNewPhone({ onSuccess, changeView }: Props) {
  const { t } = useTranslation();
  const { phoneNumberSignIn } = useAuth();

  const isUsingCustomPhoneSignIn =
    process.env.NEXT_PUBLIC_CUSTOM_PHONE_SINGUP === "true";

  const formik = useFormik({
    initialValues: {
      phone: "",
    },
    onSubmit: (values: formValues, { setSubmitting }) => {
      const trimmedPhone = values.phone.replace(/[^0-9]/g, "");
      if (isUsingCustomPhoneSignIn) {
        authService
        .sendPhoneForVerification({ phone: trimmedPhone })
        .then((response) => {
          onSuccess({
            phone: trimmedPhone,
            callback: response.data,
          });
          changeView("VERIFY");
        })
        .catch((err) => {
          error(t("sms.not.sent"));
          console.log("Custom SMS Error =>", err);
        })
        .finally(() => {
          setSubmitting(false);
        });
      } else {
        phoneNumberSignIn(values.phone)
          .then((confirmationResult) => {
            onSuccess({
              phone: trimmedPhone,
              callback: confirmationResult,
            });
            changeView("VERIFY");
          })
          .catch((err) => {
            error(t("sms.not.sent"));
            console.log("err => ", err);
          })
          .finally(() => {
            setSubmitting(false);
          });
      }
    },

    validate: (values: formValues) => {
      const errors = {} as formValues;
      if (!values.phone) {
        errors.phone = t("required");
      }
      // Basic check: Ensure it contains digits, possibly allowing '+' and spaces/hyphens
      // else if (!/^\+?[0-9\s-]{7,}$/.test(values.phone)) {
      //   errors.phone = t("invalid.phone.number");
      // }
      // Or simply remove client-side format validation if server handles it robustly
      return errors;
    },
  });

  return (
    <form className={cls.wrapper} onSubmit={formik.handleSubmit}>
      <div className={cls.header}>
        <h1 className={cls.title}>{t("edit.phone")}</h1>
      </div>
      <div className={cls.space} />
      <TextInput
        name="phone"
        label={t("phone")}
        placeholder={t("type.here")}
        value={formik.values.phone}
        onChange={formik.handleChange}
        error={!!formik.errors.phone}
        helperText={formik.errors.phone}
        required
      />
      <div className={cls.space} />
      <div className={cls.action}>
        <PrimaryButton
          id="sign-in-button"
          type="submit"
          loading={formik.isSubmitting}
        >
          {t("save")}
        </PrimaryButton>
      </div>
    </form>
  );
}
