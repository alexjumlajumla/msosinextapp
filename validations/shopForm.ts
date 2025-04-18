import * as Yup from "yup";

export const shopFormValidation = Yup.object().shape({
  title: Yup.object().shape({
    en: Yup.string().required(),
  }),
  delivery_time_type: Yup.string().required(),
  delivery_time_from: Yup.number()
    .required()
    .min(0)
    .default(500),
  delivery_time_to: Yup.number()
    .required()
    .min(0),
  price: Yup.string()
    .required()
    .default("500"),
  price_per_km: Yup.string()
    .required()
    .default("500"),
});