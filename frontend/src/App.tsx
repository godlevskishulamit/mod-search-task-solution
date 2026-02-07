import React, { useState } from 'react';

interface SearchResult {
  id: string;
  main_name: string;
  title?: string;
  secondary_name?: string;
  group?: string;
  additional_group?: string;
  type?: string;
  code?: string;
  neighborhood?: string;
}

type Mode = 'free' | 'accurate' | 'phrase';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<Mode>('free');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/delete/${id}`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('שגיאה במחיקה');
      }

      // הסרה מהרשימה במסך
      setResults((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
      setError('לא ניתן לבצע מחיקה כרגע');
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('נא להקליד טקסט לחיפוש');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:5000/search?q=${encodeURIComponent(query)}&mode=${mode}`
      );

      if (!response.ok) {
        throw new Error('שגיאה מהשרת');
      }

      const data: SearchResult[] = await response.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      setError('לא ניתן לבצע חיפוש כרגע');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '5%' }}>
      <h1>שלום, הגעתם למטלת בית של שולמית גודלבסקי</h1>

      <div style={{ marginTop: '20px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="הקלידו טקסט לחיפוש"
          style={{ width: '300px', padding: '5px' }}
        />
        <button onClick={handleSearch} style={{ marginRight: '10px' }}>
          חיפוש
        </button>
      </div>

      <div style={{ marginTop: '10px' }}>
        <label style={{ margin: '0 10px' }}>
          <input
            type="radio"
            value="free"
            checked={mode === 'free'}
            onChange={() => setMode('free')}
          />
          חופשי
        </label>
        <label style={{ margin: '0 10px' }}>
          <input
            type="radio"
            value="accurate"
            checked={mode === 'accurate'}
            onChange={() => setMode('accurate')}
          />
          מדויק
        </label>
        <label style={{ margin: '0 10px' }}>
          <input
            type="radio"
            value="phrase"
            checked={mode === 'phrase'}
            onChange={() => setMode('phrase')}
          />
          צירוף מילים
        </label>
      </div>

      {loading && <p style={{ marginTop: '20px' }}>טוען תוצאות...</p>}
      {error && <p style={{ marginTop: '20px', color: 'red' }}>{error}</p>}

      <div style={{ marginTop: '30px' }}>
        <h2>תוצאות חיפוש</h2>
        {results.length === 0 && !loading && !error && <p>אין תוצאות להצגה</p>}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {results.map((r) => (
            <li key={r.id} style={{ marginBottom: '10px' }}>
              <strong>{r.main_name}</strong>
              {r.title && `, ${r.title}`} {r.neighborhood && ` - ${r.neighborhood}`}{' '}
              {r.code && ` (קוד: ${r.code})`}
              <button
                onClick={() => handleDelete(r.id)}
                style={{ marginLeft: '10px' }}
              >
                מחיקה
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;