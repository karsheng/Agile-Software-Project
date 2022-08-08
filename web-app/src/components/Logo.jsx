import React from "react";
import { Grid } from "@mui/material";
import { Link } from "react-router-dom";

const Logo = ({ width }) => {
  return (
    <Grid
      container
      spacing={1}
      padding={1}
      direction="column"
      alignItems="center"
      justifyContent="center"
    >
      <Link to="/">
        <img alt="Logo" width={width} src="/logo.png" />
      </Link>
    </Grid>
  );
};

export default Logo;
