import React from "react";
import Typography from "@mui/material/Typography";

const LayoutTitle = ({ text }) => {
  return (
    <Typography
      component="h1"
      variant="h6"
      color="inherit"
      noWrap
      sx={{ flexGrow: 1 }}
    >
      {text}
    </Typography>
  );
};

export default LayoutTitle;
