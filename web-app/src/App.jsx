import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import { AuthProvider } from "./Auth";
import PrivateRoute from "./PrivateRoute";
import ProductPage from "./components/ProductPage";
import Page404 from "./components/Page404";

const Home = () => {
  return <h1>Hello</h1>;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div>
          <PrivateRoute exact path="/product/:id" component={ProductPage} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/signup" component={SignUp} />
          <Route exact path="/" component={Home} />
          <Route exact path="/error" component={Page404} />
        </div>
      </Router>
    </AuthProvider>
  );
};
export default App;
