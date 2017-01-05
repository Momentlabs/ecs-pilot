import React, { PropTypes } from 'react';

import FontIcon from 'material-ui/FontIcon';
// import {Toolbar, ToolbarGroup, ToolbarSeparator } from 'material-ui/Toolbar';
import { ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar';

// import {cyan500} from 'material-ui/styles/colors';
import * as color from '../../styles/colors';

const textStyle = {
  marginLeft: 24
};

// Since this component is simple and static, there's no parent container for it.
// My eslint is not letting me export this as default inline wiht the definition.
// It's giving me a ToolbarTextLogo undefined error. Go figure.
const ToolbarTextLogo = ({logoValue}) => {
  return (
    <ToolbarGroup>
      <FontIcon className="material-icons" color={color.primary}>directions_boat</FontIcon>
      <ToolbarTitle text={logoValue} style={textStyle} />
    </ToolbarGroup>
  );
};

ToolbarTextLogo.propTypes = {
  logoValue: PropTypes.string.isRequired
};

export default ToolbarTextLogo;