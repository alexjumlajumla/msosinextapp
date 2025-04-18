import React from "react";
import cls from "./shopForm.module.scss";
import { Grid } from "@mui/material";
import TextInput from "components/inputs/textInput";
import { FormikProps } from "formik";
import { useTranslation } from "react-i18next";
import ImageUpload from "components/imageUpload/imageUpload";
import MultiSelect from "components/inputs/multiSelect";
import FileUpload from "components/fileUpload/fileUpload";
import { ShopFormType } from "interfaces/shop.interface"; // Move type to separate interface file
import { SelectChangeEvent } from "@mui/material";

type ListType = {
  label: string;
  value: number;
};

type Props = {
  children?: React.ReactNode; // Fix any type
  lang: string;
  formik: FormikProps<ShopFormType>;
  shopCategories: ListType[];
  tagList: ListType[];
};

export default function ShopGeneralForm({
  formik,
  lang,
  shopCategories,
  tagList,
}: Props) {
  const { t } = useTranslation();

  if (!formik?.values) {
    console.warn('ShopGeneralForm: Formik values are undefined');
    return null;
  }

  const {
    title = { [lang]: '' },
    phone = '',
    images = ['', ''],
    description = { [lang]: '' },
    min_amount = '',
    tax = '',
    categories = [],
    tags = [],
    documents = []
  } = formik.values;

  const handleMultiSelectChange = (event: SelectChangeEvent<number[]>) => {
    if (!event.target.value) return;

    const values = Array.isArray(event.target.value)
      ? event.target.value
      : [];

    formik.setFieldValue("categories", values);
  };

  const handleDocumentChange = (files: File[]) => {
    formik.setFieldValue('documents', files);
  };

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6} lg={3}>
        <ImageUpload<ShopFormType>
          formik={formik}
          accept=".png, .jpg, .jpeg, .svg"
          name="images[0]"
          label={t("logo.image")}
          value={images[0]}
          error={!!formik.errors.images?.[0] && formik.touched.images}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <ImageUpload<ShopFormType>
          formik={formik}
          name="images[1]"
          accept=".png, .jpg, .jpeg, .svg"
          label={t("background.image")}
          value={images[1]}
          error={!!formik.errors.images?.[1] && formik.touched.images}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={6}>
        <TextInput
          name={`title.${lang}`}
          label={t("title")}
          value={title[lang]}
          onChange={formik.handleChange}
          placeholder={t("type.here")}
          error={!!formik.errors.title && !!formik.touched.title}
        />
        <div className={cls.spacing} />
        <TextInput
          name="phone"
          label={t("phone")}
          value={phone}
          onChange={formik.handleChange}
          placeholder={t("type.here")}
          error={!!formik.errors.phone && formik.touched.phone}
        />
      </Grid>
      <Grid item xs={48} md={24} lg={12}>
        <FileUpload
          files={formik.values.documents}
          setFiles={handleDocumentChange}
          accept=".pdf,.doc,.docx"
          label={t("upload.documents")}
        />
      </Grid>
      <Grid item xs={12}>
        <TextInput
          name={`description.${lang}`}
          label={t("description")}
          value={description[lang]}
          onChange={formik.handleChange}
          placeholder={t("type.here")}
          error={!!formik.errors.description && !!formik.touched.description}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={6}>
        <TextInput
          name="min_amount"
          label={t("min_amount")}
          type="number"
          InputProps={{ inputProps: { min: "0" } }}
          value={min_amount}
          onChange={formik.handleChange}
          placeholder={t("type.here")}
          error={!!formik.errors.min_amount && formik.touched.min_amount}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={6}>
        <TextInput
          name="tax"
          label={t("tax")}
          type="number"
          InputProps={{ inputProps: { min: "0" } }}
          value={tax}
          onChange={formik.handleChange}
          placeholder={t("type.here")}
          error={!!formik.errors.tax && formik.touched.tax}
        />
      </Grid>
      <Grid item xs={12}>
        <MultiSelect
          options={shopCategories}
          name="categories"
          label={t("category")}
          value={categories}
          onChange={handleMultiSelectChange}
          placeholder={t("type.here")}
          error={!!formik.errors.categories && formik.touched.categories}
        />
      </Grid>
      <Grid item xs={12}>
        <MultiSelect
          options={tagList}
          name="tags"
          label={t("tag")}
          value={tags} // Keep tags as number[]
          onChange={(event) => {
            const values = event.target.value as number[];
            formik.setFieldValue("tags", values);
          }}
          placeholder={t("type.here")}
          error={!!formik.errors.tags && formik.touched.tags}
        />
      </Grid>
    </Grid>
  );
}
