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

// import NavigationExpandMoreIcon from 'material-ui/svg-icons/navigation/expand-more';

import ToolbarTextLogo from './common/ToolbarTextLogo';

const HOME_ITEM = 0;
const ABOUT_ITEM = 1;
const LOGOUT_ITEM = 2;
const  MenuItems = {
  home: {value: HOME_ITEM, name: "Home", path: "/home"},
  about: {value: ABOUT_ITEM, name: "About", path: "/about" },
  logout: {value: LOGOUT_ITEM, name: "Logout", path: "/" }
};
// This value will look selected the first time the menu comes up.
const FIRST_MENU_VALUE=0; // Home menu defined above.

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
    this.state = {
      value: FIRST_MENU_VALUE,
    };

    // Bind the handlers.
    this.handleMenuChange = this.handleMenuChange.bind(this);
    this.renderMenuItems = this.renderMenuItems.bind(this);
    this.defineMenu = this.defineMenu.bind(this);
    this.getMenuItem = this.getMenuItem.bind(this);
    // this.checkForErrors = this.checkForErrors.bind(this);
  }

  componentWillReceiveProps(newProps) {
    // console.log("App:componentWillRecceiveProps()", "state:", this.state, "newProps:", newProps);
  }

  handleMenuChange(event, value) {
    console.log("App:handleMenuChange()", "event:", event, "value:", value, "props:", this.props);
    const newPath = this.getMenuItem(value).path;

    if (value === LOGOUT_ITEM) {
      this.props.handleLogout();
    }

    this.setState({value});
    browserHistory.push(newPath);
  }

  getMenuItem(value) {
    return this.defineMenu().find((e) => e.value === value);
  }

  defineMenu() {
    const { loggedIn } = this.props;
    let items = [];
    if (loggedIn) {
      items = [MenuItems.home, MenuItems.about, MenuItems.logout];
    } else {
      items =[MenuItems.about];
    }
    return  items;
  }

  renderMenuItems() {
    return this.defineMenu().map((i) => <MenuItem key={i.value} value={i.value} primaryText={i.name}/>);
  }

  render() {
    console.log("App:render()", "state:", this.state, "props:", this.props);
    const { value } = this.state;
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
              <RefreshIndicator onClick={handleRefresh} status={loadingStatus} percentage={100} size={40} left={-24} top={8} />
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
