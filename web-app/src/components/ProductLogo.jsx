import React from "react";
import Avatar from "@mui/material/Avatar";

const ProductLogo = ({ size, productName, product, productType }) => {
  return (
    <Avatar
      sx={{ width: size, height: size }}
      alt={productName}
      src={`/${productType}/${product}.png`}
    />
  );
};

export default ProductLogo;
