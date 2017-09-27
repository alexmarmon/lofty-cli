import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import AppState from './state/AppState';

// include scss
import './resources/styles/base.scss';

// import pages
import Home from './pages/Home';

// create global state
const appState = new AppState();

export default class Routes extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <div id="app-container">
          <Route exact path="/" component={() => <Home state={appState} />} />
        </div>
      </BrowserRouter>
    );
  }
}
