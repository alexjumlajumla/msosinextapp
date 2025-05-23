import React, { useContext } from "react";
import Link from "next/link";
import cls from "./mobileHeader.module.scss";
import { BrandLogo, BrandLogoDark } from "components/icons";
import Search2LineIcon from "remixicon-react/Search2LineIcon";
import { ThemeContext } from "contexts/theme/theme.context";
import dynamic from "next/dynamic";
import AddressContainer from "containers/addressContainer/addressContainer";
import useModal from "hooks/useModal";
import NotificationStats from "components/notificationStats/notificationStats";

const AppDrawer = dynamic(() => import("components/appDrawer/appDrawer"));
const MobileSearchContainer = dynamic(
  () => import("containers/mobileSearchContainer/mobileSearchContainer"),
);

interface MobileHeaderProps {
  isShopDetailPage?: boolean;
}

export default function MobileHeader({
  isShopDetailPage = false,
}: MobileHeaderProps) {
  const { isDarkMode } = useContext(ThemeContext);
  const [appDrawer, handleOpenAppDrawer, handleCloseAppDrawer] = useModal();
  const [searchModal, handleOpenSearchModal, handleCloseSearchModal] =
    useModal();

  return (
    <header
      className={`${cls.header} ${isShopDetailPage ? "" : cls.stickyHeader}`}
    >
      <div className={cls.navItem}>
        <button className={cls.menuBtn} onClick={handleOpenAppDrawer}>
          <span className="sr-only">menu</span>
        </button>
        <Link href="/" className={cls.brandLogo}>
          {isDarkMode ? <BrandLogoDark /> : <BrandLogo />}
        </Link>
        <div className={cls.actions}>
          <NotificationStats />
          <AddressContainer />
          <button className={cls.iconBtn} onClick={handleOpenSearchModal}>
            <Search2LineIcon />
          </button>
        </div>
      </div>

      <AppDrawer open={appDrawer} handleClose={handleCloseAppDrawer} />
      <MobileSearchContainer
        open={searchModal}
        onClose={handleCloseSearchModal}
        fullScreen
      />
    </header>
  );
}
