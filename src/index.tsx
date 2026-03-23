import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { server } from './_tosslib/server/browser';
import { BrowserRouter as Router } from 'react-router-dom';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v6';

server.start({ onUnhandledRequest: 'bypass' });

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <NuqsAdapter>
        <App />
      </NuqsAdapter>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);
