import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

console.log('Index.tsx is loaded');

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);