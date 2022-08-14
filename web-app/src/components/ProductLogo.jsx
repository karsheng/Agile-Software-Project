import React from "react";
import Avatar from "@mui/material/Avatar";

const ProductLogo = ({ size, productName, product }) => {
  return (
    <Avatar
      sx={{ width: size, height: size }}
      alt={productName}
      src={`/cryptos/${product}.png`}
    />
  );
};

export default ProductLogo;
