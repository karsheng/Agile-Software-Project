import React from "react";
import TopTweets from "./TopTweets";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TwitterIcon from "@mui/icons-material/Twitter";
import Stack from "@mui/material/Stack";
import ProductLogo from "./ProductLogo";
import Plot from "react-plotly.js";
import CircularProgress from "@mui/material/CircularProgress";

const TwitterSection = ({
  sentimentData,
  fromDate,
  toDate,
  product,
  productName,
  sentimentLoading,
  layout,
}) => {
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
  return (
    <>
      <Grid item xs={12}>
        <Typography
          component="h2"
          variant="h5"
          color="inherit"
          noWrap
          sx={{ flexGrow: 1, p: 1 }}
        >
          <TwitterIcon style={{ color: "#00acee" }} fontSize="large" /> Twitter
          Section
        </Typography>
        <Paper
          sx={{
            p: 2,
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography
            component="h2"
            variant="h5"
            color="inherit"
            noWrap
            sx={{ flexGrow: 1 }}
          >
            <Stack direction="row" spacing={1}>
              <span>Tweets Sentiment on </span>
              <ProductLogo
                product={product}
                productName={productName}
                size={30}
              />
              <span>{` ${productName} from ${fromDate.substring(
                0,
                10
              )} - ${toDate.substring(0, 10)}`}</span>
            </Stack>
          </Typography>
          {sentimentData && !sentimentLoading ? (
            <Plot
              data={sentimentData}
              useResizeHandler={true}
              layout={{
                ...layout,
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
          <Typography
            component="h2"
            variant="h5"
            color="inherit"
            noWrap
            sx={{ flexGrow: 1, p: 2 }}
          >
            Negative Tweets <ThumbDownIcon color="error" />
          </Typography>
          {sentimentData && !sentimentLoading ? (
            <div>
              <TopTweets rows={getTopTweets(sentimentData[2])} />
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
          <Typography
            component="h2"
            variant="h5"
            color="inherit"
            noWrap
            sx={{ flexGrow: 1, p: 2 }}
          >
            Positive Tweets <ThumbUpIcon color="success" />
          </Typography>
          {sentimentData && !sentimentLoading ? (
            <div>
              <TopTweets rows={getTopTweets(sentimentData[0])} />
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
    </>
  );
};

export default TwitterSection;
