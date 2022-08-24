import React from "react";
import { stockList } from "../constants";
import ProductGrid from "../components/ProductGrid";
import SectionTitle from "../components/SectionTitle";
import LayoutTitle from "../components/LayoutTitle";
import Layout from "../components/Layout";

const StockList = () => {
  return (
    <Layout title={<LayoutTitle text="Stocks" />}>
      <SectionTitle typoComponent="h1" variant="h4">
        <div>Stocks</div>
      </SectionTitle>
      <ProductGrid
        productType="stocks"
        productList={stockList}
        showAll={true}
      />
    </Layout>
  );
};

export default StockList;
