import React, {PropTypes } from 'react';

import { mergeStyles } from '../../helpers/ui';

// Since this component is simple and static, there's no parent component for it.
const FlexContainer = (props) => {
  // console.log("FlexContainer:render()", "props:", props);
  const {
    children, width,  justifyContent, alignItems, alignContent, 
    flexDirection, flexWrap, style
  } = props;

  const flexFlow = flexDirection + " " + flexWrap;
  const styles = {
    container: {
      // paddingTop: 8, // TODO: Theme/constants on spacing. Too many maigic numbers.
      width: width,
      display: "WebkitBox",
      display: "WebkitInlineFlex", // eslint-disable-line no-dupe-keys
      display: 'flex', // eslint-disable-line no-dupe-keys
      WebkitFlexFlow: flexFlow,
      flexFlow: flexFlow,
      WebkitJustifyContent: justifyContent,
      justifyContent: justifyContent,
      WebkitAlignItems: alignItems,
      alignItems: alignItems,
      WebkitAlignContent: alignContent,
      alignContent: alignContent,
      // outline: "2px dashed red"
    }
  };

  const mergedStyles = mergeStyles(styles, style, 'container');

  return (
    <div style={mergedStyles.container}>
      {children}
    </div>
  );
};

FlexContainer.defaultProps = {
  width: "auto",
  style: {},
  flexDirection: "row",
  flexWrap: "nowrap",
  justifyContent: "flex-start",
  alignItems: "stretch",
  alignContent: "stretch",
};

FlexContainer.propTypes = {
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  style: PropTypes.object,
  flexDirection: PropTypes.string,
  flexWrap: PropTypes.string,
  justifyContent: PropTypes.string,
  alignItems: PropTypes.string,
  alignContent: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.array, PropTypes.string])
};

export default FlexContainer;
