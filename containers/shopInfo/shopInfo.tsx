import React, { useEffect } from "react";
import cls from "./shopInfo.module.scss";
import { IShop } from "interfaces";
import useModal from "hooks/useModal";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "@mui/material";
import ModalContainer from "containers/modal/modal";
import MobileDrawer from "containers/drawer/mobileDrawer";
import ShopInfoDetails from "components/shopInfoDetails/shopInfoDetails";
import { useAppDispatch, useAppSelector } from "hooks/useRedux";
import { clearOrder, selectOrder } from "redux/slices/order";
import { useRouter } from "next/router";

type Props = {
  data?: IShop;
};

export default function ShopInfo({ data }: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const { order } = useAppSelector(selectOrder);
  const [modal, handleOpen, handleClose] = useModal();
  const { push } = useRouter();

  useEffect(() => {
    if (order.shop_id !== data?.id) {
      dispatch(clearOrder());
    }
  }, [data]);

  return (
    <div className={cls.flex}>
      <button className={cls.textBtn} onClick={handleOpen}>
        {t("more.info")}
      </button>
      <button
        className={cls.textBtn}
        onClick={() =>
          push({
            pathname: "/recipes",
            query: { shop_id: data?.id },
          })
        }
      >
        {t("recipes")}
      </button>

      {isDesktop ? (
        <ModalContainer open={modal} onClose={handleClose} closable={false}>
          {modal && <ShopInfoDetails data={data} onClose={handleClose} />}
        </ModalContainer>
      ) : (
        <MobileDrawer open={modal} onClose={handleClose}>
          {modal && <ShopInfoDetails data={data} onClose={handleClose} />}
        </MobileDrawer>
      )}
    </div>
  );
}
