import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import { AuthProvider } from "./Auth";
import PrivateRoute from "./PrivateRoute";

const Home = () => {
  return <h1>Hello</h1>
}

const App = () => {
  
  return (
    <AuthProvider>
      <Router>
        <div>
          <PrivateRoute exact path="/dashboard" component={Dashboard} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/signup" component={SignUp} />
          <Route exact path="/" component={Home} />
        </div>
      </Router>
    </AuthProvider>
  );
}
export default App;