import React, {PropTypes } from 'react';

import * as c from '../../styles/colors';
import * as defaultStyles from '../../styles/default';
import { mergeStyles } from '../../helpers/ui';
// import { separateChildrenRow } from '../../helpers/react';

// Since this component is simple and static, there's no parent component for it.
const FlexContainer = (props) => {
  // console.log("FlexContainer:render()", "props:", props);
  const {
    children, width,  title, separateWidth,
    justifyContent, alignItems, alignContent, 
    flexDirection, flexWrap, style, onClick
  } = props;

  const flexFlow = flexDirection + " " + flexWrap;
  const styles = {
    container: {
      width: width,
      display: 'flex',
      flexFlow: 'column nowrap',
      flexWrap: "nowrap",
      justifyContent: "flex-start",
      alignItems: "stretch",
      alignContent: "stretch",
      // marginRight: separateWidth,
      // outline: "2px solid green"
    },
    banner: {
      paddingLeft: defaultStyles.smallRelativeSpace,
      marginBottom: separateWidth,
      marginRight: separateWidth,   // This seems like a hack somehow ....
      background: c.metricBannerBackground,
      color: c.metricBannerColor,
    },
    flexContainer: {
        display: 'flex',
        flexFlow: flexFlow,
        justifyContent: justifyContent,
        alignItems: alignItems,
        alignContent: alignContent,
        // outline: "2px dashed red"
    }
  };

  const mergedStyles = mergeStyles(styles, style, 'container');
  return (
      <div style={mergedStyles.container}>
        {title ?  <div style={mergedStyles.banner}>{title}</div> : ""}
        <div style={mergedStyles.flexContainer} onClick={onClick}>
          {children}
{/*}      {separateChildrenRow(children, separateWidth)} {*/}
      </div>
    </div>
  );
};

FlexContainer.defaultProps = {
  width: "auto",
  separateWidth: defaultStyles.metricSeparator,
  style: {},
  flexDirection: "row",
  flexWrap: "nowrap",
  justifyContent: "flex-start",
  alignItems: "stretch",
  alignContent: "stretch",
  title: undefined,
};

FlexContainer.propTypes = {
  onClick: PropTypes.func,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  separateWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  style: PropTypes.object,
  flexDirection: PropTypes.string,
  flexWrap: PropTypes.string,
  justifyContent: PropTypes.string,
  alignItems: PropTypes.string,
  alignContent: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.array, PropTypes.string])
};

export default FlexContainer;
