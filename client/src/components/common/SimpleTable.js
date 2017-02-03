import React, {PropTypes } from 'react';
import { KeyGenerator } from '../../helpers/ui';
import * as c from '../../styles/colors';

let kg = new KeyGenerator;

const cellStyles = {
  header: {

  },
  value: {
    paddingTop: "2em",
    paddingLeft: ".5em",
    // outline: "1px solid black"
  }
};

const headerToCell = (e) =>{
  const v = (typeof e === "object") ? e.value : e;
  return renderCell(v, cellStyles.header);
};

const valueToCell = (e) => {
  const v = (typeof e === "object") ? e.value : e;
  let s = cellStyles.value;
  // if (typeof v === 'number') {
  //   s = Object.assign({}, s);
  //   s.textAlign = "right";
  // }
  return renderCell(v, s);
};

// {data.rows.map( (r) => <tr key={kg.nextKey()} style={styles.tableRow}>{r.map( (e) => valueToCell(e))}</tr>)}

function renderRow(row, rowStyle) {
  return  <tr key={kg.nextKey()} style={rowStyle}>{row.map( (e) => valueToCell(e))}</tr>
}

const renderCell = (e, styles) => {
  return (<td style={styles} key={kg.nextKey()}>{e}</td>);
};

function renderNoData(message, span) {
  return (
    <div
    style={{fontSize: "large", textAlign: "right", paddingTop: '1em'}}>
      {message}
    </div>
  );
}

const SimpleTable = ({ data, caption, missingDataMessage }, context) => {
  console.log("SimpleTable:render()", "data:", data, "caption:", caption);

  const tablePadLeft = 16;
  const tablePadRight = 16;
  const styles = {
    table: {
      paddingLeft: tablePadLeft,
      paddingRight: tablePadRight,
      align: "center",
      width: "100%",
      marginBottom: "2em",

      // Horizonta' Vertical
      borderSpacing: "0 0em",
      // outline: "1px solid black"
    },
    caption:{
      fontSize: "large",
      paddingLeft: tablePadLeft,
      paddingBottom: "1em",
      textAlign: "left",
    },
    th: {
      backgroundColor: c.tableHeaderBackground,
      // color: c.tableHeaderColor,
      // outline: "1px solid black"
    },
    headerRow: {
      background: c.tableHeaderBackground,
      color: c.tableHeaderColor,
      fontWeight: "bold",
      // outline: "1px solid black"
    },
    tb: {
      // outline: "1px solid blue"
    },
    tableRow: {
      marginTop: ".5em"
      // outline: "1px solid black"
    }
  };

  return (
    <table style={styles.table}>
      {caption ? <caption style={styles.caption}>{caption}</caption> : ""}
      <thead style={styles.th}>
        <tr style={styles.headerRow}>
          {data.header.map((e) => headerToCell(e))}
        </tr>
      </thead>
      <tbody style={styles.tb}>
        {(data.rows.length > 0) ? data.rows.map( (r) => renderRow(r, styles.tableRow)) : renderNoData(missingDataMessage, 4)}
      </tbody>
    </table>
  );
};

// SimpleTable.contextTypes = {
//   muiTheme: PropTypes.object.isRequired
// };

SimpleTable.defaultProps = {
  caption: undefined,
  missingDataMessage: "EmptyTable: No data provided"
};

SimpleTable.propTypes = {
  missingDataMessage: PropTypes.string,
  title: PropTypes.string,
  data: PropTypes.object.isRequired,
  caption: PropTypes.string,
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