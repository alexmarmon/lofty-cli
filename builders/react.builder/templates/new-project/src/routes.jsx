import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import AppState from './state/AppState';
// import styles
import './resources/styles/base.scss';
// import pages


// create global state
const appState = new AppState();

export default class Routes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      routes: [
      ],
    };
  }

  render() {
    return (
      <BrowserRouter>
        <div id="app-container">
          {this.state.routes}
        </div>
      </BrowserRouter>
    );
  }
}
