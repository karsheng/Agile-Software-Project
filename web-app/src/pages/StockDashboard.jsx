import React from "react";
import { stockList } from "../constants";
import Product from "../components/Product";

const StockDashboard = () => {
  return <Product productList={stockList} />;
};

export default StockDashboard;
