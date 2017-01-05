import React, { PropTypes } from 'react';
import { browserHistory } from 'react-router';
// import { Link, IndexLink } from 'react-router';

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

// import NavigationExpandMoreIcon from 'material-ui/svg-icons/navigation/expand-more';

import ToolbarTextLogo from './common/ToolbarTextLogo';


// Top Level Menu Definition
// Defined here and then built out 
// into useMenu in the constructor.
// Value is the order of display, values have to be unique.
const  defineMenu = [
  {value: 0, name: "Home", path: "/"},
  {value: 1, name: "About", path: "/about" },
  {value: 2, name: "Dashboard", path: "/dashboard"}
];
let useMenu = [];
// This value will look selected the first time the menu comes up.
const FIRST_MENU_VALUE=0; // Home menu defined above.

class App extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      value: FIRST_MENU_VALUE
    };

    // Take the definied menu items and put then in an array keyed on thier item values.
    // This makes item value the order of display.
    defineMenu.map((menuItem) => useMenu[menuItem.value] = menuItem);

    // Bind the handlers.
    this.handleMenuChange = this.handleMenuChange.bind(this);
    this.renderMenuItems = this.renderMenuItems.bind(this);
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
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
        <div>
          <Toolbar>
            <ToolbarGroup firstChild={true}>
              <ToolbarTextLogo logoValue="ECS Pilot" />
            </ToolbarGroup>
            <ToolbarGroup>
              <FontIcon className="material-icons">home</FontIcon>
              <ToolbarSeparator/>
              <RaisedButton label="Update" primary={true} />
              <IconMenu 
                iconButtonElement={<IconButton><FontIcon className="material-icons">menu</FontIcon></IconButton>}
                anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                targetOrigin={{horizontal: 'left', vertical: 'top'}}
                onChange={this.handleMenuChange}
                children={this.renderMenuItems()}
                value={this.state.value}/>
            </ToolbarGroup>
          </Toolbar>
          {this.props.children}
        </div>
      </MuiThemeProvider>
    );
  }
}

App.propTypes = {
  children: PropTypes.object.isRequired,
  value: PropTypes.number
};

export default App;
  