import * as React from 'react';
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import GlobalStyles from "@mui/material/GlobalStyles";
import Container from "@mui/material/Container";
import Copyright from "../components/Copyright";
import Logo from "../components/Logo";

const page404 = () => {
  return (
    <React.Fragment>
      <GlobalStyles
        styles={{ ul: { margin: 0, padding: 0, listStyle: "none" } }}
      />
      <CssBaseline />
      {/* Hero unit */}
      <Container
        disableGutters
        maxWidth="sm"
        component="main"
        sx={{ pt: 8, pb: 6 }}
      >
        <Logo width="100%" />
        <br />
        <Typography
          component="h1"
          variant="h2"
          align="center"
          color="text.primary"
          gutterBottom
        >
          Page Not Found!!
        </Typography>
        <div
          align="center"
          color="text.secondary"
          component="p"
        >
          <img src="/imgs/error.jpeg" alt="Error 404 icon"/>
        </div>
      </Container>
      {/* End hero unit */}
      <Container maxWidth="md" component="main">
        <Grid container padding={1} alignItems="center" justifyContent="center">
          <h3>
            <a href="/">Go back to home</a>
          </h3>
        </Grid>
      </Container>
      {/* Footer */}
      <Container
        maxWidth="md"
        component="footer"
        sx={{
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          mt: 8,
          py: [3, 6],
        }}
      >
        <Copyright sx={{ mt: 5 }} />
      </Container>
      {/* End footer */}
    </React.Fragment>
  );
};

export default page404;
