import React, { useState, useEffect, useContext } from "react";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Switch from "@mui/material/Switch";
import { Link } from "react-router-dom";
import { AuthContext } from "../Auth.js";
import app from "../base";
import GuideModal from "../components/Modal";
import { modalInfo } from "../config";

const ProductGrid = ({ productList, productType, showAll }) => {
  const { currentUser } = useContext(AuthContext);
  const [selected, setSelected] = useState(new Set());
  const { uid } = currentUser;
  const db = app.database();
  const products = Object.keys(productList);
  const ref = db.ref(`users/${uid}/${productType}`);

  useEffect(() => {
    ref.once("value", (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSelected(new Set(data.split(",")));
      }
    });
  }, []);

  const handleOnChange = (e, checked) => {
    const { id } = e.target;
    const temp = new Set(selected);
    checked ? temp.add(id) : temp.delete(id);
    const newSelected = Array.from(temp).join(",");
    ref.set(newSelected);
    setSelected(temp);
  };

  const renderNoProducts = () => {
    return (
      <Grid item>
        <Typography sx={{ p: 2 }}>
          No products available. Go to{" "}
          <a href={`/${productType}`}>{`${productType}`}</a> page to add to wish
          list.
        </Typography>
      </Grid>
    );
  };

  const renderProducts = (products) => {
    return products.map((product) => (
      <Grid
        sx={{ display: selected.has(product) || showAll ? "block" : "none" }}
        item
        key={product}
        xs={12}
        sm={6}
        md={3}
      >
        <Card
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <CardMedia
            component="img"
            sx={{
              // 16:9
              p: 7,
            }}
            image={`/${productType}/${product}.png`}
            alt="random"
          />
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography gutterBottom variant="h6" component="h2">
              {`${productList[product].fullName} - ${product.toUpperCase()}`}
            </Typography>
          </CardContent>
          <CardActions sx={{ p: 3 }}>
            Add to Watchlist
            <Switch
              checked={selected.has(product)}
              id={product}
              onChange={handleOnChange}
              size="big"
              disabled={productList[product].disabled}
            />
            <Button
              disabled={productList[product].disabled}
              component={Link}
              to={`/${productType}/${product}`}
            >
              View
            </Button>
            <GuideModal
                title = {modalInfo.productCard.title}
                message = {modalInfo.productCard.message}
            />
          </CardActions>
        </Card>
      </Grid>
    ));
  };

  return (
    <Grid container spacing={3}>
      {selected.size > 0 || showAll
        ? renderProducts(products)
        : renderNoProducts()}
    </Grid>
  );
};

export default ProductGrid;
