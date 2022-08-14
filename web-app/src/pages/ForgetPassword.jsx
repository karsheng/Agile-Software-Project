import React, { useState, useCallback } from "react";
import { withRouter } from "react-router";
import app from "../base.js";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Copyright from "../components/Copyright";
import Logo from "../components/Logo";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import { Stack } from "@mui/material";

const theme = createTheme();

const ForgetPassword = ({ history }) => {
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleForgetPassword = useCallback(
    async (event) => {
      event.preventDefault();
      const { email } = event.target.elements;

      app
        .auth()
        .sendPasswordResetEmail(email.value)
        .then(() => {
          setShowSuccess(true);
          setError(false);
          setErrorMessage("");
        })
        .catch((error) => {
          setError(true);
          setErrorMessage(error.message);
          setShowSuccess(false);
        });
    },
    [history]
  );

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Logo width="100%" />
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Stack
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
            spacing={3}
          >
            <Typography component="h1" variant="h5">
              Forgot your password?
            </Typography>
            <Typography variant="p">
              Provide your email address here. We will send you a link to reset
              your password.
            </Typography>
          </Stack>

          <Box
            component="form"
            onSubmit={handleForgetPassword}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              error={error}
              helperText={errorMessage}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Submit
            </Button>
            {showSuccess ? (
              <Typography color="green" variant="p">
                <i>
                  A reset email with a link has been sent. Follow the link to
                  reset your password.
                </i>
              </Typography>
            ) : (
              ""
            )}
            <Grid item>
              <Link href="/login" variant="body2">
                Back to Login
              </Link>
            </Grid>
          </Box>
        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>
    </ThemeProvider>
  );
};

export default withRouter(ForgetPassword);
