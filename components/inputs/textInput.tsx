import React from 'react';
import { styled } from "@mui/material/styles";
import { TextField, TextFieldProps } from '@mui/material';

const Input = styled(TextField)({
  width: "100%",
  backgroundColor: "transparent",
  "& .MuiInputLabel-root": {
    fontSize: 12,
    lineHeight: "14px",
    fontWeight: 500,
    textTransform: "uppercase",
    color: "var(--black)",
    "&.Mui-error": {
      color: "var(--red)",
    }
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "var(--black)",
  },
  "& .MuiInput-root": {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: "19px",
    color: "var(--black)",
    fontFamily: "'Inter', sans-serif",
    "&.Mui-error::after": {
      borderBottomColor: "var(--red)",
    }
  },
  "& .MuiInput-root::before": {
    borderBottom: "1px solid var(--grey)",
  },
  "& .MuiInput-root:hover:not(.Mui-disabled)::before": {
    borderBottom: "2px solid var(--black)",
  },
  "& .MuiInput-root::after": {
    borderBottom: "2px solid var(--primary)",
  }
});

export interface TextInputProps extends Omit<TextFieldProps, 'variant'> {
  name: string;
  label: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<any>) => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  endAdornment?: React.ReactNode;
}

export default function TextInput({ endAdornment, ...props }: TextInputProps) {
  return (
    <Input
      {...props}
      variant="standard"
      fullWidth
      InputProps={{
        ...props.InputProps,
        endAdornment: endAdornment
      }}
    />
  );
}
