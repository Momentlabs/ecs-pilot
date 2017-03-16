import React from 'react';

import { mergeStyles } from './ui';


// Add/change the margin-right style for each child execpt the
// last. The idea is that we sepate each child in a row by the separateWidth.
const SEP_COL = 1;
const SEP_ROW = 2;

function lastChild(children) {
  // console.log("lastChild()", "children", children, "Children#", React.Children.count(children));

  const cArray = React.Children.toArray(children);
  //  status[i] is <true> if the ith Child has children, and false if it does not.
  const status = cArray.map((c) => {
    if ((c === undefined) || React.Children.count(c.props.children) === 0)  {
      // console.log("empty or undefined:", c);
      return false;
    } else {
      // console.log("has children", c);
      return true;
    }
  });
  // console.log('Status', status);
  const full = !status.includes(false); // true if all have children false otherwise;
  const count = React.Children.count(children); // return the count if they're all full.
  if (full) return count;
  let last = count;
  while(last > 0) { // Find the first full entry and return it.
    if(status[last-1]) return last;
    last--;
  }
  return count; // Return the count if they're all empty (if they're all leaf nodes.)
}

export function separateChildren(children, separatorWidth, sepDir) {
  const sepStyle = (sepDir === SEP_ROW) ? {marginRight: separatorWidth} : {marginBottom: separatorWidth};
  const last = lastChild(children);
  let i = 1;
  // console.log("separateChildren:", "last:",  last, "children#", React.Children.count(children));
  return React.Children.map(children, (c) => {
    // console.log("Child:", c);
    if (c === undefined || c === null) return c; // don't modify empty containers.
    // if (i < React.Children.count(children)) { // and don't do the last one.
    if (i < last ) {
      // console.log("Not last:", "i:", i);
      i++;
      return React.cloneElement(c, {
        style: mergeStyles(c.props.sytle, sepStyle)
      });
    } else {
      // console.log("last", "i:", i)
      return React.cloneElement(c);
    }
  });
}

export function separateChildrenRow(children, separateWidth) {
  return separateChildren(children, separateWidth, SEP_ROW);
}

export function separateChildrenColumn(children, separateWidth) {
  return separateChildren(children, separateWidth, SEP_COL);
}