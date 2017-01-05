// Set up your application entry point here...
import 'babel-polyfill'; // probably only need the object.assign is needed.
import './styles/styles.css';
import React from 'react';
import { render } from 'react-dom';
import { Router, browserHistory } from 'react-router';
import routes from './routes';
import injectTapEventPlugin from 'react-tap-event-plugin';

// import '../node_modules/bootstrap/dist/css/bootstrap.min.css';

injectTapEventPlugin();

render( 
  <Router history={browserHistory} routes={routes}/>,  
  document.getElementById('App')
);