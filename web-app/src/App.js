import React, { useState, useEffect } from 'react';
import './App.css';
import Plot from 'react-plotly.js';

function App() {
  const [vizData, setVizData] = useState({});
  useEffect(() => {
    fetch('/viz').then(res => res.json()).then(data =>
      {
        setVizData(data)
      })
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1> Welcome to the Sentiment Analysis App</h1>
        {vizData.data ? (<Plot data={vizData.data} layout={vizData.layout} />) : 'Nothing yet...'}
      </header>
    </div>
  );
}

export default App;