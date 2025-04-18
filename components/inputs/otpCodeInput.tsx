import React from 'react';
import OTPInput from 'react-otp-input';
import cls from './otpCodeInput.module.scss';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  numInputs?: number;
  shouldAutoFocus?: boolean;
  containerStyle?: React.CSSProperties | string;
  hasErrored?: boolean;
}

export default function OTPInputComponent({
  value,
  onChange,
  numInputs = 6,
  shouldAutoFocus = true,
  containerStyle,
  hasErrored
}: OtpInputProps) {
  return (
    <div className={cls.otpWrapper}>
      <OTPInput
        value={value}
        onChange={onChange}
        numInputs={numInputs}
        shouldAutoFocus={shouldAutoFocus}
        containerStyle={containerStyle || cls.otpContainer}
        inputStyle={`${cls.input} ${hasErrored ? cls.error : ''}`}
        inputType="number"
      />
    </div>
  );
}

export function OtpCodeInput({
  formik
}: {
  formik: {
    values: { code: string };
    setFieldValue: (field: string, value: string) => void;
    errors: { code?: string };
  };
}) {
  return (
    <OTPInputComponent
      value={formik.values.code || ''} // Provide fallback empty string
      onChange={(otp: string) => formik.setFieldValue("code", otp)}
      numInputs={6}
      shouldAutoFocus
      containerStyle={cls.otpContainer}
      hasErrored={!!formik.errors.code}
    />
  );
}
