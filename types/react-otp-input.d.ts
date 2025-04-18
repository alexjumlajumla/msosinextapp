declare module 'react-otp-input' {
  export interface OTPInputProps {
    value: string;
    onChange: (otp: string) => void;
    numInputs?: number;
    renderInput?: (props: any) => JSX.Element;
    shouldAutoFocus?: boolean;
    inputType?: string;
    containerStyle?: string | React.CSSProperties;
    inputStyle?: string | React.CSSProperties;
    placeholder?: string;
  }

  const OTPInput: React.FC<OTPInputProps>;
  export default OTPInput;
}