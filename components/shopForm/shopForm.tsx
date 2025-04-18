import React from "react";
import cls from "./shopForm.module.scss";
import { FormikProps } from "formik";
import { ShopFormType } from "interfaces";
import { Grid, useMediaQuery } from "@mui/material";
import { ParcelType } from "interfaces/parcel.interface";

// Add type guard above the component
interface FormikChildProps {
  formik: FormikProps<ShopFormType>;
  lang?: string;
  loading?: boolean;
  selectedType?: ParcelType;
}

function isFormikChild(
  child: React.ReactElement
): child is React.ReactElement<FormikChildProps> {
  return 'formik' in child.props;
}

type Props = {
  children?: React.ReactNode;
  lang?: string;
  formik?: FormikProps<ShopFormType>; // Make this required if form always needs Formik
  loading?: boolean;
  xs?: number | boolean;
  md?: number | boolean;
  lg?: number | boolean;
  title?: string;
  sticky?: boolean;
  selectedType?: ParcelType;
};

interface ShopFormInitialValues {
  delivery_time_type: string;
  delivery_time_from: number;
  delivery_time_to: number;
  price: string;
  price_per_km: string;
  title: Record<string, string>;
  phone: string;
  images: [string, string];
  description: Record<string, string>;
}

const initialValues: ShopFormInitialValues = {
  title: { en: '' },
  phone: '',
  images: ['', ''],
  description: { en: '' },
  delivery_time_type: "minute",
  delivery_time_from: 500,
  delivery_time_to: 0,
  price: "500",        // Changed to string
  price_per_km: "500", // Changed to string
};

export default function ShopForm({ 
  children,
  title,
  xs,
  md,
  lg 
}: Props) {
  return (
    <div className={cls.wrapper}>
      {title && <h1 className={cls.header}>{title}</h1>}
      <div className={cls.formContent}>
        <Grid item xs={xs} md={md} lg={lg}>
          {children}
        </Grid>
      </div>
    </div>
  );
}
