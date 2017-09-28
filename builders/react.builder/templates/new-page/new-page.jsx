import React from 'react';
import PropTypes from 'prop-types';
import AppState from '../state/AppState.jsx';
// import modules here

export default class {{pageName}} extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id="{{pageName}}">
        <h1>Welcome to the {{pageName}} page</h1>
      </div>
    );
  }
}

{{pageName}}.propTypes = {
  state: PropTypes.instanceOf(AppState),
};
