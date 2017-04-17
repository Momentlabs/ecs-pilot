import React from 'react';
import { Route, IndexRoute } from 'react-router';
import AppContainer from './containers/AppContainer';
import LandingPage from './components/LandingPage';
import HomePage from './components/HomePage';
import AboutPage from './components/AboutPage';
import TestLayout from './components/TestLayout';
import NotFoundPage from './components/NotFoundPage';

import * as errorActions from './actions/error';

// const authService = undefined;

function checkAuth(s) {
  const store = s;
  return function(nextState, replace) {
    const auth = store.getState().auth.service;
    if (!auth.loggedIn()) {
      // console.log("checkAuth() - notLoggedIn");
      const err = new Error("Not logged in.");
      err.displayMessgae = err.message;
      store.dispatch(errorActions.reportError(new Error("Not logged in.")));
      replace({pathname: "/"}); // TODO: should probably spelunk nextState for the right place.
    } else {
      // console.log("checkAuth() - loggedIn");
    }
  };
}

export default function(store) {
  // console.log("Creating routes: ", "store:", store);
  return (
    <Route path="/" component={AppContainer}>
      <IndexRoute component={LandingPage} />
      <Route path="/home" component={HomePage} onEnter={checkAuth(store)}/>
      <Route path="/about" component={AboutPage}/>
      <Route path="/test" component={TestLayout} />
      <Route path="*" component={NotFoundPage}/>
    </Route>
  );
}

/*
  Flow:

  Path        Protected
    /                     Landing page.
                            Login menu item => click pops up Auth0Lock or takes to Login/Signin page.
                            Failure brings you back here with some notification (drawer or ???)

    /home       *         Main application page. For now this is where all the work gets done.

    /features

    /about

    /notfound             404 and others.

  
  I think I want two separate SPA pages (but for now, it's going to be one app)
    1. Marketing/Landing
        (so everything but /HomePage)
        Then Login redirects you to the application page, token kept in local storage?
        Is it possible to share local storage between apps?

    2. Application
        /HomePage and /NotFound (at least for now).



*/