import React from "react";
import Products from "../components/Products";
import { cryptoList } from "../constants";

const CryptoList = () => {
  return (
    <>
      <Products
        productList={cryptoList}
        title={"CryptoCurrencies"}
        productType="cryptos"
      />
    </>
  );
};

export default CryptoList;
