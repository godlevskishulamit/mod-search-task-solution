import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('free');
  const [results, setResults] = useState([]);

  useEffect(() => {
    // Example data for demonstration
    setResults([
      {
        id: 1,
        main_name: 'Example Street',
        title: 'Example Title',
        group: 'Example Group',
        type: 'Example Type',
        code: '12345',
        neighborhood: 'Example Neighborhood',
      },
    ]);
  }, []);

  useEffect(() => {
    // Temporarily disable Elasticsearch check
    console.log('Elasticsearch check disabled for debugging.');
  }, []);

  const handleSearch = async () => {
    // Temporarily disable search functionality
    console.log('Search functionality disabled for debugging.');
    setResults([{
      id: 1,
      main_name: 'Example Street',
      title: 'Example Title',
      group: 'Example Group',
      type: 'Example Type',
      code: '12345',
      neighborhood: 'Example Neighborhood',
    }]);
  };

  const handleDelete = async (id) => {
    // Temporarily disable delete functionality
    console.log('Delete functionality disabled for debugging.');
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '20%' }}>
      <h1>שלום, הגעתם למטלת בית של שולמית גודלבסקי</h1>
      <div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <div>
        <label>
          <input
            type="radio"
            value="free"
            checked={mode === 'free'}
            onChange={() => setMode('free')}
          />
          Free
        </label>
        <label>
          <input
            type="radio"
            value="accurate"
            checked={mode === 'accurate'}
            onChange={() => setMode('accurate')}
          />
          Accurate
        </label>
        <label>
          <input
            type="radio"
            value="phrase"
            checked={mode === 'phrase'}
            onChange={() => setMode('phrase')}
          />
          Phrase
        </label>
      </div>
      <div>
        <h2>Results</h2>
        <ul>
          {results.map((result) => (
            <li key={result.id}>
              {result.main_name} - {result.title} - {result.group} - {result.type} - {result.code} - {result.neighborhood}
              <button onClick={() => handleDelete(result.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;