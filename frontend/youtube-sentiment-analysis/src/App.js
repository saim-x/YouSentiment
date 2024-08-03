import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [channelUrl, setChannelUrl] = useState('');
  const [channelData, setChannelData] = useState(null);
  const [sentiment, setSentiment] = useState(null);

  const fetchChannelData = async () => {
    const response = await axios.post('http://localhost:5000/fetch-channel', { channel_url: channelUrl });
    setChannelData(response.data.items[0]);
  };

  const analyzeSentiment = async (text) => {
    const response = await axios.post('http://localhost:5000/analyze', { text });
    setSentiment(response.data);
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

        {sentiment && (
          <div>
            <h2>Sentiment Analysis:</h2>
            <p>Polarity: {sentiment.polarity}</p>
            <p>Subjectivity: {sentiment.subjectivity}</p>
          </div>
        )}
      </header>
    </div>
  );
};

export default App;
