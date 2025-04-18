import React from "react";
import { styled } from "@mui/material/styles";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import EditLineIcon from "remixicon-react/EditLineIcon";
import CheckLineIcon from "remixicon-react/CheckLineIcon";
import VerifyIcon from "remixicon-react/ShieldCheckLineIcon";

const StyledInput = styled(TextField)(({ theme }) => ({
  width: '100%',
  marginBottom: '20px',
  '& .MuiInputBase-root': {
    backgroundColor: 'transparent',
    borderRadius: '8px',
    fontSize: '16px',
    width: '100%',
    '&:before': {
      borderBottom: '1px solid var(--grey)',
      transition: 'border-color 0.2s ease'
    },
    '&:hover:not(.Mui-disabled):before': {
      borderBottom: '1px solid var(--primary)'
    },
    '&.Mui-focused:before': {
      borderBottom: '2px solid var(--primary) !important'
    },
    '&.Mui-error:before': {
      borderBottom: '1px solid var(--red)'
    }
  },
  '& .MuiInputBase-input': {
    padding: '12px 0',
    fontSize: '16px',
    '&::placeholder': {
      color: 'var(--secondary-text)',
      opacity: 0.7
    }
  },
  '& .MuiInputAdornment-root': {
    marginRight: '8px'
  }
}));

interface PhoneInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVerify?: () => void;
  verified?: boolean;
  disabled?: boolean;
  error?: boolean;
  label?: string;
}

export default function PhoneInputWithVerification({
  value,
  onChange,
  onVerify,
  verified,
  disabled,
  error,
  label = "Phone number"
}: PhoneInputProps) {
  return (
    <StyledInput
      fullWidth
      variant="standard"
      label={label}
      placeholder="Enter phone number"
      value={value}
      onChange={onChange}
      disabled={disabled}
      error={error}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            {verified ? (
              <CheckLineIcon className="success-icon" style={{ color: 'var(--green)' }} />
            ) : (
              <IconButton
                onClick={onVerify}
                disabled={!value || disabled}
                size="small"
                style={{ 
                  color: 'var(--primary)',
                  opacity: (!value || disabled) ? 0.5 : 1
                }}
              >
                {error ? <EditLineIcon /> : <VerifyIcon />}
              </IconButton>
            )}
          </InputAdornment>
        )
      }}
    />
  );
}
