import React from "react";
import Layout from "../components/Layout";
import { cryptoList, stockList } from "../constants";
import ProductGrid from "../components/ProductGrid";
import SectionTitle from "../components/SectionTitle";
import LayoutTitle from "../components/LayoutTitle";
import Stack from "@mui/material/Stack";
import GuideModal from "../components/Modal";
import { modalInfo } from "../config";


const WatchList = () => {
  return (
    <Layout title={<LayoutTitle text="Watchlist" />}>
      <SectionTitle typoComponent="h1" variant="h4">
        <Stack sx={{ mb: 2 }} spacing={1} direction="row">
          <div>Stocks</div>
          <GuideModal
            title = {modalInfo.watchList.title}
            message = {modalInfo.watchList.message}
          />
        </Stack>
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
