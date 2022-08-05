import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import { AuthProvider } from "./Auth";
import PrivateRoute from "./PrivateRoute";
import Product from "./pages/Product";
import Page404 from "./pages/Page404";
import Home from "./pages/Home";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <PrivateRoute exact path="/product/:id" component={Product} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/signup" component={SignUp} />
        <Route exact path="/error" component={Page404} />
        <Route exact path="/" component={Home} />
      </Router>
    </AuthProvider>
  );
};
export default App;
