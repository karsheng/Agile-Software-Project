import * as React from 'react';

const keyMetricsMsg = () => {
  return <div>
    <img src='/imgs/guides/currentPrice.png' alt="Current Price segment view"/>
    <p>This segment displays the current price of the selected cryptocurrency 
      and the fluctuation it has under gone in the last week by percentage.</p>
    <br />
    <img src="/imgs/guides/tweetsSentiment.png" alt="Tweet Sentiment indicator segment view"/>
    <p>This segment displays the sentiment indicator (positive/negative/neutral) based on the
      tweets of the selected time period.</p>
    <img src="/imgs/guides/newsSentiment.png" alt="News Sentiment indicator segment view"/>
    <p>This segment displays the sentiment indicator (positive/negative/neutral) based on the
      news of the selected time period.</p>
  </div>
}

const priceAndSentimentMsg = () => {
  return <div>
    <img 
        src="/imgs/guides/priceSentiment.png"
        alt="Price and Sentiment segment view"/>
    <p>This segment displays a graph that will show the price fluctuation, the tweet 
      tracked and the news tracked by the APP. The blue line displays the price fluctuation of the
      selected cryptocurrency price of the selected time period. The green dotted 
      line displays the fluctuation of the Tweets tracked. The red dotted 
      line displays the fluctuation of the News tracked. Positive Tweet and news cause 
      a rise in fluctuation and Negative Tweets and news cause a fall. The APP 
      tracks Tweets and news from the selected time period. This graph compares price to 
      tweet and news predictions.The green bars of the graph indicates a rise in the price 
      and the red bars indicates a fall in the price Prediction can be made on how the price has fluctuated 
      compared to how positive and negative tweets and news about the selected stock or cryptocurrency.</p>
      <img 
        src="/imgs/guides/priceAndSentiments.png"
        alt="Price and Sentiment segment view highlighting how to select an area to zoom"/>
      <p>An area of the graph can be enhanced by clicking on the graph and dragging rectangle over 
        the area that you wish to enhance. This will zoom in on the selected area. See the tool on 
        the top right for the Autoscale button to zoom out</p>
  </div>;
};

const tweeterSectionMsg = () => {
  return <div>
    <p>This graph will display the Tweets tracked for the selected time period and selected cryptocurrency.
      Green dots are positive tweets. Blue dots are neutral Tweets. Red dots are
      Negative tweets. Hover the mouse over any of the dots to see more information and
      the tweeted posted.</p>
      <img 
        src="/imgs/guides/tSentiments.png" 
        alt="Tweets Sentiment segment view highlighting how to select an area to zoom"/>
      <p>An area of the graph can be enhanced by clicking on the graph and dragging 
        rectangle over the area that you wish to enhance. This will zoom in on the selected area.
        See the tool on the top right for the Autoscale button to zoom out</p>
  </div>;
};


const newsSectionMsg = () => {
  return <div>
    <p>This graph will generally display the News tracked for the selected time period and selected cryptocurrency.
      You can also select any particular publisher from the dropdown box. If any publisher is selected then it'll
      display only the selected publisher's news for the selected time period and selected cryptocurrency.
      Green dots are positive news. Blue dots are neutral news. Red dots are
      Negative news. Hover the mouse over any of the dots to see more information and
      the news posted.</p>
      <img 
        src="/imgs/guides/newsSentimentGraph.png"
        alt="News sentiment segment view highlighting how to select an area to zoom"
      />
      <p>An area of the graph can be enhanced by clicking on the graph and dragging 
        rectangle over the area that you wish to enhance. This will zoom in on the selected area.
        See the tool on the top right for the Autoscale button to zoom out</p>
      <img 
        src="/imgs/guides/newsTable.png"
        alt="A table containing news article with sentiment indicator"
      />
      <p>This table displays the News title along with publisher and date. The 'sentiment'
        column of the table tells the sentiment according to the news. The link of the 
        news article is given in the 'link' column.
      </p>
  </div>;
};

const watchListMsg = () => {
  return <div>
      <p>Welcome to the watchlist. This page keeps track of all your favorite
        stocks and cryptocurrencies you wish to track. Click on stocks or 
        cryptos to head to that page. On either of those pages clink on Add to 
        Watchlist Slider. This will add it to your watch list that can be on the
        watchlish page</p>
      <img
        src="/imgs/guides/watchlist.png"
        alt="An image displaying how to add products in watchlist"
      />
  </div>
};

export const modalInfo = {
       productCard:{
        title: "Product Card",
        message: "This is a product card containing the name and icon of the product. For more details, click on 'View' and find out what tweets and news articles are saying about the product. If you wish to add/remove this product in your favourites list, press the switch that says 'Add to watchlist'."
       },

       dataSelector : {
        title: "Data Selector",
        message: "This option allows you to select a starting and ending date for the cryptocurrency’s tracking period. It displays data in a graph below for the chosen time period. Choose a starting and ending date either by typing the date or clicking the calendar button to select a date. Then click the GET DATA button."
       },

       keyMetrics :{
        title: "Key Metrics",
        message: keyMetricsMsg()
       },

       priceAndSentiment: {
         title: "Price and Sentiment Correlation",
         message: priceAndSentimentMsg()
       },

       tweeterSection:{
         title: "Section for Tweeter Data",
         message: tweeterSectionMsg()
       },

       negativeTweet: {
        title: "Negative Tweets",
        message: "This segment displays recent Negative Tweets about cryptocurrencies. Hover the mouse over any of the tweets to see more information and the tweet itself."
       },

       positiveTweet: {
         title: "Positive Tweets",
         message: "This segment displays recent Positive Tweets about cryptocurrencies. Hover the mouse over any of the tweets to see more information and the tweet itself."
       },

       newsSection: {
        title: "Section for News Data",
        message: newsSectionMsg()
       },

       watchList: {
        title: "Watchlist",
        message: watchListMsg()
       }
}
