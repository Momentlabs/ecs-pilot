import React, { PropTypes } from 'react';

import * as defaultStyles from '../../styles/default';
import { mergeStyles } from '../../helpers/ui';
import * as c from '../../styles/colors';

function childColumns(children) {
  const columns = React.Children.map(children, (child) => {
    return child.props.columns ? child.props.columns : 1;
  });
  const total = columns.reduce( (acc, cols) => acc + cols);
  return total;
}

const MetricGroup = ({ title, children, columns, style }) => {


  // const childCount = React.Children.count(children);
  const widthInColumns = (columns === undefined) ? childColumns(children) : columns;

  const separatorWidth = defaultStyles.metricSeparator;
  const rg = defaultStyles.metricSeparator;
  const cg = defaultStyles.metricSeparator;

  const columnSize = defaultStyles.metricWidth;
  const rowSize = defaultStyles.metricWidth;

  const styles = {
    container: {
      height: 'auto',  
      display: 'flex',
      marginRight: separatorWidth,
      flexFlow: "column nowrap",
      justifyContent: "stretch",
      justifyitems: "stretch",
      alignItems: "stretch",
    },
    banner: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      padding: defaultStyles.xSmallRelativeSpace,
      // paddingLeft: defaultStyles.smallRelativeSpace,
      // marginBottom: separatorWidth,
      // justifySelf: "center",
      // alignSelf: "center",
      background: c.metricBannerBackground,
      color: c.metricBannerColor,
    },
    metrics: {
      display: 'inline-grid',
      gridAutoColumns: columnSize,
      gridAutoRows: rowSize,
      gridTemplateColumns: `repeat( ${widthInColumns}, ${columnSize})`,
      gridAutoFlow: "row dense",
      gridColumnGap: cg,
      gridRowGap: rg,
      justifyContent: "stretch",
      // outline: "1px solid black",
    }
  };

  let mergedStyles = mergeStyles(styles, style, "container");

  // if (tabTitle) mergedStyles = mergeStyles(mergedStyles, {alignSelf: "flexStart"}, "title");
  // console.log("Metric group", "Title:", title, ", containerStyles", mergedStyles.container, ", metricStyles:", mergedStyles.metric);
  if (React.Children.count(children) === 0) { 
    return <div />;
  } else {
    return (
      <div style={mergedStyles.container}>
        <div style={mergedStyles.metrics}>
          {title ?  <div style={mergedStyles.banner}>{title}</div> : ""}
          {children}
        </div>
      </div>
    );
  }
};

MetricGroup.propTypes = {
  title: PropTypes.string,
  style: PropTypes.object,
  columns: PropTypes.number,
  minWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  // separateMetricWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  banner: PropTypes.bool,
  children: PropTypes.node
};

MetricGroup.defaultProps = {
  style: {},
  columns: undefined,
  // minWidth: "auto",
  // separateMetricWidth: defaultStyles.smallAbsoluteSpace,
  title: undefined,
};

export default MetricGroup;




// const MetricGroup = ({ title, children, columns, minWidth, separateMetricWidth, tabTitle, style }) => {

  // const separatorWidth = defaultStyles.metricSeparator;
  // const styles = {
  //   container: {
  //     height: 'auto',
  //     display: 'flex',
  //     // marginRight: separatorWidth,
  //     flexFlow: "column nowrap",
  //     justifyContent: "stretch",
  //     // outline: "1px solid green"
  //   },
  //   banner: {
  //     // marginLeft: 0,
  //     // marginRight: 0, // TODO: contstants and magic numbers (seperators?)
  //     marginBottom: separatorWidth,
  //     background: c.metricBannerBackground,
  //     color: c.metricBannerColor,
  //   },
  //   title: {
  //     paddingLeft: defaultStyles.smallRelativeSpace
  //   },
  //   metrics: {
  //     minWidth: minWidth,
  //     height: 'inherit',
  //     flexGrow: 5,
  //     display: 'inline-flex', // eslint-disable-line no-dupe-keys
  //     flexFlow: "row nowrap",
  //     justifyContent: "stretch",
  //     alignItems: "stretch",
  //     // alignContent: alignContent,
  //     // outline: "2px solid red",
  //   }
  // };  
  // let mergedStyles = mergeStyles(styles, style, "container");
  // if (tabTitle) mergedStyles = mergeStyles(mergedStyles, {alignSelf: "flexStart"}, "title");
  // if (React.Children.count(children) === 0) { 
  //   return <div /> 
  // }
  // return (
  //   <div style={mergedStyles.container}>
  //     {title ?  <div style={mergedStyles.banner}><div style={mergedStyles.title}>{title}</div></div> : ""}
  //     <div style={mergedStyles.metrics}>{separateChildrenRow(children, separateMetricWidth)}</div>
  //   </div>
  // );
