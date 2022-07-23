import React, { useState, useEffect, useContext } from 'react';
import '../App.css';
import Plot from 'react-plotly.js';
import { AuthContext } from "../Auth.js";
import { Redirect } from "react-router";
import Button from '@mui/material/Button';
import app from "../base.js";

function Dashboard() {
  const [vizData, setVizData] = useState({});
  const [sentimentData, setSentimentData] = useState({});
  const { currentUser } = useContext(AuthContext);

  if (!currentUser) {
    return <Redirect to="/" />;
  }

  useEffect(() => {
    currentUser.getIdToken().then(token => {
      const headers = {
        'authorization': token
      };
      fetch('/api/btc_viz', {headers: headers}).then(res => res.json()).then(data =>
        {
          setVizData(data);
        });
      fetch('/api/btc_sentiment', {headers: headers}).then(res => res.json()).then(data =>
        {
          setSentimentData(data);
        });
    });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Money Mood</h1>
        {vizData.data ? (<Plot data={vizData.data} layout={vizData.layout} />) : 'Nothing yet...'}
        <br />
        {sentimentData.data ? (<Plot data={sentimentData.data} layout={sentimentData.layout} />) : 'Nothing yet...'}
        <Button variant="text" onClick={() => app.auth().signOut()}>Sign out</Button>
      </header>
    </div>
  );
}

export default Dashboard;