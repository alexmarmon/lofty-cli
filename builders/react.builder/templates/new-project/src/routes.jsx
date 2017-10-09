import React from 'react';
import { Router, Route } from 'react-router-dom';
import AppState from './state/AppState';
// import styles
import './resources/styles/base.scss';
// import pages
import Home from './pages/Home';

// create global state
const appState = new AppState();

export default class Routes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      routes: [
        <Route exact path="/" key="home" component={() => <Home state={appState} />} />,
      ],
    };
  }

  render() {
    return (
      <Router history={history}>
        <div id="app-container">
          {this.state.routes}
        </div>
      </Router>
    );
  }
}
