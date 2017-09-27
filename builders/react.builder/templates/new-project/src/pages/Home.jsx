import React from 'react';
import PropTypes from 'prop-types';
import AppState from '../state/AppState.jsx';
// import modules here

export default class Home extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div id="Home">
        <h1>Welcome home</h1>
      </div>
    );
  }
}

Home.propTypes = {
  state: PropTypes.instanceOf(AppState),
};
