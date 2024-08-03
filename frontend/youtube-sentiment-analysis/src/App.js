// import React, { useState } from 'react';
// import axios from 'axios';
// import './App.css';

// const App = () => {
//   const [channelUrl, setChannelUrl] = useState('');
//   const [channelData, setChannelData] = useState(null);
//   const [sentiment, setSentiment] = useState(null);
//   const [selectedVideoId, setSelectedVideoId] = useState(null);
//   const [error, setError] = useState('');
//   const [showDetails, setShowDetails] = useState(false);

//   const fetchChannelData = async () => {
//     try {
//       const response = await axios.post('http://localhost:5000/fetch-channel', { channel_url: channelUrl });
//       setChannelData(response.data);
//       setError('');  // Clear any previous errors
//     } catch (err) {
//       setError('Oops! Something went wrong. Couldn’t fetch channel data. 😔');
//       console.error(err);
//     }
//   };

//   const analyzeSentiment = async (text) => {
//     try {
//       const response = await axios.post('http://localhost:5000/analyze', { text });
//       setSentiment(response.data);
//       setError('');  // Clear any previous errors
//     } catch (err) {
//       setError('Oops! Sentiment analysis failed. 😕');
//       console.error(err);
//     }
//   };

//   const handleAnalyzeVideoDescription = async (videoId, description) => {
//     setSelectedVideoId(videoId); // Set the selected video ID
//     await analyzeSentiment(description);
//   };

//   const getSentimentDescription = (polarity, subjectivity) => {
//     let vibeDescription = 'Hmm, the vibe is pretty neutral. 🤔';
//     let factDescription = 'It seems like this description is mostly about facts.';

//     if (polarity > 0.1) {
//       vibeDescription = 'Overall, this is giving off a positive vibe! 😊';
//     } else if (polarity < -0.1) {
//       vibeDescription = 'Oops! This is leaning towards a negative vibe. 😞';
//     }

//     if (subjectivity > 0.5) {
//       factDescription = 'This description seems to be more opinion-based.';
//     } else {
//       factDescription = 'This description seems to be more fact-based.';
//     }

//     return (
//       <div>
//         <h2>Sentiment Analysis:</h2>
//         <p><strong>Vibe:</strong> {vibeDescription}</p>
//         <p><strong>Opinion or Fact:</strong> {factDescription}</p>
//       </div>
//     );
//   };

//   const handleShowDetails = () => {
//     setShowDetails(!showDetails);
//   };

//   // Utility function to format numbers
//   const formatNumber = (number) => {
//     if (number >= 1_000_000) {
//       return (number / 1_000_000).toFixed(1) + 'M';
//     } else if (number >= 1_000) {
//       return (number / 1_000).toFixed(1) + 'K';
//     } else {
//       return number;
//     }
//   };

//   return (
//     <div className="App">
//       <header className="App-header">
//         <input
//           type="text"
//           value={channelUrl}
//           onChange={(e) => setChannelUrl(e.target.value)}
//           placeholder="Enter YouTube Channel URL"
//         />
//         <button onClick={fetchChannelData}>Fetch Channel Data</button>

//         {error && <p className="error">{error}</p>}  {/* Display error message */}

//         {channelData && (
//           <div>
//             <h1>{channelData.items[0]?.snippet?.title}</h1>
//             <img src={channelData.items[0]?.snippet?.thumbnails?.default?.url} alt="Channel Profile" />
//             <p>Subscribers: {formatNumber(channelData.items[0]?.statistics?.subscriberCount)}</p>
//             <p>Total Views: {formatNumber(channelData.items[0]?.statistics?.viewCount)}</p>
//             <p>Total Videos: {formatNumber(channelData.items[0]?.statistics?.videoCount)}</p>
//             <button onClick={() => analyzeSentiment(channelData.items[0]?.snippet?.description)}>
//               Analyze Channel Description
//             </button>
//             <button onClick={handleShowDetails}>
//               {showDetails ? 'Hide Detailed Response' : 'Show Detailed Response'}
//             </button>

//             {showDetails && (
//               <div className="detailed-response">
//                 <h3>Technical Details:</h3>
//                 <div>
//                   <h4>Videos:</h4>
//                   {channelData.videos && channelData.videos.map((video) => (
//                     <div key={video.items[0].id.videoId} className="video-details">
//                       <h5>{video.items[0].snippet.title}</h5>
//                       <img src={video.items[0].snippet.thumbnails.default.url} alt={video.items[0].snippet.title} />
//                       <p><strong>Published At:</strong> {new Date(video.items[0].snippet.publishedAt).toLocaleDateString()}</p>
//                       <p><strong>Views:</strong> {formatNumber(video.items[0].statistics.viewCount)}</p>
//                       <button onClick={() => handleAnalyzeVideoDescription(video.items[0].id.videoId, video.items[0].snippet.description)}>
//                         Analyze Video Description
//                       </button>
//                       {selectedVideoId === video.items[0].id.videoId && sentiment && (
//                         <div>
//                           <p><strong>Sentiment Polarity:</strong> {sentiment.polarity.toFixed(2)}</p>
//                           <p><strong>Sentiment Subjectivity:</strong> {sentiment.subjectivity.toFixed(2)}</p>
//                           {getSentimentDescription(sentiment.polarity, sentiment.subjectivity)}
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {sentiment && !showDetails && getSentimentDescription(sentiment.polarity, sentiment.subjectivity)}
//       </header>
//     </div>
//   );
// };

