//@ts-nocheck
import React from "react";
import SEO from "components/seo";
import { useQuery } from "react-query";
import useLocale from "hooks/useLocale";
import parcelService from "services/parcel";
import ShopForm from "components/shopForm/shopForm";
import { ParcelType } from "interfaces/parcel.interface";
import ParcelForm from "components/parcelForm/parcelForm";
import ParcelSenderForm from "components/parcelForm/parcelSenderForm";
import ParcelReceiverForm from "components/parcelForm/parcelReceiver";
import ParcelCheckoutContainer from "containers/parcelCheckout/parcelCheckout";
import ParcelHeaderForm from "components/shopForm/parcelHeaderForm";
import { IParcelFeature } from "interfaces";
import { Grid } from "@mui/material";
import ParcelFeatureList from "containers/parcelFeatureList/parcelFeatureList";

type Props = {};

const features:IParcelFeature[][] = [
  [{
    id: 0,
    img: '/images/parcel/feature1.png',
    title: "save.time"
  }],
  [{
    id: 1,
    img: '/images/parcel/feature2.png',
    title: "set.up.delivery"
  }],
  [{
    id: 2,
    img: '/images/parcel/feature3.png',
    title: "fast.&.secure.delivery"
  }],
  [{
    id: 3,
    img: '/images/parcel/feature4.png',
    title: "delivery.restrictions"
  }],
]

export default function ParcelCheckout({}: Props) {
  const { t } = useLocale();

  const { data: types } = useQuery("parcelTypes", () =>
    parcelService.getAllTypes()
  );

  const { data: payments } = useQuery("payments", () =>
    paymentService.getAll()
  );

  const formatCategories = (list: ParcelType[] = []) => {
    if (!list.length) {
      return [];
    }
    return list.map((item) => ({
      label: item.type || t(item.tag),
      value: item.id,
      data: item,
    }));
  };

  return (
    <>
      <SEO />
      <ParcelCheckoutContainer>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ParcelFeatureList data={features} />
          </Grid>
          <Grid item xs={12}>
            <ParcelHeaderForm>
              <ParcelForm
                types={formatCategories(types?.data)}
                payments={formatCategories(payments?.data)}
              />
            </ParcelHeaderForm>
          </Grid>
          <Grid item xs={12} md={6}>
            <ShopForm title={t("sender.details")}>
              <ParcelSenderForm />
            </ShopForm>
          </Grid>
          <Grid item xs={12} md={6}>
            <ShopForm title={t("receiver.details")}>
              <ParcelReceiverForm />
            </ShopForm>
          </Grid>
        </Grid>
      </ParcelCheckoutContainer>
    </>
  );
}
