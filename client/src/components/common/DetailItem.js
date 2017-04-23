import React, {PropTypes } from 'react';

import ItemPair from './ItemPair';

import { ListItem,  } from 'material-ui/List';


const DetailItem = ({name, value}) => {
  // console.log("DetailItem:render()", "listKey:", listKey);
  // const styles = {
  //   container: {
  //     outline: "0px solid black"
  //   }
  // };

  return (
      <ListItem 
                primaryText={<ItemPair 
          firstItemHeader itemOne={name} 
          itemTwo={value}/>} 
      />
  );
};

// DetailItem.contextTypes = {
//   muiTheme: PropTypes.object.isRequired
// };

// DetailItem.defaultProps = {
//   name: ""
// };

DetailItem.propTypes = {
  // listKey: PropTypes.string.isRequired,
  name: PropTypes.node,
  value: PropTypes.node
};

export default DetailItem;