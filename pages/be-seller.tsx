//@ts-nocheck
import React, { useMemo, useState } from "react";
import SEO from "components/seo";
import BeSellerContainer from "containers/beSeller/beSellerContainer";
import ShopForm from "components/shopForm/shopForm";
import PrimaryButton from "components/button/primaryButton";
import ShopGeneralForm from "components/shopForm/shopGeneralForm";
import { useTranslation } from "react-i18next";
import ShopDeliveryForm from "components/shopForm/shopDeliveryForm";
import ShopAddressForm from "components/shopForm/shopAddressForm";
import { useQuery } from "react-query";
import categoryService from "services/category";
import shopService from "services/shop";
import { Category } from "interfaces";
import { useFormik } from "formik";
import * as Yup from 'yup';
import cls from './be-seller.module.scss';
import { toast } from "react-toastify";
import { useRouter } from "next/router";

interface ListType {
  label: string;
  value: number;
  parent?: ListType;
}

type Props = {};
const formatCategories = (list: Category[] = []) => {
  const res: ListType[] = [];
  if (!list.length) {
    return [];
  }
  list.forEach((item) => {
    res.push({ label: item.translation?.title, value: item.id });
    item.children?.map((child) => {
      res.push({
        label: child.translation?.title,
        value: child.id,
        parent: { label: item.translation?.title, value: item.id },
      });
    });
  });
  return res;
};

