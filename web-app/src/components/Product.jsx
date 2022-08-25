import React, { useState, useEffect, useContext } from "react";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Plot from "react-plotly.js";
import { AuthContext } from "../Auth.js";
import { Redirect } from "react-router";
import { useParams } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import DateSelector from "../components/DateSelector";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Layout from "../components/Layout";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import MessageBar from "../components/MessageBar";
import Metrics from "../components/Metrics";
import ProductLogo from "../components/ProductLogo";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TwitterIcon from "@mui/icons-material/Twitter";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import TwitterSection from "../components/TwitterSection";
import SectionTitle from "../components/SectionTitle";
import NewsSection from "../components/NewsSection";
import GuideModal from "../components/Modal";
import { modalInfo } from "../config";

const Product = ({ productList, productType }) => {
  const [metrics, setMetrics] = useState({});
  const [metricsLoading, setMetricsLoading] = useState(false);

  const [priceData, setPriceData] = useState({});
  const [priceLoading, setPriceLoading] = useState(false);

  const [sentimentData, setSentimentData] = useState({});
  const [sentimentLoading, setSentimentLoading] = useState(false);
  const [filteredSentimentData, setFilteredSentimentData] = useState(null);

  const [newsData, setNewsData] = useState({});
  const [newsLoading, setNewsLoading] = useState(false);
  const [filteredNewsData, setFilteredNewsData] = useState(null);
  const [publishers, setPublishers] = useState(null);

  const d = new Date();
  d.setHours(22);
  const [endDate, setEndDate] = useState(d.toISOString().substring(0, 10));
  d.setMonth(d.getMonth() - 1);
  const [startDate, setStartDate] = useState(d.toISOString().substring(0, 10));
  const [fromDate, setFromDate] = useState(startDate);
  const [toDate, setToDate] = useState(endDate);
  const maxDate = new Date(endDate);
  maxDate.setDate(maxDate.getDate() - 7);

  const [messageBarOpen, setMessageBarOpen] = useState(false);
  const [message, setMessage] = useState(null);

  const { currentUser } = useContext(AuthContext);

  const { id: product } = useParams();

  if (!currentUser) {
    return <Redirect to="/" />;
  }
  const products = Object.keys(productList);
  if (products.findIndex((p) => p === product) < 0) {
    return <Redirect to="/error" />;
  }
  const productName = productList[product].fullName;

  const getSplicedData = (data, fd, td) => {
    const indices = [];
    data.forEach((d) => {
      const idx = [];

      idx.push(d["customdata"].findIndex((x) => x[0] >= fd && x[0] <= td));
      idx.push(d["customdata"].findLastIndex((x) => x[0] >= fd && x[0] <= td));
      indices.push(idx);
    });

    const splicedData = data.map((d, i) => ({
      ...d,
      customdata: d["customdata"].slice(indices[i][0], indices[i][1]),
      hovertext: d["hovertext"].slice(indices[i][0], indices[i][1]),
      x: d["x"].slice(indices[i][0], indices[i][1]),
      y: d["y"].slice(indices[i][0], indices[i][1]),
      marker: {
        ...d["marker"],
        size: d["marker"].size.slice(indices[i][0], indices[i][1]),
      },
    }));

    return splicedData;
  };

  const handleRelayout = (e) => {
    let fd = fromDate;
    let td = toDate;

    if (e["xaxis.range[0]"] && e["xaxis.range[1]"]) {
      fd = e["xaxis.range[0]"];
      td = e["xaxis.range[1]"];
      setMessage(`${fd.substring(0, 10)} to ${td.substring(0, 10)} selected`);
      setMessageBarOpen(true);
    }

    if (e["xaxis.autorange"] || e["yaxis.autorange"]) {
      fd = priceData.layout.xaxis.range[0];
      td = priceData.layout.xaxis.range[1];
      setMessage(`${fd.substring(0, 10)} to ${td.substring(0, 10)} selected`);
      setMessageBarOpen(true);
    }

    setFromDate(fd);
    setToDate(td);

    if (sentimentData.data && !sentimentLoading) {
      setFilteredSentimentData(getSplicedData(sentimentData.data, fd, td));
    }

    if (newsData.data && !newsLoading) {
      setFilteredNewsData(getSplicedData(newsData.data, fd, td));
    }
  };

  const getData = () => {
    currentUser.getIdToken().then((token) => {
      const headers = {
        authorization: token,
      };
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > maxDate) {
        alert("Please select a valid date range");
        return;
      }
      start.setHours(22);
      end.setHours(22);

      const startString = start.toISOString().substring(0, 10);
      const endString = end.toISOString().substring(0, 10);

      setPriceLoading(true);
      setSentimentLoading(true);
      setNewsLoading(true);
      setMetricsLoading(true);

      fetch(
        `/api/price_viz?product=${product}&productType=${productType}&start=${startString}&end=${endString}`,
        {
          headers: headers,
        }
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.error) throw data.error;
          setPriceData(data);
          const dates = data.data[0].x;
          setStartDate(dates[0]);
          setEndDate(dates[dates.length - 1]);
          setFromDate(dates[0]);
          setToDate(dates[dates.length - 1]);
        })
        .catch((e) => {
          alert(e);
          setPriceData({ data: [], layout: {} });
        })
        .finally(() => {
          setPriceLoading(false);
        });

      fetch(
        `/api/tweets_sentiment?product=${product}&productType=${productType}&start=${startString}&end=${endString}`,
        {
          headers: headers,
        }
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.error) throw data.error;
          setSentimentData(data);
        })
        .catch((e) => {
          alert(e);
          setSentimentData({ data: [], layout: {} });
        })
        .finally(() => {
          setSentimentLoading(false);
        });

      fetch(
        `/api/news_sentiment?product=${product}&productType=${productType}&start=${startString}&end=${endString}`,
        {
          headers: headers,
        }
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.error) throw data.error;
          const { fig, publishers } = data;
          setNewsData(fig);
          setFilteredNewsData(fig.data);
          setPublishers(publishers);
        })
        .catch((e) => {
          alert(e);
          setNewsData({ data: [], layout: {} });
          setPublishers([]);
        })
        .finally(() => {
          setNewsLoading(false);
        });

      fetch(`/api/metrics?product=${product}&productType=${productType}`, {
        headers: headers,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) throw data.error;
          setMetrics(data);
        })
        .catch((e) => {
          alert(e);
        })
        .finally(() => {
          setMetricsLoading(false);
        });
    });
  };

  const metricsProps = (title, data) => {
    let currentValue = "-";
    let percentage = "-";
    if (data) {
      if (data.currentValue) {
        currentValue = data.currentValue;
        percentage = data.percentage;
      }
    }
    return {
      title,
      value: currentValue,
      percentage,
      arrowIcon:
        parseFloat(percentage) > 0 ? (
          <ArrowUpwardIcon color="success" />
        ) : (
          <ArrowDownwardIcon color="error" />
        ),
    };
  };

  const sentimentCategory = (value) => {
    if (value) {
      if (value < -0.33) {
        return `Negative (${value})`;
      } else if (value >= -0.33 && value <= 0.33) {
        return `Neutral (${value})`;
      } else if (value > 0.33) {
        return `Positive (${value})`;
      }
    }

    return "-";
  };

  useEffect(() => {
    getData();
  }, []);

  const Title = () => {
    return (
      <Typography
        component="h1"
        variant="h6"
        color="inherit"
        noWrap
        sx={{ flexGrow: 1 }}
      >
        <Stack direction="row" spacing={1}>
          <ProductLogo
            product={product}
            productName={productName}
            productType={productType}
            size={30}
          />
          <span>{productName} Dashboard</span>
        </Stack>
      </Typography>
    );
  };
  return (
    <Layout title={<Title />}>
      <Stack sx={{ mb: 2 }} spacing={1} direction="row">
        <DateSelector
          label="Start"
          setValue={setStartDate}
          value={startDate}
          maxDate={maxDate}
        />
        <DateSelector label="End" setValue={setEndDate} value={endDate} />
        <Button onClick={getData} size="large" variant="contained">
          Get Data
        </Button>
        <GuideModal
          title={modalInfo.dataSelector.title}
          message={modalInfo.dataSelector.message}
        />
      </Stack>
      <SectionTitle typoComponent="h1" variant="h4">
        <Stack sx={{ mb: 2 }} spacing={1} direction="row">
          <AnalyticsIcon fontSize="large" />
          <div> Key Metrics</div>
          <GuideModal
            title={modalInfo.keyMetrics.title}
            message={modalInfo.keyMetrics.message}
          />
        </Stack>
      </SectionTitle>
      <Grid container spacing={3}>
        {/* Metrics */}
        <Grid item xs={12} md={4} lg={4}>
          {!metricsLoading ? (
            <Metrics
              {...metricsProps("Current Price", metrics.prices)}
              value={metrics.prices ? `$ ${metrics.prices.currentValue}` : "-"}
              icon={<AttachMoneyIcon fontSize="large" />}
            />
          ) : (
            <Paper
              sx={{
                p: 2,
                alignItems: "center",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CircularProgress />
            </Paper>
          )}
        </Grid>
        <Grid item xs={12} md={4} lg={4}>
          {!metricsLoading ? (
            <Metrics
              {...metricsProps("Tweets Sentiment", metrics.tweets)}
              value={
                metrics.tweets
                  ? sentimentCategory(metrics.tweets.currentValue)
                  : "-"
              }
              icon={<TwitterIcon fontSize="large" />}
            />
          ) : (
            <Paper
              sx={{
                p: 2,
                alignItems: "center",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CircularProgress />
            </Paper>
          )}
        </Grid>
        <Grid item xs={12} md={4} lg={4}>
          {!metricsLoading ? (
            <Metrics
              {...metricsProps("News Sentiment", metrics.news)}
              value={
                metrics.news
                  ? sentimentCategory(metrics.news.currentValue)
                  : "-"
              }
              icon={<NewspaperIcon fontSize="large" />}
            />
          ) : (
            <Paper
              sx={{
                p: 2,
                alignItems: "center",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CircularProgress />
            </Paper>
          )}
        </Grid>
        {/* Price and Sentiments Plot */}
        <Grid item xs={12}>
          <Grid item xs={12}>
            <SectionTitle typoComponent="h1" variant="h4">
              <Stack direction="row" spacing={1}>
                <ProductLogo
                  product={product}
                  productName={productName}
                  productType={productType}
                  size={36}
                />
                <span>{productName} Price & Sentiments</span>
                <GuideModal
                  title={modalInfo.priceAndSentiment.title}
                  message={modalInfo.priceAndSentiment.message}
                />
              </Stack>
            </SectionTitle>
          </Grid>
          <br />
          <Paper
            sx={{
              p: 2,
              alignItems: "center",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {priceData.data && !priceLoading ? (
              <Plot
                data={priceData.data}
                useResizeHandler={true}
                layout={{
                  ...priceData.layout,
                  margin: {
                    l: 50,
                    r: 50,
                    b: 50,
                    t: 30,
                    pad: 4,
                  },
                  autosize: true,
                }}
                style={{ width: "100%" }}
                onRelayout={handleRelayout}
              />
            ) : (
              <CircularProgress />
            )}
          </Paper>
        </Grid>
        {/* Twitter Section */}
        <TwitterSection
          sentimentData={
            filteredSentimentData ? filteredSentimentData : sentimentData.data
          }
          layout={sentimentData.layout}
          filteredSentimentData={filteredSentimentData}
          fromDate={fromDate}
          toDate={toDate}
          product={product}
          productName={productName}
          productType={productType}
          sentimentLoading={sentimentLoading}
        />
        <NewsSection
          sentimentData={filteredNewsData ? filteredNewsData : newsData.data}
          layout={newsData.layout}
          fromDate={fromDate}
          toDate={toDate}
          product={product}
          productName={productName}
          productType={productType}
          sentimentLoading={newsLoading}
          publishers={publishers ? publishers : []}
        />
      </Grid>
      <MessageBar
        open={messageBarOpen}
        setOpen={setMessageBarOpen}
        message={message}
      />
    </Layout>
  );
};

export default Product;
