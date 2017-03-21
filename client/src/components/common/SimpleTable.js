import React, {PropTypes } from 'react';
import { KeyGenerator } from '../../helpers/ui';
import * as c from '../../styles/colors';

import * as defaultStyles from '../../styles/default';
import { mergeStyles } from '../../helpers/ui';

let kg = new KeyGenerator();

const renderCell = (e, style, span) => {
  return (<td style={style} key={kg.nextKey()}>{e}</td>);
  // if (span === undefined) {
  //   return (<td style={style} key={kg.nextKey()}>{e}</td>);
  // } else {
  //   return (<td style={style} colspan={span} key={kg.nextKey()}>{e}</td>);
  // }
};

const headerToCell = (e, style) =>{
  const v = (typeof e === "object") ? e.value : e;
  return renderCell(v, style);
};

const valueToCell = (e, style) => {
  const v = (typeof e === "object") ? e.value : e;
  let s = style;
  // if (typeof v === 'number') {
  //   s = Object.assign({}, s);
  //   s.textAlign = "right";
  // }
  return renderCell(v, s);
};

// {data.rows.map( (r) => <tr key={kg.nextKey()} style={styles.tableRow}>{r.map( (e) => valueToCell(e))}</tr>)}

function renderRow(row, styles) {
  return  <tr key={kg.nextKey()} style={styles.tableRow}>{row.map( (e) => valueToCell(e, styles.tableCell) )}</tr>
}

function renderNoData(message, span) {
  return (
    <div
    style={{fontSize: "large", textAlign: "right", paddingTop: '1em'}} >
      {message}
    </div>
  );
}

const SimpleTable = ({ data, caption, missingDataMessage, style }) => {
  // console.log("SimpleTable:render()", "data:", data, "caption:", caption);

  // const tablePadLeft = 16;
  // const tablePadRight = 16;
  // const height = "30em";

  const styles = {
    table: {
      // paddingLeft: tablePadLeft,
      // paddingRight: tablePadRight,
      padding: defaultStyles.primaryRelativeSpace,
      align: "center",
      // width: "40em",
      // marginBottom: "2em",
      // backgroundColor: c.metricBackground,

      borderCollapse: "collapse",
      // h and v
      // Horizontal Vertical
      tableLayout: "fixed",
      // outline: "1px solid black"
    },
    caption:{
      fontSize: "large",
      // paddingLeft: tablePadLeft,
      paddingBottom: defaultStyles.primaryAbsoluteSpace,
      textAlign: "left",
    },
    th: {
      backgroundColor: c.tableHeaderBackground,
      // color: c.tableHeaderColor,
      // outline: "1px solid black"
      // display: "inline",
      // position: "relative",
    },
    headerRow: {
      // display: "block",
      display: "table-row",
      background: c.tableHeaderBackground,
      color: c.tableHeaderColor,
      fontWeight: "bold",
      width: "100%",
      // outline: "1px solid black"
    },
    headerCell: {
      paddingLeft: defaultStyles.smallRelativeSpace,
      paddingRight: defaultStyles.smallRelativeSpace,
    },
    tb: {
      // display: "block",
      display: "auto",
      overflow: "auto",
      width: "100%",
      padding: 0,
      // maxHeight: height,
      // outline: "1px solid blue"
    },
    tableRow: {
      // outline: "1px solid black"
    },
    tableCell: {
      padding: defaultStyles.smallRelativeSpace,
    }
  };
  const mergedStyles = mergeStyles(styles, style, "table");


  console.log("SimpleTable:render()", "mergedStyles:", mergedStyles);

  return (
      <table style={mergedStyles.table}>
        {caption ? <caption style={mergedStyles.caption}>{caption}</caption> : ""}
        <thead style={mergedStyles.th}>
          <tr style={mergedStyles.headerRow}>
            {data.header.map((e) => headerToCell(e, mergedStyles.headerCell))}
          </tr>
        </thead>
        <tbody style={mergedStyles.tb}>
          {(data.rows.length > 0) ? data.rows.map( (r) => renderRow(r, mergedStyles)) : renderNoData(missingDataMessage, 4)}
        </tbody>
      </table>
  );
};

SimpleTable.propTypes = {
  missingDataMessage: PropTypes.string,
  title: PropTypes.string,
  data: PropTypes.object.isRequired,
  caption: PropTypes.string,
  scroll: PropTypes.bool,
  style: PropTypes.object
};

SimpleTable.defaultProps = {
  caption: undefined,
  scroll: false,
  missingDataMessage: "EmptyTable: No data provided",
  style: {}
};

export default SimpleTable;

/*
 Data is: 
 {
    header: [header1, header2, header3, header4],
    rows: [
      [col1, col2, col3, col4],
      [col1, col2, col3, col4],
      [col1, col2, col3, col4]
  ]
 }
 or:
 {
  header: [{value: header1, span: 2}, header3, header4]
  rows: [
    [col1, col2, col3, col4],
    [{col1, col2, {value: col3, span:2}}]
    [col1, col2, {value: col3, highlight: "warn"}, col4]
  ]
 }

 The rules are that each value is either a value or an object.
 If it is an object then it should have a key 'value' that the value
 is stored in. There are 2 additional keys that are recognized:
 1. span => the value of this slot must be an integer > 0. It specified how
 many columns to take up. 
 2. hightlight => the value is a string. I'll put a default mapping there, 
 but, I think I might add an ability to provide a funtion which will take
 an argument of a highlight value then return a style to be added to the cell
 the value goes in.
*/