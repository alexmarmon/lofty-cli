import React from 'react';
import { Link } from 'react-router-dom';

// scss
import './{{moduleName}}.scss';

export default class {{moduleName}} extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div className="{{name}}">
        <h1>{{moduleName}}</h1>
      </div>
    )
  }
}