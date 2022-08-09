import React from "react";
import { Box, Card, CardContent, Grid, Typography } from "@mui/material";

const Metrics = ({ title, value, percentage, icon, arrowIcon }) => {
  return (
    <Card>
      <CardContent>
        <Grid container spacing={3} sx={{ justifyContent: "space-between" }}>
          <Grid item>
            <Typography color="textSecondary" gutterBottom variant="overline">
              {title}
            </Typography>
            <Typography color="textPrimary" variant="h4">
              {value}
            </Typography>
          </Grid>
          <Grid item>{icon}</Grid>
        </Grid>
        <Box
          sx={{
            alignItems: "center",
            display: "flex",
            pt: 2,
          }}
        >
          {arrowIcon}
          <Typography
            variant="body2"
            sx={{
              mr: 1,
            }}
          >
            {`${percentage} %`}
          </Typography>
          <Typography color="textSecondary" variant="caption">
            Since last week
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default Metrics;
