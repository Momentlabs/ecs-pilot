// This is needed for Object.assign and generator support for sagas.
import 'babel-polyfill'; 
import './styles/styles.css';
import React from 'react';
import { render } from 'react-dom';
import { Router, browserHistory } from 'react-router';
import routes from './routes';
import injectTapEventPlugin from 'react-tap-event-plugin';
// import '../node_modules/bootstrap/dist/css/bootstrap.min.css';

import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import createSagaMiddleware from 'redux-saga';

import { initAuth } from './actions/auth';
import rootSaga from './sagas';
import reducers from './reducers';




console.log("Application:/src/index.js - setup including redux, and sagas.");
injectTapEventPlugin();
const sagaMiddleware = createSagaMiddleware();
const store = createStore(reducers, applyMiddleware(sagaMiddleware));
sagaMiddleware.run(rootSaga);

store.dispatch(initAuth("3F0LkHS5KJb35w4k5WbxnsMVWKWiHi2y", "momentlabs.auth0.com"));


console.log("Applicaiton:/src/index.js calling render.");


render(
  <Provider store={store}>
    <Router history={browserHistory} routes={routes}/>
  </Provider>, document.getElementById('App')
);