export default function BeSeller({}: Props) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const router = useRouter();

  const validationSchema = Yup.object().shape({
    title: Yup.object().shape({
      [locale]: Yup.string().required(t('required'))
    }),
    phone: Yup.string()
      .required(t('required'))
      .matches(/^[\+]?[0-9\b]+$/, t('invalid.phone')),
    images: Yup.array()
      .of(Yup.string())
      .min(2, t('both.images.required'))
      .test('required-images', t('both.images.required'), (value) => {
        return value?.[0]?.length > 0 && value?.[1]?.length > 0;
      }),
    description: Yup.object().shape({
      [locale]: Yup.string().required(t('required'))
    }),
    min_amount: Yup.number()
      .typeError(t('must.be.number'))
      .min(0, t('min.zero'))
      .required(t('required'))
      .test('is-number', t('must.be.number'), (value) => !isNaN(Number(value))),
    tax: Yup.number()
      .typeError(t('must.be.number'))
      .min(0, t('min.zero'))
      .required(t('required')),
    categories: Yup.array()
      .of(Yup.number())
      .min(1, t('required'))
      .required(t('required')),
    tags: Yup.array()
      .of(Yup.number())
      .min(1, t('required'))
      .required(t('required')),
    documents: Yup.array()
      .of(
        Yup.mixed().test('is-valid-doc', t('invalid.document'), (value) => {
          if (typeof value === 'string') return true;
          return value && (value.url || value.path);
        })
      )
      .min(1, t('required'))
      .required(t('required')),
    delivery_time_type: Yup.string().required(t('required')),
    delivery_time_from: Yup.number()
      .typeError(t('must.be.number'))
      .required(t('required'))
      .test('min-time', t('delivery.time.from.must.be.less'), function(value) {
        const { delivery_time_to } = this.parent;
        if (!value || !delivery_time_to) return true;
        return Number(value) < Number(delivery_time_to);
      }),
    delivery_time_to: Yup.number()
      .typeError(t('must.be.number'))
      .required(t('required'))
      .test('max-time', t('delivery.time.to.must.be.greater'), function(value) {
        const { delivery_time_from } = this.parent;
        if (!value || !delivery_time_from) return true;
        return Number(value) > Number(delivery_time_from);
      }),
    price: Yup.number()
      .typeError(t('must.be.number'))
      .min(0, t('min.zero'))
      .required(t('required')),
    price_per_km: Yup.number()
      .typeError(t('must.be.number'))
      .min(0, t('min.zero'))
      .required(t('required')),
    address: Yup.object().shape({
      [locale]: Yup.string().required(t('required'))
    }),
    location: Yup.string()
      .required(t('required'))
      .test('is-valid-location', t('invalid.location'), (value) => {
        if (!value) return false;
        const [lat, lng] = value.split(',');
        return !isNaN(Number(lat)) && !isNaN(Number(lng));
      })
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      title: { [locale]: '' },
      phone: '',
      images: ['', ''],
      description: { [locale]: '' },
      min_amount: '',
      tax: '',
      categories: [],
      tags: [],
      documents: [],
      delivery_time_type: '',
      delivery_time_from: '',
      delivery_time_to: '',
      price: '',
      price_per_km: '',
      address: { [locale]: '' },
      location: '0,0'
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        setIsSubmitting(true);
        
        // Validate file uploads
        if (!values.images[0] || !values.images[1]) {
          toast.error(t('both.images.required'));
          return;
        }
        
        if (!values.documents || values.documents.length === 0) {
          toast.error(t('documents.required'));
          return;
        }

        // Format data for submission
        const [latitude, longitude] = values.location.split(',');
        const formattedData = {
          ...values,
          min_amount: String(values.min_amount), // Convert to string as required by backend
          tax: Number(values.tax),
          price: Number(values.price),
          price_per_km: Number(values.price_per_km),
          delivery_time_from: Number(values.delivery_time_from),
          delivery_time_to: Number(values.delivery_time_to),
          location: { // Format as array for backend
            latitude: Number(latitude),
            longitude: Number(longitude)
          },
          documents: values.documents.map(doc => 
            typeof doc === 'string' ? doc : doc.url || ''
          ).filter(Boolean), // Ensure documents are strings and remove empty ones
        };

        await shopService.create(formattedData);
        toast.success(t('shop.created.successfully'));
        router.push('/seller/shops');
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || t('error.default');
        toast.error(errorMessage);
        
        // Handle validation errors from backend
        if (error?.response?.data?.params) {
          setErrors(error.response.data.params);
        }
      } finally {
        setIsSubmitting(false);
        setSubmitting(false);
      }
    }
  });

  const { data: shopCategories } = useQuery(["shopCategories", locale], () =>
    categoryService.getAllShopCategories({ perPage: 100 })
  );
  const { data: tags } = useQuery("tags", () => shopService.getAllTags());

  const formattedCategories = useMemo(
    () => formatCategories(shopCategories?.data),
    [shopCategories?.data]
  );

  const isFormValid = useMemo(() => {
    const hasNoErrors = Object.keys(formik.errors).length === 0;
    const isDirty = Object.keys(formik.touched).length > 0;
    const requiredFields = [
      'title',
      'phone',
      'description',
      'min_amount',
      'tax',
      'categories',
      'delivery_time_type',
      'delivery_time_from',
      'delivery_time_to',
      'price',
      'price_per_km',
      'address',
      'location',
      'images',
      'documents'
    ];
    
    const hasAllRequiredFields = requiredFields.every(field => {
      if (field === 'title' || field === 'description' || field === 'address') {
        return formik.values[field]?.[locale];
      }
      if (field === 'categories' || field === 'documents') {
        return formik.values[field]?.length > 0;
      }
      if (field === 'images') {
        return formik.values.images[0] && formik.values.images[1];
      }
      return Boolean(formik.values[field]);
    });

    return hasAllRequiredFields && isDirty && hasNoErrors;
  }, [formik.errors, formik.touched, formik.values, locale]);

  return (
    <>
      <SEO />
      <form onSubmit={formik.handleSubmit} noValidate>
        <BeSellerContainer formik={formik}>
          <div className={cls.sellerFormWrapper}>
            <div className={cls.formGrid}>
              <ShopForm title={t("general")} xs={12}>
                <ShopGeneralForm
                  formik={formik}
                  lang={locale}
                  shopCategories={formattedCategories}
                  tagList={formatCategories(tags?.data)}
                />
              </ShopForm>
              
              <ShopForm title={t("delivery.info")} xs={12}>
                <ShopDeliveryForm formik={formik} />
              </ShopForm>
              
              <div className={cls.addressSection}>
                <ShopForm title={t("address")} xs={12}>
                  <ShopAddressForm 
                    formik={formik} 
                    lang={locale} 
                    loading={isSubmitting}
                  />
                </ShopForm>
              </div>
            </div>
            
            <div className={cls.submitButton}>
              <PrimaryButton
                type="submit"
                disabled={!isFormValid || isSubmitting}
                loading={isSubmitting}
              >
                {t("submit")}
              </PrimaryButton>
            </div>
          </div>
        </BeSellerContainer>
      </form>
    </>
  );
}
