import React from 'react';

import { mergeStyles } from './ui';



function lastChild(children) {
  // console.log("lastChild()", "children", children, "Children#", React.Children.count(children));

  const cArray = React.Children.toArray(children);
  //  status[i] is <true> if the ith Child has children, and <false> if it does not.
  const status = cArray.map((c) => {
    if ((c === undefined) || React.Children.count(c.props.children) === 0)  {
      return false;
    } else {
      return true;
    }
  });
  // console.log('Status', status);
  const count = React.Children.count(children); 
  if (status.every((e) => e === true)) return count; // if they've all got children
  if (status.every((e) => e === false)) return count; // If none of them have children (all leaf nodes).

  // Start at the end and look for the first one with a child.
  let last = count;
  while(last > 0) {
    if(status[last-1]) return last;
    last--;
  }
  return count; // We shouldn't get here, but if we did, they'd all be leaf nodes (no children).
}

// Add/change the margin-right style for each child except the
// last. The idea is that we separate each child in a row by the separateWidth.
const SEP_COL = 1;
const SEP_ROW = 2;
export function separateChildren(children, separatorWidth, sepDir) {
  console.log("seperateChildren()", "separatorWidth:", separatorWidth);
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
        style: mergeStyles(c.props.style, sepStyle)
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