import React, { PropTypes } from 'react';

import * as defaultStyles from '../../styles/default';
import { mergeStyles } from '../../helpers/ui';

// Use default values if undefined.
// For the columnWidth or rowHeight use "auto" for 0.  TODO: This is probably a mnistake.
const Grid = ({children, columns, rows, rowHeight, rowGap, columnWidth, columnGap, style}) => {

  const rowSize  = (rowHeight !== undefined) ? rowHeight : ((rowHeight ===0 ) ? "auto" : defaultStyles.rowHeight);
  const columnSize = (columnWidth !== undefined) ? columnWidth : ((columnWidth === 0) ? "auto" : defaultStyles.rowHeight);
  const rg = (rowGap !== undefined) ? rowGap : defaultStyles.rowGutter;
  const cg = (columnGap !== undefined) ? columnGap : defaultStyles.columnGutter;
  let styles = {
    container: {
      display: "inline-grid",
      gridAutoColumns: columnSize,
      gridAutoRows: rowSize,
      gridColumnGap: cg,
      gridRowGrap: rg,
      justifyitems: "stretch",
      alignItems: "stretch",
      justifyContet: "center",
      alignContent: "center",
      gridAutoFlow: "row dense",
      outline: "0px solid black"
    }
  };
  if (rows !== undefined) {
    let rowSpec = {
      gridTemplateRows: `repeat( ${rows}, ${rowSize})`,
      gridAutoFlow: "column dense"
    };
    styles = mergeStyles(styles, rowSpec, "container");
  }
  if (columns !== undefined) {
    let colSpec = {
      gridTemplateColumns: `repeat( ${columns}, ${columnSize})`,
      gridAutoFlow: "row dense"
    };
    styles = mergeStyles(styles, colSpec, "container");
  }
  const mergedStyles = mergeStyles(styles, style, "container");

  return (
    <div style={mergedStyles.container}> {children} </div>
  );
};


Grid.propTypes = {
  children: PropTypes.array,
  style: PropTypes.object,
  rowHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  rowGap: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  columnWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  columnGap: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  rows: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  columns: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

Grid.defaultProps = {
};

export default Grid;
