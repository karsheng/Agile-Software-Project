import React from "react";
import Typography from "@mui/material/Typography";
import Layout from "../components/Layout";
import { cryptoList, stockList } from "../constants";
import ProductGrid from "../components/ProductGrid";
import SectionTitle from "../components/SectionTitle";

const WatchList = () => {
  const Title = () => {
    return (
      <Typography
        component="h1"
        variant="h6"
        color="inherit"
        noWrap
        sx={{ flexGrow: 1 }}
      >
        WatchList
      </Typography>
    );
  };

  return (
    <Layout title={<Title />}>
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
