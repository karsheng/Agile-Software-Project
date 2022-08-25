import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import Stack from "@mui/material/Stack";
import ProductLogo from "./ProductLogo";
import Plot from "react-plotly.js";
import CircularProgress from "@mui/material/CircularProgress";
import SectionTitle from "./SectionTitle";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import NewsTable from "./NewsTable";
import GuideModal from "./Modal";
import { modalInfo } from "../config";

const NewsSection = ({
  sentimentData,
  fromDate,
  toDate,
  product,
  productName,
  productType,
  sentimentLoading,
  layout,
  publishers,
}) => {
  const [selected, setSelected] = useState("All Publishers");
  const [filteredData, setFilteredData] = useState([]);

  const filterPublisher = (publisher, data) => {
    const filtered = data.map((d) => {
      const indices = [];
      d["customdata"].forEach((e, i) => {
        if (e[1] === publisher) {
          indices.push(i);
        } else if (publisher === "All Publishers") {
          indices.push(i);
        }
      });
      return {
        ...d,
        customdata: d["customdata"].filter((e, i) => indices.includes(i)),
        hovertext: d["hovertext"].filter((e, i) => indices.includes(i)),
        x: d["x"].filter((e, i) => indices.includes(i)),
        y: d["y"].filter((e, i) => indices.includes(i)),
        marker: {
          ...d["marker"],
          size: d["marker"].size.filter((e, i) => indices.includes(i)),
        },
      };
    });
    return filtered;
  };

  const updateData = (publisher, sentimentData) => {
    if (!publisher) {
      setSelected("All Publishers");
      setFilteredData(sentimentData);
    } else {
      setSelected(publisher);
      const fd = filterPublisher(publisher, sentimentData);
      setFilteredData(fd);
    }
  };
  const handleOnChange = (e, value) => {
    updateData(value, sentimentData ? sentimentData : []);
  };

  useEffect(() => {
    updateData(selected, sentimentData ? sentimentData : []);
  }, [sentimentData]);

  const getTableContent = (data) => {
    const rows = [];
    let counter = 0;
    data.forEach((d) => {
      d["customdata"].forEach((e, i) => {
        rows.push({
          publisher: d["customdata"][i][1],
          title: d["hovertext"][i],
          id: counter,
          link: d["customdata"][i][2],
          date: d["customdata"][i][0].substring(0, 10),
          sentiment: d["name"],
        });
        counter++;
      });
    });
    return rows;
  };

  return (
    <>
      <Grid item xs={12}>
        <SectionTitle typoComponent="h1" variant="h4">
          <Stack sx={{ mb: 2 }} spacing={1} direction="row">
            <NewspaperIcon fontSize="large" /> 
            <div>News Section</div>
            <GuideModal
              title = {modalInfo.newsSection.title}
              message = {modalInfo.newsSection.message}
            />
          </Stack>
        </SectionTitle>
        <Stack sx={{ mb: 2 }} spacing={1} direction="row">
          <Autocomplete
            disablePortal
            id="publishers"
            options={[...publishers, "All Publishers"]}
            sx={{
              pt: 2,
              pb: 2,
              minWidth: "50%",
            }}
            renderInput={(params) => (
              <TextField {...params} label="Publisher" />
            )}
            defaultValue="All Publishers"
            onChange={handleOnChange}
          />
        </Stack>
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
              <span>{selected} News Sentiment on </span>
              <ProductLogo
                product={product}
                productName={productName}
                size={30}
                productType={productType}
              />
              <span>{` ${productName} from ${fromDate.substring(
                0,
                10
              )} - ${toDate.substring(0, 10)}`}</span>
            </Stack>
          </Typography>
          {sentimentData && !sentimentLoading ? (
            <Plot
              data={filteredData}
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
            <NewsTable rows={getTableContent(filteredData)} />
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