// export default App;







import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [channelUrl, setChannelUrl] = useState('');
  const [channelData, setChannelData] = useState(null);
  const [sentiment, setSentiment] = useState({});
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchChannelData = async () => {
    setLoading(true); // Set loading to true when starting to fetch data
    try {
      const response = await axios.post('http://localhost:5000/fetch-channel', { channel_url: channelUrl });
      setChannelData(response.data);
      setError('');  // Clear any previous errors
    } catch (err) {
      setError('Oops! Something went wrong. Couldn’t fetch channel data. 😔');
      console.error(err);
    } finally {
      setLoading(false); // Set loading to false once data is fetched or if there is an error
    }
  };

  const analyzeSentiment = async (text, videoId) => {
    try {
      const response = await axios.post('http://localhost:5000/analyze', { text });
      setSentiment((prevSentiments) => ({
        ...prevSentiments,
        [videoId]: response.data
      }));
      setError('');  // Clear any previous errors
    } catch (err) {
      setError('Oops! Sentiment analysis failed. 😕');
      console.error(err);
    }
  };

  const handleAnalyzeVideoDescription = async (videoId, description) => {
    setSelectedVideoId(videoId); // Set the selected video ID
    await analyzeSentiment(description, videoId);
  };

  const getSentimentDescription = (polarity, subjectivity) => {
    let vibeDescription = 'Hmm, the vibe is pretty neutral. 🤔';
    let factDescription = 'It seems like this description is mostly about facts.';

    if (polarity > 0.1) {
      vibeDescription = 'Overall, this is giving off a positive vibe! 😊';
    } else if (polarity < -0.1) {
      vibeDescription = 'Oops! This is leaning towards a negative vibe. 😞';
    }

    if (subjectivity > 0.5) {
      factDescription = 'This description seems to be more opinion-based.';
    } else {
      factDescription = 'This description seems to be more fact-based.';
    }

    return (
      <div>
        <h2>Sentiment Analysis:</h2>
        <p><strong>Vibe:</strong> {vibeDescription}</p>
        <p><strong>Opinion or Fact:</strong> {factDescription}</p>
      </div>
    );
  };

  const handleShowDetails = () => {
    setShowDetails(!showDetails);
  };

  // Utility function to format numbers
  const formatNumber = (number) => {
    if (number >= 1_000_000) {
      return (number / 1_000_000).toFixed(1) + 'M';
    } else if (number >= 1_000) {
      return (number / 1_000).toFixed(1) + 'K';
    } else {
      return number;
    }
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

        {loading && <div className="spinner"></div>} {/* Show spinner while loading */}
        {error && <p className="error">{error}</p>}  {/* Display error message */}

        {channelData && (
          <div>
            <h1>{channelData.items[0]?.snippet?.title}</h1>
            <img src={channelData.items[0]?.snippet?.thumbnails?.default?.url} alt="Channel Profile" />
            <p>Subscribers: {formatNumber(channelData.items[0]?.statistics?.subscriberCount)}</p>
            <p>Total Views: {formatNumber(channelData.items[0]?.statistics?.viewCount)}</p>
            <p>Total Videos: {formatNumber(channelData.items[0]?.statistics?.videoCount)}</p>
            <button onClick={() => analyzeSentiment(channelData.items[0]?.snippet?.description, 'channel')}>
              Analyze Channel Description
            </button>
            <button onClick={handleShowDetails}>
              {showDetails ? 'Hide Detailed Response' : 'Show Detailed Response'}
            </button>

            {showDetails && (
              <div className="detailed-response">
                <h3>Technical Details:</h3>
                <div>
                  <h4>Videos:</h4>
                  {channelData.videos && channelData.videos.map((video) => (
                    <div key={video.items[0].id.videoId} className="video-details">
                      <h5>{video.items[0].snippet.title}</h5>
                      <img src={video.items[0].snippet.thumbnails.default.url} alt={video.items[0].snippet.title} />
                      <p><strong>Published At:</strong> {new Date(video.items[0].snippet.publishedAt).toLocaleDateString()}</p>
                      <p><strong>Views:</strong> {formatNumber(video.items[0].statistics.viewCount)}</p>
                      <button onClick={() => handleAnalyzeVideoDescription(video.items[0].id.videoId, video.items[0].snippet.description)}>
                        Analyze Video Description
                      </button>
                      {selectedVideoId === video.items[0].id.videoId && sentiment[video.items[0].id.videoId] && (
                        <div>
                          <p><strong>Sentiment Polarity:</strong> {sentiment[video.items[0].id.videoId].polarity.toFixed(2)}</p>
                          <p><strong>Sentiment Subjectivity:</strong> {sentiment[video.items[0].id.videoId].subjectivity.toFixed(2)}</p>
                          {getSentimentDescription(sentiment[video.items[0].id.videoId].polarity, sentiment[video.items[0].id.videoId].subjectivity)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {sentiment['channel'] && !showDetails && getSentimentDescription(sentiment['channel'].polarity, sentiment['channel'].subjectivity)}
      </header>
    </div>
  );
};

export default App;
