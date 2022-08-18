import React from "react";
import { cryptoList } from "../constants";
import ProductGrid from "../components/ProductGrid";
import SectionTitle from "../components/SectionTitle";
import LayoutTitle from "../components/LayoutTitle";
import Layout from "../components/Layout";

const CryptoList = () => {
  return (
    <Layout title={<LayoutTitle text="Cryptocurrencies" />}>
      <SectionTitle typoComponent="h1" variant="h4">
        <div>CryptoCurrencies</div>
      </SectionTitle>
      <ProductGrid
        productType="cryptos"
        productList={cryptoList}
        showAll={true}
      />
    </Layout>
  );
};

export default CryptoList;
