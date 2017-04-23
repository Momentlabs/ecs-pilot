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


console.log("Application:/src/index.js - setup including redux, and sagas."); // eslint-disable-line no-console

injectTapEventPlugin();
const sagaMiddleware = createSagaMiddleware();
const store = createStore(reducers, applyMiddleware(sagaMiddleware));
sagaMiddleware.run(rootSaga);

// TODO: This is not a secret, infact it is intended to identify this application, but
// it would be much better to get this ID in some deployment configurable way.
store.dispatch(initAuth("S26s5k7KxPPlAc93KPgR2IvL9G1LhCzx", "momentlabs.auth0.com", store.dispatch));

console.log("Applicaiton:/src/index.js calling render."); // eslint-disable-line no-console


render(
  <Provider store={store}>
    <Router history={browserHistory} routes={routes(store)}/>
  </Provider>, document.getElementById('App')
);