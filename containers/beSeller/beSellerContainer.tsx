import React, { useEffect } from "react";
import cls from "./beSellerContainer.module.scss";
import i18n from "i18n";
import { FormikProps } from "formik";
import { useTranslation } from "react-i18next";
import { useAuth } from "contexts/auth/auth.context";
import { Grid, useMediaQuery } from "@mui/material";
import useModal from "hooks/useModal";
import BeSellerModal from "components/beSellerModal/beSellerModal";
import { useRouter } from "next/router";
import ShopForm from "components/shopForm/shopForm";
import Unauthorized from "components/unauthorized/unauthorized";

type Props = {
  children: any;
  formik: FormikProps<any>;
};

export default function BeSellerContainer({ children, formik }: Props) {
  const { t } = useTranslation();
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const { user, isAuthenticated } = useAuth();
  const [openWaitingModal, handleOpenWaitingModal, handleCloseWaitingModal] =
    useModal(Boolean(user?.shop));
  const { push } = useRouter();

  const closeModal = () => {
    push("/");
    handleCloseWaitingModal();
  };

  useEffect(() => {
    if (!openWaitingModal && user?.shop) {
      handleOpenWaitingModal();
    }
  }, [user?.shop]);

  return (
    <div className={cls.root}>
      <div className={cls.container}>
        <div className="container">
          <div className={cls.header}>
            <h1 className={cls.title}>{t("be.seller")}</h1>
          </div>
        </div>
      </div>
      <div className="container">
        <div className={cls.wrapper}>
          {!!user?.empty_p && (
            <div className={cls.alert}>{t("have.not.password")}</div>
          )}
          <Grid container spacing={isDesktop ? 4 : 1}>
            {isAuthenticated ? (
              React.Children.map(children, (child) => {
                return React.cloneElement(child, {
                  formik,
                  lang: i18n.language,
                  loading: formik.isSubmitting,
                });
              })
            ) : (
              <ShopForm xs={12} md={8}>
                <Unauthorized text={t("sign.in.be.seller")} />
              </ShopForm>
            )}
          </Grid>
        </div>
      </div>
      <BeSellerModal open={openWaitingModal} handleClose={closeModal} />
    </div>
  );
}
