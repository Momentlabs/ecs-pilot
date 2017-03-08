import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as authActions from '../actions/auth';
import * as errorActions from '../actions/error';
import * as serverActions from '../actions/serverData';
import App from '../components/App';


// status property for the App's RefreshIndicator.
const load = {
  READY: "ready",
  LOADING: "loading",
  HIDE: "hide"
};

const LOGO_CLICK_BROWSER_PATH = "/";

class AppContainer extends React.Component {
  
  static defaultProps = {
    error: undefined,
    loadingStatus: load.READY,
    selectedClusters: [],
    auth: undefined,
  }

  static propTypes = {
    children: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    auth: PropTypes.object,
    error: PropTypes.object,
    loadingStatus: PropTypes.string ,
    selectedClusters: PropTypes.array
  }

  constructor(props, context) {
    super(props, context);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
    this.handleLogoClick = this.handleLogoClick.bind(this);
    this.handleRefresh = this.handleRefresh.bind(this);
    this.updateMessages = this.updateMessages.bind(this);
    this.handleSBClose = this.handleSBClose.bind(this);
    this.componentWillMount = this.componentWillMount.bind(this);

    this.state = {
      pendingMessages: [],
    };
  }

  componentWillMount() {
    console.log("AppContainer:componentWillMount()", "props:", this.props);
    const { auth } = this.props;
    if (auth && auth.service.loggedIn()) {
      console.log("AppContainer:componentWillMount() - loggedIn.");
      this.props.actions.requestSessionId();
    }
  }

  componentWillReceiveProps(newProps) {
    // console.log("AppContainer:componentWillReceiveProps()", "newProps:", newProps, "state:", this.state);
    const { error } = newProps;
    let newMessage = undefined;
    if (error && error.err) {
      newMessage = {message: error.err.displayMessage, id: error.id};
      this.props.actions.reportedError(error);
    }
    const newState = this.updateMessages(newMessage, this.state.pendingMessages);
    this.setState(newState);
  }

  updateMessages(message, pendingMessages) {
    // console.log("AppContainer:updateMessages() - considering adding message:", message, "to:", pendingMessages);
    if(message) {
      const found = (pendingMessages.find((e) => e.id === message.id) === undefined) ? false : true;
      if (!found) {
        // console.log("AppContainer:updateMessages() - adding message:", message);
        pendingMessages.push(message);
      }
    }
      return ({
      pendingMessages: pendingMessages
    });
  }

  handleSBClose() {
    // console.log("App:handleSBClose", "state:", this.state);
    let { pendingMessages } = this.state;
    pendingMessages.shift();
    const newState = this.updateMessages(undefined, pendingMessages);
    this.setState(newState);
  }

  handleRefresh(event) {
    // console.log("AppContainer#handleRefresh clicked", event, "clusters:", this.props.selectedClusters);
    event.preventDefault();
    this.props.actions.requestAll(this.props.selectedClusters);
  }

  handleUpdate(event) {
    event.preventDefault();
    // console.log("Clicked!", "event:", event, "state:", this.state, "props:", this.props);
    let err = new Error("Testing the error mechanism.");
    err.displayMessage = "New Error: " + err.message;
    this.props.actions.reportError(err);
  }

  handleLogoClick(event) {
    event.preventDefault();
    // console.log("Logo click.");
    this.props.router.push(LOGO_CLICK_BROWSER_PATH);
  }

  handleLogin(event) {
    // console.log("Handle Login." , "state:", this.state, "props:", this.props);
    const { auth } = this.props;
    // this.props.actions.showLogin();
    auth.service.login();
  }

  handleLogout(event) {
    // console.log("AppContainer::handleLogout");
    const { auth } = this.props;
    auth.service.logout();
  }

  render() {
    // console.log("AppContainer:render()","state:", this.state, "props", this.props);
    const { auth, loadingStatus, children } = this.props;
    const { service, profile } = auth;
    // const { name, nickname, picture } = profile;
    const { pendingMessages } = this.state;
    const {sbOpen, sbMessage} = (pendingMessages[0]) ? 
      {sbOpen: true, sbMessage: pendingMessages[0].message} : 
      {sbOpen: false, sbMessage: ""};

    const loginStatus = (service && service.loggedIn()) ? true : false;
    const avatar = (profile && profile.picture) ? profile.picture : undefined;
    let displayName = undefined;
    if (profile) {
      displayName = (profile.nickname) ? profile.nickname : profile.name;
    }
    // console.log("AppContainer:render()", "loadingStatus:", loadingStatus, "sbOpen:", sbOpen, "sbMessage:", sbMessage);
    return (
      <App 
        loggedIn={loginStatus}
        loadingStatus={loadingStatus}
        userName={displayName}
        avatarURL={avatar}
        handleSBClose={this.handleSBClose}
        handleRefresh={this.handleRefresh}
        handleUpdate={this.handleUpdate}
        handleLogoClick={this.handleLogoClick}
        handleLogin={this.handleLogin}
        handleLogout={this.handleLogout}
        sbOpen={sbOpen}
        sbMessage={sbMessage}
        children={children}
      />
    );
  }
}

const mapStateToProps = (state, ownProps) => { 
  // console.log("AppContainer#mapStateToProps", "state:", state, "ownProps:", ownProps);
  const { auth, error, loading, selectedClusters } = state;

  const loadingStatus = (loading && (loading.length() > 0)) ? load.LOADING : load.READY;
  const err = error && error.peek() ?  error.peek() : undefined;// get the top of the queue (don't remove!)
  // const err = error;
  return ({
    auth: auth,
    error: err,
    loadingStatus: loadingStatus,
    selectedClusters: selectedClusters
  }); 
};

const mapDispatchToProps = (dispatch, ownProps) => { 
  // console.log("AppContainer#mapDispatchToProps", "ownProps:", ownProps);
  return ({actions: bindActionCreators(Object.assign({}, authActions, errorActions, serverActions), dispatch)}); 
};

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);


