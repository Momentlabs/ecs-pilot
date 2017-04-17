import React, { PropTypes } from 'react';

import * as defaultStyles from '../../styles/default';
import { mergeStyles } from '../../helpers/ui';


const MetricGrid = ({columns, rows, style, children}) => {
  const rg = defaultStyles.rowGutter;
  const cg = defaultStyles.columnGutter;
  const columnSize = defaultStyles.columnWidth;
  const rowSize = defaultStyles.rowHeight;
  const noOfColumns = columns;
  const noOfRows = rows;
  const colSpec = (columns) ? `repeat(${noOfColumns}, ${columnSize})` : "";
  const rowSpec = (rows) ? `repeat(${noOfRows}, ${rowSize})` : "";
  const styles = {
    container: {
      display: 'inline-grid',
      gridAutoColumns: columnSize,
      gridAutoRows: rowSize,
      gridTemplateColumns: colSpec,
      gridTemplateRows: rowSpec,
      gridColumnGap: cg,
      gridRowGap: rg,
      gridAutoFlow: "row",
      justifyContent: "stretch",
//      outline: "1px solid black"
    }
  };
  let mergedStyles = mergeStyles(styles, style, "container");
  return (
    <div style={mergedStyles.container}>
      {children}
    </div>
  );
};


MetricGrid.defaultProps = {
  style: {},
};

MetricGrid.propTypes = {
  sub1: PropTypes.bool,
  sub2: PropTypes.bool,
  sub3: PropTypes.bool,
  style: PropTypes.object,
  columns: PropTypes.number,
  rows: PropTypes.number,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
};

export default MetricGrid;
