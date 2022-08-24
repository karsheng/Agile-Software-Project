import React from "react";
import { stockList } from "../constants";
import Product from "../components/Product";

const StockDashboard = () => {
  return <Product productList={stockList} productType="stocks" />;
};

export default StockDashboard;
