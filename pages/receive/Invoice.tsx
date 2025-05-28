import React from "react";
import { CreateInvoice } from "~/components/CreateInvoice";
import Screen from "~/components/Screen";

export function Invoice() {
  return (
    <>
      <Screen title="Invoice" animation="slide_from_left" />
      <CreateInvoice />
    </>
  );
}
