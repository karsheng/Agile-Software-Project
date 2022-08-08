import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { Grid } from "@mui/material";

const FullLoading = () => {
  return (
    <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justifyContent="center"
      style={{ minHeight: "100vh" }}
    >
      <Grid item xs={3}>
        <CircularProgress size={100} />
      </Grid>
    </Grid>
  );
};

export default FullLoading;
