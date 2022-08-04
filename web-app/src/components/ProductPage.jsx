import React, { useState, useEffect, useContext } from "react";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import MuiDrawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { mainListItems, secondaryListItems } from "./listItems";
import Plot from "react-plotly.js";
import { AuthContext } from "../Auth.js";
import { Redirect } from "react-router";
import { useParams } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import DateSelector from "./DateSelector";
import Copyright from "./Copyright";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TopTweets from "./TopTweets";
import TwitterIcon from "@mui/icons-material/Twitter";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

const mdTheme = createTheme();

const ProductPage = () => {
  const [priceData, setPriceData] = useState({});
  const [sentimentData, setSentimentData] = useState({});
  const [priceLoading, setPriceLoading] = useState(false);
  const [sentimentLoading, setSentimentLoading] = useState(false);
  const [filteredSentimentData, setFilteredSentimentData] = useState(null);
  const { id: product } = useParams();

  const d = new Date();
  d.setHours(22);
  const [endDate, setEndDate] = useState(d.toISOString().substring(0, 10));
  d.setFullYear(d.getFullYear() - 1);
  const [startDate, setStartDate] = useState(d.toISOString().substring(0, 10));
  const { currentUser } = useContext(AuthContext);
  const [open, setOpen] = useState(true);

  const [fromDate, setFromDate] = useState(startDate);
  const [toDate, setToDate] = useState(endDate);

  if (!currentUser) {
    return <Redirect to="/" />;
  }
  const products = ["btc"];
  if (products.findIndex((p) => p == product) < 0) {
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

  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <ThemeProvider theme={mdTheme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar position="absolute" open={open}>
          <Toolbar
            sx={{
              pr: "24px", // keep right padding when drawer closed
            }}
          >
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                marginRight: "36px",
                ...(open && { display: "none" }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              Dashboard
            </Typography>
            <IconButton color="inherit">
              <Badge badgeContent={4} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open}>
          <Toolbar
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              px: [1],
            }}
          >
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider />
          <List component="nav">
            {mainListItems}
            <Divider sx={{ my: 1 }} />
            {secondaryListItems}
          </List>
        </Drawer>
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === "light"
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: "100vh",
            overflow: "auto",
          }}
        >
          <Toolbar />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Stack sx={{ mb: 2 }} spacing={1} direction="row">
              <DateSelector
                label="Start"
                setValue={setStartDate}
                value={startDate}
              />
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
            <Copyright sx={{ pt: 4 }} />
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default ProductPage;
