import React from "react";
import { Typography } from "@mui/material";

const SectionTitle = ({ children, typoComponent, variant }) => {
  return (
    <Typography
      component={typoComponent}
      variant={variant}
      color="inherit"
      noWrap
      sx={{ flexGrow: 1, p: 1 }}
    >
      {children}
    </Typography>
  );
};

export default SectionTitle;
