import React, { useRef, useMemo, useCallback, useState } from "react";
import cls from "./shopForm.module.scss";
import { Grid } from "@mui/material";
import TextInput from "components/inputs/textInput";
import { ShopFormType } from "interfaces";
import { FormikProps } from "formik";
import { useTranslation } from "react-i18next";
import Map from "components/map/map";
import PrimaryButton from "components/button/primaryButton";

type Props = {
  children?: React.ReactNode;
  formik: FormikProps<ShopFormType>;
  lang: string;
  loading?: boolean;
};

export default function ShopAddressForm({ formik, lang, loading }: Props) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const { 
    address = { [lang]: '' }, 
    location = '0,0' 
  } = formik?.values || {};

  const locationObj = useMemo(() => ({
    lat: Number(location?.split(",")[0] || 0),
    lng: Number(location?.split(",")[1] || 0),
  }), [location]);

  const [mapLocation, setMapLocation] = useState(locationObj);

  const handleLocationChange = useCallback((latlng: { lat: number; lng: number }, text?: string) => {
    const value = `${latlng.lat},${latlng.lng}`;
    setMapLocation(latlng);
    formik.setFieldValue("location", value);
    if (text) {
      formik.setFieldValue(`address.${lang}`, text);
    }
  }, [formik, lang]);

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <TextInput
          name={`address.${lang}`}
          label={t("address")}
          placeholder={t("type.here")}
          defaultValue={address[lang]}
          inputRef={inputRef}
        />
      </Grid>
      <Grid item xs={12}>
        <div className={cls.map}>
          <Map
            location={mapLocation}
            setLocation={handleLocationChange}
            inputRef={inputRef}
          />
        </div>
      </Grid>
      <Grid item xs={12} md={4} lg={3}>
        <PrimaryButton type="submit" loading={loading}>
          {t("submit")}
        </PrimaryButton>
      </Grid>
    </Grid>
  );
}
