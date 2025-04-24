import React, { useEffect } from "react";
import { FormikProps } from "formik";
import { ParcelFormValues, ParcelType } from "interfaces/parcel.interface";
import useLocale from "hooks/useLocale";
import { PaymentList } from "interfaces/payment.interface";
import cls from "./parcelForm.module.scss";
import { Grid } from "@mui/material";
import SelectInput from "components/inputs/selectInput";

interface Props {
  formik: FormikProps<ParcelFormValues>;
  loading?: boolean;
  selectedType?: ParcelType;
  handleSelectType: (type: ParcelType) => void;
  payments?: PaymentList["data"];
  types?: Array<{
    label: string;
    value: string;
    data: ParcelType;
  }>;
}

export default function ParcelTypeForm({
  formik,
  loading,
  selectedType,
  handleSelectType,
  payments = [],
  types = [],
}: Props) {
  const { t } = useLocale();

  // Log available payment methods
  useEffect(() => {
    console.log('Available payment methods:', payments.map(item => ({
      id: item.id,
      tag: item.tag,
      label: t(item.tag)
    })));
  }, [payments, t]);

  if (!formik?.values) {
    return null;
  }

  const paymentOptions = payments.map((item) => ({
    label: item.tag === "selcom" ? "Pay by Card or Mobile Money" : t(item.tag),
    value: String(item.id),
    tag: item.tag
  }));

  const handlePaymentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    const selectedPayment = payments.find(item => item.id === value);
    
    console.log('Payment selection:', {
      value,
      selectedPayment,
      isSelcom: selectedPayment?.tag === 'selcom'
    });

    formik.setFieldValue("payment_type_id", value);
  };

  return (
    <div className={cls.typeForm}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <SelectInput
            name="type_id"
            label={t("parcel.type")}
            value={formik.values.type_id}
            onChange={(e) => {
              formik.handleChange(e);
              const selected = types.find(
                (item) => item.value === e.target.value
              );
              if (selected) {
                handleSelectType(selected.data);
              }
            }}
            options={types}
            error={Boolean(formik.touched.type_id && formik.errors.type_id)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <SelectInput
            name="payment_type_id"
            label={t("payment.type")}
            value={String(formik.values.payment_type_id || "")}
            onChange={handlePaymentChange}
            options={paymentOptions}
            error={Boolean(formik.touched.payment_type_id && formik.errors.payment_type_id)}
          />
        </Grid>
      </Grid>
    </div>
  );
} 