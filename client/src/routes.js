import React from 'react';
import { Route, IndexRoute } from 'react-router';
import AppContainer from './containers/AppContainer';
import LandingPage from './components/LandingPage';
import HomePage from './components/HomePage';
import AboutPage from './components/AboutPage';
import NotFoundPage from './components/NotFoundPage';

function indexPage(nextState, replace) {
  console.log("indexPage:", "nextState:", nextState);
}

export default (
  <Route path="/" component={AppContainer}>
    <IndexRoute component={LandingPage} onEnter={indexPage} />
    <Route path="/home" component={HomePage}/>
    <Route path="/about" component={AboutPage}/>
    <Route path="*" component={NotFoundPage}/>
  </Route>
);

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