import * as React from "react";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Layout from "../components/Layout";
import Switch from "@mui/material/Switch";
import { Link } from "react-router-dom";

const Products = ({ productList, title, productType }) => {
  const products = Object.keys(productList);

  const Title = () => {
    return (
      <Typography
        component="h1"
        variant="h6"
        color="inherit"
        noWrap
        sx={{ flexGrow: 1 }}
      >
        {title}
      </Typography>
    );
  };
  return (
    <Layout title={<Title />}>
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item key={product} xs={12} sm={6} md={3}>
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
                  {`${
                    productList[product].fullName
                  } - ${product.toUpperCase()}`}
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2 }}>
                Add to Watchlist
                <Switch size="big" />
                <Button component={Link} to={`/${productType}/${product}`}>
                  View
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Layout>
  );
};

export default Products;
