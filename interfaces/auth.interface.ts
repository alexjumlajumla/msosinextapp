export interface PhoneVerifyProps {
  phone: string;
  callback: any;
  setCallback: React.Dispatch<React.SetStateAction<any>>;
  handleClose: () => void;
}

export interface VerifyResponse {
  data: {
    token: string;
    // ... other response fields
  };
}