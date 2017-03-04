import React, { PropTypes } from 'react'; 
import { browserHistory } from 'react-router';
import { bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as errorActions from '../actions/error';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import darkBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

// import DropDownMenu from 'material-ui/DropDownMenu';
import Avatar from 'material-ui/Avatar';
import FontIcon from 'material-ui/FontIcon';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import MenuItem from 'material-ui/MenuItem';
// import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import {Toolbar, ToolbarGroup, ToolbarSeparator } from 'material-ui/Toolbar';
import Snackbar from 'material-ui/Snackbar';

import ToolbarTextLogo from './common/ToolbarTextLogo';


// Define the menus up here 
// defineMenu() below returns the current relevant one.
const  MenuItems = {
  home: {value: 0, name: "Home", path: "/home"},
  about: {value: 1, name: "About", path: "/about" },
  logout: {value: 2, name: "Logout", path: "/" }
};
const UserMainMenu = [MenuItems.home, MenuItems.about, MenuItems.logout];
const LandingMainMenu = [MenuItems.about];

// TODO: This can now be made a pure component.
export default class App extends React.Component {

  static defaultProps = {
    loggedIn: false,
    userName: undefined,
    avatarURL: undefined,
    error: undefined,
    sbOpen: false,
    sbMessage: "",
    handleSBClose: undefined,
    handleRefresh: undefined,
    handleUpdate: undefined,
    handleLogoClick: undefined
  }

  static propTypes = {
    loggedIn: PropTypes.bool,
    userName: PropTypes.string,
    avatarURL: PropTypes.string,
    sbOpen: PropTypes.bool,
    sbMessage: PropTypes.string,
    loadingStatus: PropTypes.string.isRequired,
    handleSBClose: PropTypes.func,
    handleUpdate: PropTypes.func,
    handleRefresh: PropTypes.func,
    handleLogoClick: PropTypes.func,
    handleLogin: PropTypes.func.isRequired,
    handleLogout: PropTypes.func.isRequired,
    children: PropTypes.object.isRequired
  }

  constructor(props, context) {
    super(props, context);

    // Bind the handlers.
    this.handleMenuChange = this.handleMenuChange.bind(this);
    this.renderMenuItems = this.renderMenuItems.bind(this);
    this.defineMenu = this.defineMenu.bind(this);
    this.getMenuItem = this.getMenuItem.bind(this);
  }

  // componentWillReceiveProps(newProps) {
  //   // console.log("App:componentWillRecceiveProps()", "state:", this.state, "newProps:", newProps);
  // }

  handleMenuChange(event, value) {
    // console.log("App:handleMenuChange()", "event:", event, "value:", value, "props:", this.props);
    const menuItem = this.getMenuItem(value);
    const newPath = menuItem.path;

    if (menuItem.value === MenuItems.logout.value) {
      this.props.handleLogout();
    }

    this.setState({value});
    browserHistory.push(newPath);
  }

  getMenuItem(value) {
    return this.defineMenu().find((e) => e.value === value);
  }

  // Is there a race condition between getMenuItem and defineMenu
  // that could bite us? Practically it's only if somehow loggedIn changes to no (ie loging out) when selecting home
  // in which case we'd be sent to the landing page on authCheck to home. That should happen and it's not
  // a big deal if it does. Still .....
  defineMenu() {
    return (this.props.loggedIn) ? UserMainMenu : LandingMainMenu;
  }

  renderMenuItems() {
    return this.defineMenu().map((i) => <MenuItem key={i.value} value={i.value} primaryText={i.name}/>);
  }

  render() {
    // console.log("App:render()", "state:", this.state, "props:", this.props);
    const { 
      /*handleUpdate, */ handleSBClose, handleRefresh, handleLogin, handleLogoClick,
      loggedIn, loadingStatus, avatarURL, sbOpen, sbMessage, children } = this.props;
    // const {sbOpen, sbMessage} = (error === undefined) ? {sbOpen: false, sbMessage: ""} : {sbOpen: true, sbMessage: error.message};
    // console.log("App:render()", "sbOpen:", sbOpen, "sbMessage:", sbMessage);

    const styles = {
      avatar : {
        marginLeft: "10",
      }
    }
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
        <div>
          <div>
          <Toolbar>
            <ToolbarGroup firstChild={true}>
              <ToolbarTextLogo logoValue="ECS Pilot" clickOnLogo={handleLogoClick}/>
            </ToolbarGroup>
            <ToolbarGroup>
              {(loggedIn) ? <RefreshIndicator onClick={handleRefresh} status={loadingStatus} percentage={100} size={40} left={-24} top={8} /> : undefined}
              <ToolbarSeparator/>
{/*}              <RaisedButton label="Update" primary={true} onClick={handleUpdate}/> */}
              
              {(loggedIn) ? <Avatar src={avatarURL} style={styles.avatar} /> : (<RaisedButton label="login" primary onClick={handleLogin} />) }
              <IconMenu 
                iconButtonElement={<IconButton><FontIcon className="material-icons">menu</FontIcon></IconButton>}
                anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                targetOrigin={{horizontal: 'left', vertical: 'top'}}
                onChange={this.handleMenuChange}
                children={this.renderMenuItems()}
              />
            </ToolbarGroup>
          </Toolbar>
          {children}
          </div>
          <Snackbar  open={sbOpen} message={sbMessage} action="Ok" onActionTouchTap={handleSBClose} onRequestClose={handleSBClose}/>
        </div>
      </MuiThemeProvider>
    );
  }
}
