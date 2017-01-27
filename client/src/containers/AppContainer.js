import React, { PropTypes } from 'react';
// import { Link, IndexLink } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as errorActions from '../actions/error';

import App from '../components/App';


class AppContainer extends React.Component {
  
  static defaultProps = {
    error: undefined,
  }

  static propTypes = {
    children: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    error: PropTypes.object
  }

  constructor(props, context) {
    super(props, context);
    this.handleUpdate = this.handleUpdate.bind(this);
  }

  componentWillMount() {
    // this.props.actions.requestAppContainer();
  }

  handleUpdate(event) {
    console.log("Clicked!", "event:", event, "state:", this.state);
    let err = new Error("Testing the error mechanism.");
    err.displayMessage = "New Error: " + err.message;
    this.props.actions.reportError(err);
  }

  render() {
    console.log("AppContainer:render()","state:", this.state, "props", this.props);
    const { error, children } = this.props;
    return (
      <App error={error} handleUpdate={this.handleUpdate} children={children}/>
    );
  }
}

const mapStateToProps = (state) => { 
  console.log("AppContainer#mapStateToProps", "state:", state);
  const error =  state.error.error ? state.error.error : undefined;
  return ({
    error: error
  }); 
};

const mapDispatchToProps = (dispatch, ownProps) => { 
  console.log("AppContainer#mapDispatchToProps", "ownProps:", ownProps);
  return ({actions: bindActionCreators(errorActions, dispatch)}); 
};

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);


