import React, { useState } from "react";
import cls from "./parcelCheckout.module.scss";
import dayjs from "dayjs";
import { useFormik, FormikProps } from "formik";
import { useTranslation } from "react-i18next";
import { useAuth } from "contexts/auth/auth.context";
import { useSettings } from "contexts/settings/settings.context";
import { Grid, useMediaQuery, CircularProgress } from "@mui/material";
import { useMutation, useQuery } from "react-query";
import { error as showError } from "components/alert/toast";
import { useRouter } from "next/router";
import ShopForm from "components/shopForm/shopForm";
import Unauthorized from "components/unauthorized/unauthorized";
import parcelService from "services/parcel";
import { ParcelFormValues, ParcelType } from "interfaces/parcel.interface";
import { useAppSelector } from "hooks/useRedux";
import { selectCurrency } from "redux/slices/currency";
import paymentService from "services/payment";
import { EXTERNAL_PAYMENTS } from "constants/constants";
import { AxiosError } from 'axios';
import { PaymentPayload, PaymentList, PaymentResponse } from 'interfaces/payment.interface';
import { ErrorBoundary } from 'react-error-boundary';
import ParcelSenderForm from "components/parcelForm/parcelSenderForm";
import ParcelReceiverForm from "components/parcelForm/parcelReceiver";
import ParcelTypeForm from "components/parcelForm/parcelTypeForm";
import ParcelHeaderForm from "components/shopForm/parcelHeaderForm";

const defaultLocation = {
  latitude: "0",
  longitude: "0"
};

// Add this helper function
const validateLocation = (location: string | undefined) => {
  if (!location) return defaultLocation;
  const [lat, lng] = location.split(",");
  return {
    latitude: lat || defaultLocation.latitude,
    longitude: lng || defaultLocation.longitude,
  };
};

interface ChildProps {
  formik?: FormikProps<ParcelFormValues>;
  loading?: boolean;
  selectedType?: ParcelType;
  handleSelectType?: (type: ParcelType) => void;
}

type Props = {
  children: React.ReactElement<ChildProps> | React.ReactElement<ChildProps>[];
};

