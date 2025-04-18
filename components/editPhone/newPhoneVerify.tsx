import React from "react";
import { useFormik } from "formik";
import cls from "./newPhoneVerify.module.scss";
import OtpCodeInput from "components/inputs/otpCodeInput";
import { useTranslation } from "react-i18next";
import PrimaryButton from "components/button/primaryButton";

interface Props {
  phone: string;
  callback: any;
  setCallback: React.Dispatch<React.SetStateAction<any>>;
  handleClose: () => void;
}

export default function NewPhoneVerify(props: Props) {
  const { phone, callback, setCallback, handleClose } = props;
  const { t } = useTranslation();
  const formik = useFormik({
    initialValues: {
      verifyId: "",
    },
    onSubmit: (values) => {
      callback(values.verifyId);
    },
  });

  return (
    <form className={cls.form} onSubmit={formik.handleSubmit}>
      <div className={cls.otpWrapper}>
        <OtpCodeInput
          value={formik.values.verifyId}
          onChange={(value) => formik.setFieldValue("verifyId", value)}
          numInputs={6}
        />
      </div>
      <div className={cls.action}>
        <PrimaryButton
          type="submit"
          disabled={formik.values.verifyId.length < 6}
          loading={formik.isSubmitting}
        >
          {t("verify")}
        </PrimaryButton>
      </div>
    </form>
  );
}
