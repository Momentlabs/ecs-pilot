import React, { PropTypes } from 'react';

import * as defaultStyles from '../../styles/default';
import * as c from '../../styles/colors';
import { mergeStyles } from '../../helpers/ui';


const GridTitle = ({title, subtitle, columns, sub1, sub2, sub3, style}) => {

  let bgColor = c.gridTitleBackground;
  let fgColor = c.gridTitle;
  if (sub1) {
    bgColor = c.gridSub1;
    fgColor = c.gridSub1Title;
  }
  if (sub2) {
    bgColor = c.gridSub2;
    fgColor = c.gridSub2Title;
  }
  if (sub3) {
    bgColor = c.gridSub3;
    fgColor = c.gridSub3Title;

  }
  bgColor = sub1 ? c.gridSub1 : bgColor;
  bgColor = sub2 ? c.gridSub2 : bgColor;
  bgColor = sub3 ? c.gridSub3 : bgColor;

  const styles = {
    container: {
      gridColumn: `span ${columns}`,
      backgroundColor: bgColor,
      color: fgColor,
      display: "inline-flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      // outline: "1px solid black"
    },
    banner: {
      fontSize: defaultStyles.gridTitleFontSize,
      // paddingLeft: defaultStyles.smallRelativeSpace,
      // paddingRight: defaultStyles.smallRelativeSpace,
      textAlign: "center",
      // outline: "1px solid red"
    },
    subtitle: {
      fontSize: "x-small",
      textAlign: "center",
    }
  };
  let mergedStyles = mergeStyles(styles, style, "container");

  return (
    <div style={mergedStyles.container}>
      <div style={mergedStyles.banner}>{title}</div>
      <div style={mergedStyles.subtitle}>{subtitle}</div>
    </div>
  );
};



GridTitle.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  columns: PropTypes.number,
  sub1: PropTypes.bool,
  sub2: PropTypes.bool,
  sub3: PropTypes.bool,
  style: PropTypes.object,
  children: PropTypes.element
};

GridTitle.defaultProps = {
  style: {},
  subtitle: "",
  sub1: false,
  sub2: false,
  sub3: false,
  columns: 1,
};

export default GridTitle;
