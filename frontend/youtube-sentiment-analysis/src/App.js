import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [channelUrl, setChannelUrl] = useState('');
  const [channelData, setChannelData] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [error, setError] = useState('');

  const fetchChannelData = async () => {
    try {
      const response = await axios.post('http://localhost:5000/fetch-channel', { channel_url: channelUrl });
      setChannelData(response.data.items[0]);
      setError('');  // Clear any previous errors
    } catch (err) {
      setError('Oops! Something went wrong. Couldn’t fetch channel data. 😔');
      console.error(err);
    }
  };

  const analyzeSentiment = async (text) => {
    try {
      const response = await axios.post('http://localhost:5000/analyze', { text });
      setSentiment(response.data);
      setError('');  // Clear any previous errors
    } catch (err) {
      setError('Oops! Sentiment analysis failed. 😕');
      console.error(err);
    }
  };

  const getSentimentDescription = (polarity, subjectivity) => {
    let sentimentDescription = 'It seems pretty neutral. 🤔';

    if (polarity > 0.1) {
      sentimentDescription = 'Overall, this is a positive vibe! 😊';
    } else if (polarity < -0.1) {
      sentimentDescription = 'Oops! This is leaning towards negative. 😞';
    }

    return (
      <div>
        <h2>Sentiment Analysis:</h2>
        <p><strong>Polarity:</strong> {polarity.toFixed(2)}</p>
        <p><strong>Subjectivity:</strong> {subjectivity.toFixed(2)}</p>
        <p><strong>Description:</strong> {sentimentDescription}</p>
      </div>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <input
          type="text"
          value={channelUrl}
          onChange={(e) => setChannelUrl(e.target.value)}
          placeholder="Enter YouTube Channel URL"
        />
        <button onClick={fetchChannelData}>Fetch Channel Data</button>

        {error && <p className="error">{error}</p>}  {/* Display error message */}

        {channelData && (
          <div>
            <h1>{channelData.snippet.title}</h1>
            <img src={channelData.snippet.thumbnails.default.url} alt="Channel Profile" />
            <p>Subscribers: {channelData.statistics.subscriberCount}</p>
            <p>Total Views: {channelData.statistics.viewCount}</p>
            <p>Total Videos: {channelData.statistics.videoCount}</p>
            <button onClick={() => analyzeSentiment(channelData.snippet.description)}>
              Analyze Channel Description
            </button>
          </div>
        )}

        {sentiment && getSentimentDescription(sentiment.polarity, sentiment.subjectivity)}
      </header>
    </div>
  );
};

export default App;
