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
import CircularProgress from "@mui/material/CircularProgress";
import DateSelector from "./DateSelector";
import Copyright from "./Copyright";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

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

function DashboardContent() {
  const [vizData, setVizData] = useState({});
  const [sentimentData, setSentimentData] = useState({});
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const { currentUser } = useContext(AuthContext);
  const [open, setOpen] = useState(true);

  if (!currentUser) {
    return <Redirect to="/" />;
  }

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
      fetch(
        `/api/price_viz?product=btc&start=${startString}&end=${endString}`,
        {
          headers: headers,
        }
      )
        .then((res) => res.json())
        .then((data) => {
          setVizData(data);
          const dates = data.data[0].x;
          setStartDate(dates[0]);
          setEndDate(dates[dates.length - 1]);
        });

      fetch("/api/btc_sentiment", { headers: headers })
        .then((res) => res.json())
        .then((data) => {
          setSentimentData(data);
        });
    });
  };

  useEffect(() => {
    currentUser.getIdToken().then((token) => {
      const headers = {
        authorization: token,
      };

      fetch(`/api/price_viz?product=btc&start=2021-01-01&end=2022-07-01}`, {
        headers: headers,
      })
        .then((res) => res.json())
        .then((data) => {
          setVizData(data);
          const dates = data.data[0].x;
          setStartDate(dates[0]);
          setEndDate(dates[dates.length - 1]);
        });

      fetch("/api/btc_sentiment", { headers: headers })
        .then((res) => res.json())
        .then((data) => {
          setSentimentData(data);
        });
    });
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
                <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
                  {vizData.data ? (
                    <Plot
                      data={vizData.data}
                      layout={{
                        ...vizData.layout,
                        xaxis: { rangeslider: { disabled: false } },
                      }}
                      config={{ responsive: false }}
                      onRelayout={(e) => console.log(e)}
                    />
                  ) : (
                    <CircularProgress />
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
                  {sentimentData.data ? (
                    <Plot
                      data={sentimentData.data}
                      layout={{
                        ...sentimentData.layout,
                        title: "hello",
                      }}
                      config={{ responsive: false }}
                    />
                  ) : (
                    <CircularProgress />
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
}

export default function Dashboard() {
  return <DashboardContent />;
}
