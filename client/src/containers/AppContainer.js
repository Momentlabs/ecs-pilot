import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as errorActions from '../actions/error';

import App from '../components/App';


// status property for the App's RefreshIndicator.
const load = {
  READY: "ready",
  LOADING: "loading",
  HIDE: "hide"
};

class AppContainer extends React.Component {
  
  static defaultProps = {
    error: undefined,
    loadingStatus: load.READY,
  }

  static propTypes = {
    children: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    error: PropTypes.object,
    loadingStatus: PropTypes.string 
  }

  constructor(props, context) {
    super(props, context);
    this.handleUpdate = this.handleUpdate.bind(this);
    this.handleRefresh = this.handleRefresh.bind(this);
    this.updateMessages = this.updateMessages.bind(this);
    this.handleSBClose = this.handleSBClose.bind(this);

    this.state = {
      pendingMessages: [],
    };
  }

  componentWillReceiveProps(newProps) {
    console.log("AppContainer:componentWillReceiveProps()", "newProps:", newProps);
    const { error } = newProps;
    const newMessage = (error) ? error.displayMessage : undefined;
    const newState = this.updateMessages(newMessage);
    this.setState(newState);
  }

  updateMessages(message) {
    let { pendingMessages } = this.state
    let newMessages = pendingMessages;

    // Enqueue new message
    if (message) {
      newMessages = pendingMessages.concat([{sbMessage: message, sbOpen: true}]);
    }

    return ({
      pendingMessages: newMessages,
    });
  }

  handleSBClose() {
    console.log("App:handleSBClose", "state:", this.state);
    let { pendingMessages } = this.state;
    pendingMessages.pop();
    const newState = this.updateMessages();
    this.setState(newState);
  }

  handleRefresh(event) {
    event.preventDefault();
    console.log("AppContainer#handleRefresh clicked", event);
}

  handleUpdate(event) {
    event.preventDefault();
    console.log("Clicked!", "event:", event, "state:", this.state);
    let err = new Error("Testing the error mechanism.");
    err.displayMessage = "New Error: " + err.message;
    this.props.actions.reportError(err);
  }

  render() {
    console.log("AppContainer:render()","state:", this.state, "props", this.props);
    const { loadingStatus, children } = this.props;
    const { pendingMessages } = this.state;
    const {sbOpen, sbMessage} = (pendingMessages[0]) ? pendingMessages[0] : {sbOpen: false, sbMessage: ""}
    console.log("AppContainer:render()", "sbOpen:", sbOpen, "sbMessage:", sbMessage);
    return (
      <App 
        loadingStatus={loadingStatus} 
        handleSBClose={this.handleSBClose}
        handleRefresh={this.handleRefresh}
        handleUpdate={this.handleUpdate}
        sbOpen={sbOpen}
        sbMessage={sbMessage}
        children={children}
      />
    );
  }
}

const mapStateToProps = (state) => { 
  console.log("AppContainer#mapStateToProps", "state:", state);
  const {error, loading} = state;
  const err =  (error && error.error) ? error.error : undefined;
  const loadingStatus = (loading && (loading.length() > 0)) ? load.LOADING : load.READY;
  return ({
    error: err,
    loadingStatus: loadingStatus
  }); 
};

const mapDispatchToProps = (dispatch, ownProps) => { 
  console.log("AppContainer#mapDispatchToProps", "ownProps:", ownProps);
  return ({actions: bindActionCreators(errorActions, dispatch)}); 
};

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);


