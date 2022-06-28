import React, { useState, useEffect } from 'react';
import './App.css';
import Plot from 'react-plotly.js';

function App() {
  const [vizData, setVizData] = useState({});
  const [sentimentData, setSentimentData] = useState({});
  
  useEffect(() => {
    fetch('/api/btc_viz').then(res => res.json()).then(data =>
      {
        setVizData(data);
      });
    fetch('/api/btc_sentiment').then(res => res.json()).then(data =>
      {
        setSentimentData(data);
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Money Mood</h1>
        {vizData.data ? (<Plot data={vizData.data} layout={vizData.layout} />) : 'Nothing yet...'}
        <br />
        {sentimentData.data ? (<Plot data={sentimentData.data} layout={sentimentData.layout} />) : 'Nothing yet...'}
      </header>
    </div>
  );
}

export default App;