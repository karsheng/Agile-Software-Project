import React from "react";
import Products from "../components/Products";
import { stockList } from "../constants";

const StockList = () => {
  return (
    <>
      <Products productList={stockList} title="Stocks" productType="stocks" />
    </>
  );
};

export default StockList;
