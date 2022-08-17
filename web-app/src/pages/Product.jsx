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
import { productList } from "../constants";
import Divider from "@mui/material/Divider";
import MessageBar from "../components/MessageBar";
import Metrics from "../components/Metrics";
import ProductLogo from "../components/ProductLogo";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TwitterIcon from "@mui/icons-material/Twitter";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import TwitterSection from "../components/TwitterSection";
import { MINDAYS } from "../constants";

const Product = () => {
  const [metrics, setMetrics] = useState({});
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [priceData, setPriceData] = useState({});
  const [sentimentData, setSentimentData] = useState({});
  const [priceLoading, setPriceLoading] = useState(false);
  const [sentimentLoading, setSentimentLoading] = useState(false);
  const [filteredSentimentData, setFilteredSentimentData] = useState(null);
  const { id: product } = useParams();
  const productName = productList[product].fullName;

  const d = new Date();
  d.setHours(22);
  const [endDate, setEndDate] = useState(d.toISOString().substring(0, 10));
  d.setMonth(d.getMonth() - 1);
  const [startDate, setStartDate] = useState(d.toISOString().substring(0, 10));
  const { currentUser } = useContext(AuthContext);

  const [fromDate, setFromDate] = useState(startDate);
  const [toDate, setToDate] = useState(endDate);

  const [messageBarOpen, setMessageBarOpen] = useState(false);
  const [message, setMessage] = useState(null);

  const maxDate = new Date(endDate);
  maxDate.setDate(maxDate.getDate() - 7);

  if (!currentUser) {
    return <Redirect to="/" />;
  }
  const products = Object.keys(productList);
  if (products.findIndex((p) => p === product) < 0) {
    return <Redirect to="/error" />;
  }

  const handleRelayout = (e) => {
    if (sentimentData.data && !sentimentLoading) {
      if (e["xaxis.range[0]"] && e["xaxis.range[1]"]) {
        const fd = e["xaxis.range[0]"];
        const td = e["xaxis.range[1]"];
        setFromDate(fd);
        setToDate(td);
        const { data } = sentimentData;
        const indices = [];

        data.forEach((d) => {
          const idx = [];

          idx.push(d["customdata"].findIndex((x) => x[0] >= fd && x[0] <= td));
          idx.push(
            d["customdata"].findLastIndex((x) => x[0] >= fd && x[0] <= td)
          );
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

        setFilteredSentimentData(splicedData);
        setMessage(`${fd.substring(0, 10)} to ${td.substring(0, 10)} selected`);
        setMessageBarOpen(true);
      }

      if (e["xaxis.autorange"] || e["yaxis.autorange"]) {
        setFilteredSentimentData(sentimentData.data);
        const fd = priceData.layout.xaxis.range[0];
        const td = priceData.layout.xaxis.range[1];

        setFromDate(fd);
        setToDate(td);
        setMessage(`${fd.substring(0, 10)} to ${td.substring(0, 10)} selected`);
        setMessageBarOpen(true);
      }
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
      setMetricsLoading(true);

      fetch(
        `/api/price_viz?product=${product}&start=${startString}&end=${endString}`,
        {
          headers: headers,
        }
      )
        .then((res) => res.json())
        .then((data) => {
          setPriceData(data);
          const dates = data.data[0].x;
          setStartDate(dates[0]);
          setEndDate(dates[dates.length - 1]);
          setFromDate(dates[0]);
          setToDate(dates[dates.length - 1]);
        })
        .finally(() => {
          setPriceLoading(false);
        });

      fetch(
        `/api/sentiment?product=${product}&start=${startString}&end=${endString}`,
        {
          headers: headers,
        }
      )
        .then((res) => res.json())
        .then((data) => {
          setSentimentData(data);
        })
        .finally(() => {
          setSentimentLoading(false);
        });
      fetch(`/api/metrics?product=${product}`, {
        headers: headers,
      })
        .then((res) => res.json())
        .then((data) => {
          setMetrics(data);
        })
        .finally(() => {
          setMetricsLoading(false);
        });
    });
  };

  const metricsProps = (title, data) => {
    const { currentValue, percentage } = data;
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
    if (value < -0.33) {
      return `Negative (${value})`;
    } else if (value >= -0.33 && value <= 0.33) {
      return `Neutral (${value})`;
    } else {
      return `Positive (${value})`;
    }
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
          <ProductLogo product={product} productName={productName} size={30} />
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
      </Stack>
      <Grid container spacing={3}>
        {/* Metrics */}
        <Grid item xs={12} md={4} lg={4}>
          {metrics.prices && !metricsLoading ? (
            <Metrics
              {...metricsProps("Current Price", metrics.prices)}
              value={`$ ${metrics.prices.currentValue}`}
              icon={<AttachMoneyIcon fontSize="large" />}
            />
          ) : (
            <CircularProgress />
          )}
        </Grid>
        <Grid item xs={12} md={4} lg={4}>
          {metrics.tweets && !metricsLoading ? (
            <Metrics
              {...metricsProps("Tweets Sentiment", metrics.tweets)}
              value={sentimentCategory(metrics.tweets.currentValue)}
              icon={
                <TwitterIcon style={{ color: "#00acee" }} fontSize="large" />
              }
            />
          ) : (
            <CircularProgress />
          )}
        </Grid>
        <Grid item xs={12} md={4} lg={4}>
          {metrics.news && !metricsLoading ? (
            <Metrics
              {...metricsProps("News Sentiment", metrics.news)}
              value={sentimentCategory(metrics.news.currentValue)}
              icon={<NewspaperIcon fontSize="large" />}
            />
          ) : (
            <CircularProgress />
          )}
        </Grid>
        {/* Price and Sentiments Plot */}
        <Grid item xs={12}>
          <Grid item xs={12}>
            <Typography
              component="h1"
              variant="h4"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1, p: 2 }}
            >
              <Stack direction="row" spacing={1}>
                <ProductLogo
                  product={product}
                  productName={productName}
                  size={36}
                />
                <span>{productName} Price & Sentiments</span>
              </Stack>
            </Typography>
            <Divider light />
          </Grid>
          <Divider light />
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
          sentimentData={sentimentData}
          filteredSentimentData={filteredSentimentData}
          fromDate={fromDate}
          toDate={toDate}
          product={product}
          productName={productName}
          sentimentLoading={sentimentLoading}
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
