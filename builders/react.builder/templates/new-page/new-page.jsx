import React from 'react';
import PropTypes from 'prop-types';
import AppState from '../state/AppState.jsx';
// import modules here

export default class {{pageName}} extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div id="{{name}}">
        <h1>Welcome to the {{pageName}} page</h1>
      </div>
    );
  }
}

{{pageName}}.propTypes = {
  state: PropTypes.instanceOf(AppState),
};
