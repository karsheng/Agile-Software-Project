import React from "react";
import { cryptoList } from "../constants";
import Product from "../components/Product";

const CryptoDashboard = () => {
  return <Product productList={cryptoList} productType={"cryptos"} />;
};

export default CryptoDashboard;
