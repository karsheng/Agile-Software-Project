import React from "react";
import Products from "../components/Products";
import { cryptoList } from "../constants";

const CryptoPage = () => {
  return (
    <>
      <Products productList={cryptoList} title={"CryptoCurrencies"} />
    </>
  );
};

export default CryptoPage;
