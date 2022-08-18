import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import { AuthProvider } from "./Auth";
import PrivateRoute from "./PrivateRoute";
import Page404 from "./pages/Page404";
import CryptoList from "./pages/CryptoList";
import CryptoDashboard from "./pages/CryptoDashboard";
import StockList from "./pages/StockList";
import StockDashboard from "./pages/StockDashboard";
import Home from "./pages/Home";
import ForgetPassword from "./pages/ForgetPassword";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Switch>
          <PrivateRoute exact path="/cryptos/:id" component={CryptoDashboard} />
          <PrivateRoute exact path="/cryptos" component={CryptoList} />
          <PrivateRoute exact path="/stocks/:id" component={StockDashboard} />
          <PrivateRoute exact path="/stocks" component={StockList} />
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
