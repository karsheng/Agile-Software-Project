import React from "react";
import Layout from "../components/Layout";
import { cryptoList, stockList } from "../constants";
import ProductGrid from "../components/ProductGrid";
import SectionTitle from "../components/SectionTitle";
import LayoutTitle from "../components/LayoutTitle";

const WatchList = () => {
  return (
    <Layout title={<LayoutTitle text="Watchlist" />}>
      <SectionTitle typoComponent="h1" variant="h4">
        <div>Stocks</div>
      </SectionTitle>
      <ProductGrid productType="stocks" productList={stockList} />

      <SectionTitle typoComponent="h1" variant="h4">
        <div>CryptoCurrencies</div>
      </SectionTitle>
      <ProductGrid productType="cryptos" productList={cryptoList} />
    </Layout>
  );
};

export default WatchList;
