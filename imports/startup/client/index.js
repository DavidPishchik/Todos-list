import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';

import '../accounts-config.js';
import App from '../../ui/App.jsx';

import '../../ui/stylesheets/app.css';

Meteor.startup(() => {
  render(<App />, document.getElementById('render-target'));
});
