import React from "react";
import cls from "./resetPasswordForm.module.scss";
import { useTranslation } from "react-i18next";
import TextInput from "components/inputs/textInput";
import PrimaryButton from "components/button/primaryButton";
import { useFormik } from "formik";
import { error, success } from "components/alert/toast";
import authService from "services/auth";
import { useRouter } from "next/router";
import { useAuth } from "contexts/auth/auth.context";

type RegisterViews = "RESET" | "VERIFY";
type Props = {
  changeView: (view: RegisterViews) => void;
  onSuccess: (data: any) => void;
};

interface formValues {
  email?: string;
}

export default function ResetPasswordForm({ onSuccess, changeView }: Props) {
  const { t } = useTranslation();
  const { push } = useRouter();
  const { phoneNumberSignIn } = useAuth();

  const isUsingCustomPhoneSignIn =
    process.env.NEXT_PUBLIC_CUSTOM_PHONE_SINGUP === "true";

  const formik = useFormik({
    initialValues: {
      email: '', // Initialize with empty string
    },
    onSubmit: (values: formValues, { setSubmitting }) => {
      if (values.email?.includes("@")) {
        authService
          .forgotPasswordEmail(values)
          .then((res: any) => {
            push({ pathname: "/verify-phone", query: { email: values.email } });
            success(res.message);
          })
          .catch((err) => error(t(err.statusCode)))
          .finally(() => setSubmitting(false));
      } else {
        const trimmedPhone = values.email?.replace(/[^0-9]/g, "");
        if (isUsingCustomPhoneSignIn) {
          authService
            .forgotPassword({ phone: trimmedPhone })
            .then((res) => {
              onSuccess({
                ...res,
                phone: trimmedPhone,
                verifyId: res.data?.verifyId,
              });
              changeView("VERIFY");
            })
            .catch(() => {
              error(t("sms.not.sent"));
            })
            .finally(() => {
              setSubmitting(false);
            });
        } else {
          phoneNumberSignIn(trimmedPhone || "")
            .then((confirmationResult) => {
              changeView("VERIFY");
              onSuccess({ phone: trimmedPhone, callback: confirmationResult });
            })
            .catch(() => error(t("sms.not.sent")))
            .finally(() => setSubmitting(false));
        }
      }
    },
    validate: (values: formValues) => {
      const errors: formValues = {};
      if (!values.email) {
        errors.email = t("required");
      }
      if (values.email?.includes(" ")) {
        errors.email = t("should.not.includes.empty.space");
      }
      if (values.email?.includes("@")) {
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
          errors.email = t("should.be.valid");
        }
      } else if (
        !/^998([378]{2}|(9[013-57-9]))\d{7}$/i.test(
          values.email?.replace("+", "") || "",
        )
      ) {
        console.log("email");
        errors.email = t("should.be.valid");
      }
      return errors;
    },
  });

  return (
    <form className={cls.wrapper} onSubmit={formik.handleSubmit}>
      <div className={cls.header}>
        <h1 className={cls.title}>{t("reset.password")}</h1>
        <p className={cls.text}>{t("reset.password.text")}</p>
      </div>
      <div className={cls.space} />
      <TextInput
        name="email"
        label={t("email.or.phone")}
        placeholder={t("type.here")}
        value={formik.values.email || ''} // Add empty string fallback
        onChange={formik.handleChange}
        error={!!formik.errors.email}
      />
      <div className={cls.space} />
      <div className={cls.action}>
        <PrimaryButton
          id="sign-in-button"
          type="submit"
          loading={formik.isSubmitting}
        >
          {t("send")}
        </PrimaryButton>
      </div>
    </form>
  );
}
