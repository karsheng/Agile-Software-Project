import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import { AuthProvider } from "./Auth";
import PrivateRoute from "./PrivateRoute";
import Product from "./pages/Product";
import Page404 from "./pages/Page404";
import CryptoPage from "./pages/CryptoPage";
import Home from "./pages/Home";
import ForgetPassword from "./pages/ForgetPassword";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Switch>
          <PrivateRoute exact path="/product/:id" component={Product} />
          <PrivateRoute exact path="/cryptos" component={CryptoPage} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/forget" component={ForgetPassword} />
          <Route exact path="/signup" component={SignUp} />
          <Route exact path="/" component={Home} />
          <Route path="*" component={Page404} />
        </Switch>
      </Router>
    </AuthProvider>
  );
};
export default App;
