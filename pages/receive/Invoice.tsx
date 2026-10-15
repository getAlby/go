import React from "react";
import { useTranslation } from "react-i18next";
import { CreateInvoice } from "~/components/CreateInvoice";
import Screen from "~/components/Screen";

export function Invoice() {
  const { t } = useTranslation();
  return (
    <>
      <Screen title={t("receive.invoice.title")} animation="slide_from_left" />
      <CreateInvoice />
    </>
  );
}
