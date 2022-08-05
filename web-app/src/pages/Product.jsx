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
import TopTweets from "../components/TopTweets";
import TwitterIcon from "@mui/icons-material/Twitter";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import Layout from "../components/Layout";
import { productList } from "../constants";

const Product = () => {
  const [priceData, setPriceData] = useState({});
  const [sentimentData, setSentimentData] = useState({});
  const [priceLoading, setPriceLoading] = useState(false);
  const [sentimentLoading, setSentimentLoading] = useState(false);
  const [filteredSentimentData, setFilteredSentimentData] = useState(null);
  const { id: product } = useParams();

  const d = new Date();
  d.setHours(22);
  const [endDate, setEndDate] = useState(d.toISOString().substring(0, 10));
  d.setMonth(d.getMonth() - 2);
  const [startDate, setStartDate] = useState(d.toISOString().substring(0, 10));
  const { currentUser } = useContext(AuthContext);

  const [fromDate, setFromDate] = useState(startDate);
  const [toDate, setToDate] = useState(endDate);

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
        setFromDate(e["xaxis.range[0]"]);
        setToDate(e["xaxis.range[1]"]);
        const { data } = sentimentData;
        const indices = [];

        data.forEach((d) => {
          const idx = [];

          idx.push(
            d["customdata"].findIndex((x) => x[0] >= e["xaxis.range[0]"])
          );
          idx.push(
            d["customdata"].findLastIndex((x) => x[0] <= e["xaxis.range[1]"])
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
      }

      if (e["xaxis.autorange"] || e["yaxis.autorange"]) {
        setFilteredSentimentData(sentimentData.data);
        setFromDate(priceData.layout.xaxis.range[0]);
        setToDate(priceData.layout.xaxis.range[1]);
      }
    }
  };

  const getTopTweets = (data) => {
    const followers = data["customdata"].map((d) => d[1]);
    const followersSorted = followers.slice().sort((a, b) => a - b);
    followersSorted.reverse();

    const topTweets = followersSorted.map((x, id) => {
      const i = followers.findIndex((y) => y === x);
      return {
        id: id,
        text: data["hovertext"][i],
        followers: followers[i],
        polarity: data["x"][i],
      };
    });

    return topTweets;
  };

  const getData = () => {
    currentUser.getIdToken().then((token) => {
      const headers = {
        authorization: token,
      };
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(22);
      end.setHours(22);

      const startString = start.toISOString().substring(0, 10);
      const endString = end.toISOString().substring(0, 10);

      setPriceLoading(true);
      setSentimentLoading(true);

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
    });
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <Layout>
      <Stack sx={{ mb: 2 }} spacing={1} direction="row">
        <DateSelector label="Start" setValue={setStartDate} value={startDate} />
        <DateSelector label="End" setValue={setEndDate} value={endDate} />
        <Button onClick={getData} size="large" variant="contained">
          Get Data
        </Button>
      </Stack>
      <Grid container spacing={3}>
        <Grid item xs={12}>
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
                layout={{ ...priceData.layout, autosize: true }}
                style={{ width: "100%" }}
                onRelayout={handleRelayout}
              />
            ) : (
              <CircularProgress />
            )}
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 2,
              alignItems: "center",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {sentimentData.data && !sentimentLoading ? (
              <Plot
                data={
                  filteredSentimentData
                    ? filteredSentimentData
                    : sentimentData.data
                }
                useResizeHandler={true}
                layout={{
                  ...sentimentData.layout,
                  title: `Tweets Sentiment from ${fromDate.substring(
                    0,
                    10
                  )} - ${toDate.substring(0, 10)}`,
                  autosize: true,
                }}
                style={{ width: "100%" }}
              />
            ) : (
              <CircularProgress />
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          <Paper
            sx={{
              p: 2,
              alignItems: "center",
            }}
          >
            {sentimentData.data && !sentimentLoading ? (
              <div>
                <Typography
                  component="h1"
                  variant="h4"
                  color="inherit"
                  noWrap
                  sx={{ flexGrow: 1 }}
                >
                  Negative Tweets <TwitterIcon /> <ThumbDownIcon />
                </Typography>
                <TopTweets
                  rows={
                    filteredSentimentData
                      ? getTopTweets(filteredSentimentData[2])
                      : getTopTweets(sentimentData.data[2])
                  }
                />
              </div>
            ) : (
              <Stack
                sx={{
                  alignItems: "center",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CircularProgress />
              </Stack>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          <Paper
            sx={{
              p: 2,
              alignItems: "center",
            }}
          >
            {sentimentData.data && !sentimentLoading ? (
              <div>
                <Typography
                  component="h1"
                  variant="h4"
                  color="inherit"
                  noWrap
                  sx={{ flexGrow: 1 }}
                >
                  Positive Tweets <TwitterIcon /> <ThumbUpIcon />
                </Typography>
                <TopTweets
                  rows={
                    filteredSentimentData
                      ? getTopTweets(filteredSentimentData[1])
                      : getTopTweets(sentimentData.data[1])
                  }
                />
              </div>
            ) : (
              <Stack
                sx={{
                  alignItems: "center",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CircularProgress />
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Product;
