import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import NewPhoneVerify from "./newPhoneVerify";

interface Props {
  handleClose: () => void;
}

export default function EditPhone({ handleClose }: Props) {
  const [phone, setPhone] = useState("");
  const [callback, setCallback] = useState<any>(undefined);
  const { t } = useTranslation();

  return (
    <div>
      {!!callback ? (
        <NewPhoneVerify
          phone={phone}
          callback={callback}
          setCallback={setCallback}
          handleClose={handleClose}
        />
      ) : (
        <form onSubmit={(e) => {
          e.preventDefault();
          // Add your phone verification logic here
        }}>
          <input 
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("enter.phone")}
          />
        </form>
      )}
    </div>
  );
}