export default function ParcelCheckoutContainer({ children }: Props) {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const { settings } = useSettings();
  const currency = useAppSelector(selectCurrency);
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const [selectedType, setSelectedType] = useState<ParcelType>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const address = settings?.address;
  const initialLocation = validateLocation(settings?.location);

  const handleSelectType = (value: ParcelType) => {
    setSelectedType(value);
  };

  const { data: payments } = useQuery<PaymentList>("payments", () =>
    paymentService.getAll(),
  );

  const { data: types } = useQuery("parcelTypes", () =>
    parcelService.getAllTypes()
  );

  const formik = useFormik<ParcelFormValues>({
    initialValues: {
      currency_id: currency?.id || 0,
      rate: currency?.rate || 0,
      type_id: "",
      phone_from: user?.phone || "",
      username_from: [user?.firstname, user?.lastname].join(" "),
      location_from: {
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
      },
      address_from: address || "",
      house_from: "",
      stage_from: "",
      room_from: "",
      phone_to: "",
      username_to: "",
      location_to: {
        latitude: initialLocation.latitude,
        longitude: (Number(initialLocation.longitude) + 0.01).toString(),
      },
      address_to: address || "",
      house_to: "",
      stage_to: "",
      room_to: "",
      delivery_date: dayjs().add(1, "day").format("YYYY-MM-DD"),
      delivery_time: "13:00",
      note: "",
      images: [],
      payment_type_id: undefined,
      description: "parcel",
      qr_value: "",
      instructions: "",
      notify: false,
    },
    onSubmit: async (values: Partial<ParcelFormValues>) => {
      try {
        setIsSubmitting(true);

        // Log form values before submission
        console.log('Form values before submission:', {
          payment_type_id: values.payment_type_id,
          type_id: values.type_id,
          currency_id: values.currency_id,
          locations: {
            from: values.location_from,
            to: values.location_to
          }
        });

        // Validate payment type
        if (!values.payment_type_id) {
          throw new Error(t("please.select.payment.method"));
        }

        // Validate parcel type
        if (!values.type_id) {
          throw new Error(t("please.select.parcel.type"));
        }

        // Format phone numbers to ensure consistency
        const formatPhoneNumber = (phone: string) => {
          // Remove any non-digit characters
          const cleaned = phone.replace(/\D/g, '');
          // If starts with 0, replace with 255
          return cleaned.startsWith('0') ? `255${cleaned.slice(1)}` : cleaned;
        };

        // Format coordinates to ensure they are strings with correct precision
        const formatCoordinate = (coord: number | string = 0) => {
          const num = typeof coord === 'string' ? parseFloat(coord) : coord;
          return num.toFixed(6);
        };

        const formatLocation = (location: any) => ({
          latitude: formatCoordinate(location?.latitude),
          longitude: formatCoordinate(location?.longitude)
        });

        // Get tomorrow's date
        const tomorrow = dayjs().add(1, 'day');
        
        const body: ParcelFormValues = {
          currency_id: currency?.id ?? 0,
          type_id: values.type_id || "",
          rate: currency?.rate ?? 0,
          phone_from: formatPhoneNumber(values.phone_from || ""),
          username_from: values.username_from || "",
          location_from: formatLocation(values.location_from),
          address_from: values.address_from || "",
          house_from: values.house_from || "",
          stage_from: values.stage_from || "",
          room_from: values.room_from || "",
          phone_to: formatPhoneNumber(values.phone_to || ""),
          username_to: values.username_to || "",
          location_to: formatLocation(values.location_to),
          address_to: values.address_to || "",
          house_to: values.house_to || "",
          stage_to: values.stage_to || "",
          room_to: values.room_to || "",
          delivery_date: tomorrow.format("YYYY-MM-DD"),
          delivery_time: "13:00",
          note: values.note || "",
          images: values.images || [],
          payment_type_id: Number(values.payment_type_id) || 0,
          description: values.description || "parcel",
          qr_value: values.qr_value || "",
          instructions: values.instructions || "",
          notify: Boolean(values.notify)
        };

        // Log the selected payment method
        const selectedPayment = payments?.data.find(
          (item) => item.id === Number(body.payment_type_id)
        );
        console.log('Selected payment method:', {
          id: body.payment_type_id,
          payment: selectedPayment,
          isSelcom: selectedPayment?.tag === 'selcom'
        });

        // Validate coordinates before submission
        if (!body.location_from.latitude || !body.location_from.longitude ||
            !body.location_to.latitude || !body.location_to.longitude) {
          throw new Error(t("please.select.valid.locations"));
        }

        console.log('Submitting parcel data:', JSON.stringify(body, null, 2));
        mutate(body);
      } catch (error) {
        console.error('Error in form submission:', error);
        showError(error instanceof Error ? error.message : t("error.creating.parcel"));
      } finally {
        setIsSubmitting(false);
      }
    },
    validate: (values: Partial<ParcelFormValues>) => {
      const errors: Partial<Record<keyof ParcelFormValues, string>> = {};
      const re = /^[\+]?[0-9\b]+$/;
      
      // Required field validations with detailed logging
      console.log('Validating form values:', {
        payment_type_id: values.payment_type_id,
        type_id: values.type_id,
        phone_from: values.phone_from,
        phone_to: values.phone_to
      });

      if (!values.type_id) {
        errors.type_id = t("required");
      }
      if (!values.payment_type_id) {
        errors.payment_type_id = t("required");
      }
      if (!values.phone_from) {
        errors.phone_from = t("required");
      } else if (!re.test(values.phone_from)) {
        errors.phone_from = t("invalid");
      }
      if (!values.username_from) {
        errors.username_from = t("required");
      }
      if (!values.address_from) {
        errors.address_from = t("required");
      }
      if (!values.location_from?.latitude || !values.location_from?.longitude) {
        errors.location_from = t("required");
      }
      if (!values.phone_to) {
        errors.phone_to = t("required");
      } else if (!re.test(values.phone_to)) {
        errors.phone_to = t("invalid");
      }
      if (!values.username_to) {
        errors.username_to = t("required");
      }
      if (!values.address_to) {
        errors.address_to = t("required");
      }
      if (!values.location_to?.latitude || !values.location_to?.longitude) {
        errors.location_to = t("required");
      }
      if (!values.delivery_date) {
        errors.delivery_date = t("required");
      }
      if (!values.delivery_time) {
        errors.delivery_time = t("required");
      }

      if (Object.keys(errors).length > 0) {
        console.log('Form validation errors:', errors);
      }

      return errors;
    },
  });

  const { isLoading, mutate } = useMutation({
    mutationFn: (data: ParcelFormValues) => {
      // Final validation of the data
      if (!data.location_from?.latitude || !data.location_from?.longitude ||
          !data.location_to?.latitude || !data.location_to?.longitude) {
        throw new Error(t("please.select.valid.locations"));
      }
      
      // Log the request payload
      console.log('Making parcel creation request with data:', {
        ...data,
        currency_id: Number(data.currency_id),
        type_id: String(data.type_id),
        rate: Number(data.rate),
        payment_type_id: Number(data.payment_type_id)
      });
      
      return parcelService.create(data);
    },
    onError: (err: any) => {
      console.error('Parcel creation error:', {
        response: err?.response,
        data: err?.response?.data,
        status: err?.response?.status,
        message: err?.response?.data?.message,
        errors: err?.response?.data?.errors,
      });
      
      let errorMessage = t("error.creating.parcel");
      
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.response?.data?.errors) {
        const errors = Object.values(err.response.data.errors);
        errorMessage = Array.isArray(errors) ? errors.join(', ') : String(errors);
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      showError(errorMessage);
      setIsSubmitting(false);
    },
    onSuccess: (response) => {
      console.log('Parcel created successfully:', response);
      const paymentId = formik.values.payment_type_id;
      if (!paymentId) {
        showError(t("please.select.payment.method"));
        return;
      }
      
      const payload: PaymentPayload = {
        id: response.data.id,
        payment: { payment_sys_id: paymentId },
      };
      
      const paymentType = payments?.data.find((item) => item.id === paymentId)?.tag;
      
      if (EXTERNAL_PAYMENTS.includes(paymentType || "")) {
        externalPay({
          name: paymentType || '',
          data: { parcel_id: payload.id },
        });
      } else {
        transactionCreate(payload);
      }
    },
  });

  const { isLoading: isLoadingTransaction, mutate: transactionCreate } =
    useMutation({
      mutationFn: (data: PaymentPayload) => {
        console.log('Creating transaction with:', data);
        return paymentService.parcelTransaction(data.id, data.payment);
      },
      onSuccess: (data: PaymentResponse) => {
        console.log('Transaction created successfully:', data);
        router.push(`/parcels/${data.data.id}`);
      },
      onError: (err: AxiosError<{message: string}>) => {
        console.error('Transaction creation error:', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message
        });
        showError(err.response?.data?.message || t("error.400"));
      },
    });

  const { isLoading: externalPayLoading, mutate: externalPay } = useMutation({
    mutationFn: (payload: { name: string; data: { parcel_id: number } }) => {
      console.log('Processing external payment:', payload);
      return paymentService.payExternal(payload.name, payload.data);
    },
    onSuccess: (data: PaymentResponse) => {
      console.log('External payment successful:', data);
      window.location.replace(data.data.data.url);
    },
    onError: (err: AxiosError<{message: string}>) => {
      console.error('External payment error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      showError(err.response?.data?.message || t("error.400"));
    },
  });

  return (
    <ErrorBoundary
      fallback={<div className={cls.error}>{t("something.went.wrong")}</div>}
      onError={(error) => {
        console.error("Parcel Checkout Error:", error);
        showError(t("error.400"));
      }}
    >
      <div className={cls.root}>
        <div className={cls.container}>
          <div className="container">
            <div className={cls.header}>
              <h1 className={cls.title}>{t("door.to.door.delivery")}</h1>
            </div>
          </div>
        </div>
        <div className="container">
          {payments?.data && types?.data ? (
            <form className={cls.wrapper} onSubmit={formik.handleSubmit}>
              {isAuthenticated ? (
                <Grid container spacing={isDesktop ? 4 : 2}>
                  <Grid item xs={12}>
                    <ParcelHeaderForm
                      formik={formik}
                      handleSelectType={handleSelectType}
                    >
                      <ParcelTypeForm
                        formik={formik}
                        loading={isLoading || isLoadingTransaction || externalPayLoading || isSubmitting}
                        selectedType={selectedType}
                        handleSelectType={handleSelectType}
                        payments={payments.data}
                        types={types.data.map((item) => ({
                          label: item.type,
                          value: String(item.id),
                          data: item,
                        }))}
                      />
                    </ParcelHeaderForm>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <ShopForm title={t("sender.details")}>
                      <ParcelSenderForm formik={formik} />
                    </ShopForm>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <ShopForm title={t("receiver.details")}>
                      <ParcelReceiverForm 
                        formik={formik}
                        loading={isLoading || isLoadingTransaction || externalPayLoading || isSubmitting}
                        selectedType={selectedType}
                      />
                    </ShopForm>
                  </Grid>
                </Grid>
              ) : (
                <ShopForm xs={12} md={8}>
                  <Unauthorized text={t("sign.in.parcel.order")} />
                </ShopForm>
              )}
            </form>
          ) : (
            <div className={cls.loading}>
              <CircularProgress size={24} />
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
