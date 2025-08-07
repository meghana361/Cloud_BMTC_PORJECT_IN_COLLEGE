
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const apiUrl = process.env.REACT_APP_BACKEND_URL;

const RouteFinder = () => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [routes, setRoutes] = useState([]);
  const [error, setError] = useState('');
  const [stops, setStops] = useState([]);
  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);

  useEffect(() => {
    const fetchStops = async () => {
      try {
        const res = await axios.get(`${apiUrl}/stops`);
        setStops(res.data);
      } catch (err) {
        console.error('Failed to fetch stops:', err);
        setError('Failed to load stop list from server.');
      }
    };
    fetchStops();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setRoutes([]);
    setError('');

    if (!source || !destination) {
      setError('Please enter both source and destination.');
      return;
    }

    try {
      const response = await axios.get(`${apiUrl}/routes`, {
        params: {
          from: source.trim(),
          to: destination.trim(),
        },
      });

      if (response.data.length === 0) {
        setError(
          'No direct routes found between these stops. You may need to take multiple buses with transfers. Try nearby stops or contact BMTC for assistance.'
        );
      } else {
        setRoutes(response.data);
      }
    } catch (err) {
      console.error('Error fetching routes:', err);
      setError('Failed to fetch routes. Check the backend.');
    }
  };

  const filterSuggestions = (value) =>
    stops.filter((stop) =>
      stop.toLowerCase().includes(value.toLowerCase())
    );

  const handleSourceChange = (e) => {
    const value = e.target.value;
    setSource(value);
    setSourceSuggestions(filterSuggestions(value));
  };

  const handleDestinationChange = (e) => {
    const value = e.target.value;
    setDestination(value);
    setDestSuggestions(filterSuggestions(value));
  };

  const handleSelectSuggestion = (value, isSource) => {
    if (isSource) {
      setSource(value);
      setSourceSuggestions([]);
    } else {
      setDestination(value);
      setDestSuggestions([]);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={heroStyle}>
        <h1 style={mainTitle}>🛣️ Make Your Route Easy</h1>
        <p style={quoteStyle}>“Find the fastest, easiest way to your destination.”</p>
      </div>

      <div style={layoutWrapperStyle}>

        <div style={cardStyle}>
          <h2 style={titleStyle}>Search for Bus Routes</h2>

          <form onSubmit={handleSearch} style={formStyle}>
            <div style={inputWrapperStyle}>
              <input
                type="text"
                value={source}
                onChange={handleSourceChange}
                placeholder="Enter source stop"
                style={inputStyle}
              />
              {sourceSuggestions.length > 0 && (
                <ul style={suggestionStyle}>
                  {sourceSuggestions.map((stop, idx) => (
                    <li
                      key={idx}
                      style={suggestionItemStyle}
                      onClick={() => handleSelectSuggestion(stop, true)}
                    >
                      {stop}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div style={inputWrapperStyle}>
              <input
                type="text"
                value={destination}
                onChange={handleDestinationChange}
                placeholder="Enter destination stop"
                style={inputStyle}
              />
              {destSuggestions.length > 0 && (
                <ul style={suggestionStyle}>
                  {destSuggestions.map((stop, idx) => (
                    <li
                      key={idx}
                      style={suggestionItemStyle}
                      onClick={() => handleSelectSuggestion(stop, false)}
                    >
                      {stop}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button type="submit" style={buttonStyle}>Find Routes</button>
          </form>

          {error && <p style={errorStyle}>{error}</p>}

          {routes.length > 0 && (
            <div style={resultsBoxStyle}>
              <h3 style={{ marginBottom: '10px' }}>Matching Routes:</h3>
              <ul>
                {routes.map((route, idx) => (
                  <li key={idx}>
                    <strong>{route.route_name}</strong>: {route.hops.join(' → ')}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>


        <div style={tipsStyle}>
          <h3 style={{ marginBottom: '10px', color: '#004d40' }}>🔍 Tips for Searching</h3>
          <ul style={{ paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6' }}>
            <li>Kempegowda Bus Station is also known as Majestic – try searching for both.</li>
            <li>If no route is found, try nearby areas like Agara for HSR.</li>
            <li>Use hints in brackets: Agara (Sarjapur) vs Agara (Kanakapura).</li>
            <li>Route hops show path, not exact stop names.</li>
            <li>Prefixes like V, AS, G indicate special services.</li>
            <li>Bus timing accuracy may vary widely.</li>
            <li>Shortest path may involve more transfers – use carefully.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const pageStyle = {
  background: 'linear-gradient(to right, #e0f7fa, #f1f8e9)',
  minHeight: '100vh',
  padding: '40px 20px',
  fontFamily: 'Segoe UI, sans-serif',
};

const heroStyle = {
  textAlign: 'center',
  marginBottom: '30px',
};

const mainTitle = {
  fontSize: '2.5rem',
  fontWeight: 'bold',
  color: '#004d40',
};

const quoteStyle = {
  fontSize: '1.2rem',
  color: '#555',
  fontStyle: 'italic',
  marginTop: '10px',
};

const layoutWrapperStyle = {
  display: 'flex',
  flexDirection: 'row',
  gap: '30px',
  alignItems: 'flex-start',
  justifyContent: 'center',
  flexWrap: 'wrap'
};

const cardStyle = {
  background: '#ffffff',
  borderRadius: '16px',
  padding: '30px',
  maxWidth: '500px',
  width: '100%',
  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
};

const titleStyle = {
  fontSize: '1.5rem',
  color: '#00796b',
  marginBottom: '20px',
  textAlign: 'center',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
};

const inputWrapperStyle = {
  position: 'relative',
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  fontSize: '16px',
};

const buttonStyle = {
  backgroundColor: '#00796b',
  color: '#fff',
  padding: '12px',
  border: 'none',
  borderRadius: '8px',
  fontSize: '16px',
  cursor: 'pointer',
  transition: 'background 0.3s',
};

const errorStyle = {
  color: 'red',
  marginTop: '10px',
};

const suggestionStyle = {
  listStyleType: 'none',
  padding: 0,
  margin: 0,
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  backgroundColor: '#fff',
  border: '1px solid #ccc',
  borderRadius: '8px',
  maxHeight: '150px',
  overflowY: 'auto',
  zIndex: 10,
};

const suggestionItemStyle = {
  padding: '10px 14px',
  borderBottom: '1px solid #eee',
  cursor: 'pointer',
};

const resultsBoxStyle = {
  backgroundColor: '#f1f8e9',
  padding: '15px',
  marginTop: '20px',
  borderRadius: '12px',
  border: '1px solid #c5e1a5',
};

const tipsStyle = {
  backgroundColor: '#e0f2f1',
  padding: '20px',
  borderRadius: '12px',
  maxWidth: '400px',
  width: '100%',
  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
};

export default RouteFinder;
