import React from "react";
import { Grid, useMediaQuery } from "@mui/material";
import { FormikProps } from "formik";
import { ParcelFormValues } from "interfaces/parcel.interface";
import useLocale from "hooks/useLocale";
import useModal from "hooks/useModal";
import TextInput from "components/inputs/textInput";
import DeliveryAddressModal from "components/addressModal/deliveryAddressModal";
import PencilFillIcon from "remixicon-react/PencilFillIcon";
import { PickupFromIcon } from "components/icons";

interface Props {
  formik: FormikProps<ParcelFormValues>;
}

export default function ParcelSenderForm({ formik }: Props) {
  const { t } = useLocale();
  const [addressModal, handleOpenAddressModal, handleCloseAddressModal] = useModal();
  const isDesktop = useMediaQuery("(min-width:1140px)");

  if (!formik?.values) {
    return null;
  }

  const { username_from = '', phone_from = '', address_from = '', location_from = { latitude: '0', longitude: '0' } } = formik.values;

  return (
    <>
      <Grid item xs={12} md={6}>
        <div className="sender-details">
          <h3>{t("sender.details")}</h3>
          <TextInput
            name="username_from"
            label={t("full.name")}
            value={username_from}
            onChange={formik.handleChange}
            error={formik.touched.username_from && Boolean(formik.errors.username_from)}
            helperText={formik.touched.username_from ? formik.errors.username_from : undefined}
          />
          <TextInput
            name="phone_from"
            label={t("phone")}
            value={phone_from}
            onChange={formik.handleChange}
            error={formik.touched.phone_from && Boolean(formik.errors.phone_from)}
            helperText={formik.touched.phone_from ? formik.errors.phone_from : undefined}
          />
          <div className="address-input" onClick={handleOpenAddressModal}>
            <TextInput
              name="address_from"
              label={t("address")}
              value={address_from}
              onChange={formik.handleChange}
              error={formik.touched.address_from && Boolean(formik.errors.address_from)}
              helperText={formik.touched.address_from ? formik.errors.address_from : undefined}
              disabled
              endAdornment={<PencilFillIcon />}
            />
          </div>
        </div>
      </Grid>

      <DeliveryAddressModal
        address={address_from}
        addressKey="address_from"
        locationKey="location_from"
        formik={formik}
        checkZone={false}
        open={addressModal}
        onClose={handleCloseAddressModal}
        latlng={location_from}
        fullScreen={!isDesktop}
        title="select.address"
      />
    </>
  );
}
