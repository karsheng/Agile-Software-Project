import React from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import Stack from "@mui/material/Stack";
import ProductLogo from "./ProductLogo";
import Plot from "react-plotly.js";
import CircularProgress from "@mui/material/CircularProgress";
import SectionTitle from "./SectionTitle";

const NewsSection = ({
  sentimentData,
  fromDate,
  toDate,
  product,
  productName,
  sentimentLoading,
  layout,
}) => {
  return (
    <>
      <Grid item xs={12}>
        <SectionTitle typoComponent="h1" variant="h4">
          <Stack sx={{ mb: 2 }} spacing={1} direction="row">
            <NewspaperIcon fontSize="large" /> <div>News Section</div>
          </Stack>
        </SectionTitle>
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
              <span>News Sentiment on </span>
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
      <Grid item xs={12} md={12} lg={12}>
        <Paper
          sx={{
            p: 2,
            alignItems: "center",
          }}
        >
          <SectionTitle typoComponent="h2" variant="h5">
            <Stack spacing={1} direction="row">
              News
            </Stack>
          </SectionTitle>
          {sentimentData && !sentimentLoading ? (
            <div>news news news</div>
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

export default NewsSection;
