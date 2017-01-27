import React, { PropTypes } from 'react';
import { browserHistory } from 'react-router';
import { bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as errorActions from '../actions/error';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import darkBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

// import DropDownMenu from 'material-ui/DropDownMenu';
import FontIcon from 'material-ui/FontIcon';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
// import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import {Toolbar, ToolbarGroup, ToolbarSeparator } from 'material-ui/Toolbar';
import Snackbar from 'material-ui/Snackbar';

// import NavigationExpandMoreIcon from 'material-ui/svg-icons/navigation/expand-more';

import ToolbarTextLogo from './common/ToolbarTextLogo';

// Menu item definition, used in constructor to build out the menu.
const  defineMenu = [
  {value: 0, name: "Home", path: "/"},
  {value: 1, name: "About", path: "/about" },
  {value: 2, name: "Dashboard", path: "/dashboard"}
];
let useMenu = [];
// This value will look selected the first time the menu comes up.
const FIRST_MENU_VALUE=0; // Home menu defined above.

export default class App extends React.Component {

  static defaultProps = {
    error: undefined
  }

  static propTypes = {
    openSnackbar: PropTypes.bool,
    // error: PropTypes.object,
    handleUpdate: PropTypes.func.isRequired,
    children: PropTypes.object.isRequired
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      sbMessage: "",
      sbOpen:false,
      pendingErrors: [],
      error: undefined,
      value: FIRST_MENU_VALUE,
    };

    // Take the definied menu items and put then in an array keyed on thier item values.
    // This makes item value the order of display.
    defineMenu.map((menuItem) => useMenu[menuItem.value] = menuItem);

    // Bind the handlers.
    this.handleMenuChange = this.handleMenuChange.bind(this);
    this.renderMenuItems = this.renderMenuItems.bind(this);
    this.closeSnackbar = this.closeSnackbar.bind(this);
    this.checkForErrors = this.checkForErrors.bind(this);
  }

  componentWillReceiveProps(newProps) {
    console.log("App:componentWillRecceiveProps()", "state:", this.state, "newProps:", newProps);
    const { error } = newProps;
    this.checkForErrors(error, this.state.pendingErrors);
  }

  // TODO: Generalize this as a generic message update.
  // add some kind of tiered type: update/info, warning, error.
  // Need to queue new errors.
  // TODO: Also, this handling needs to brought up to the parent app container
  checkForErrors(error, pendingErrors) {
    console.log("App:CheckForErrors()", "error:", error, "pendingErrors:", pendingErrors);
    let newErrors = pendingErrors;
    if (error) {
      newErrors = pendingErrors.concat([error]);
    }
    const {sbo, sbm} = (newErrors.length > 0) ? {sbo: true, sbm: newErrors[0].displayMessage} : {sbo: false, sbm: ""};
    console.log("App:checkForErrors()", "sbOpen:", sbo, "sbMessage:", sbm, "pendingErrors:", newErrors);
    this.setState({
      pendingErrors: newErrors,
      sbOpen: sbo,
      sbMessage: sbm
    });
  }

  closeSnackbar() {
    console.log("App:closeSnackbar()", "state:", this.state);
    let { pendingErrors } = this.state;
    pendingErrors.pop();
    this.checkForErrors(undefined, pendingErrors);
  }

  handleMenuChange(event, value) {
    let newPath = useMenu[(value)].path;
    this.setState({value});
    browserHistory.push(newPath);
  }

  // This should get memoized as it doesn't change.
  renderMenuItems() {
    return useMenu.map((i) => <MenuItem key={i.value} value={i.value} primaryText={i.name}/>);
  }

  render() {
    console.log("App:render()", "state:", this.state, "props:", this.props);
    const { value, sbOpen, sbMessage } = this.state;
    const { handleUpdate } = this.props;
    // const {sbOpen, sbMessage} = (error === undefined) ? {sbOpen: false, sbMessage: ""} : {sbOpen: true, sbMessage: error.message};
    console.log("App:render()", "sbOpen:", sbOpen, "sbMessage:", sbMessage);
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
        <div>
          <div>
          <Toolbar>
            <ToolbarGroup firstChild={true}>
              <ToolbarTextLogo logoValue="ECS Pilot" />
            </ToolbarGroup>
            <ToolbarGroup>
              <FontIcon className="material-icons">home</FontIcon>
              <ToolbarSeparator/>
              <RaisedButton label="Update" primary={true} onClick={handleUpdate}/>
              <IconMenu 
                iconButtonElement={<IconButton><FontIcon className="material-icons">menu</FontIcon></IconButton>}
                anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                targetOrigin={{horizontal: 'left', vertical: 'top'}}
                onChange={this.handleMenuChange}
                children={this.renderMenuItems()}
                value={value}/>
            </ToolbarGroup>
          </Toolbar>
          {this.props.children}
          </div>
          <Snackbar  open={sbOpen} message={sbMessage} action="Ok" onActionTouchTap={this.closeSnackbar} onRequestClose={this.closeSnackbar}/>
        </div>
      </MuiThemeProvider>
    );
  }
}
