import React, { PropTypes } from 'react';

import DetailCard from './common/DetailCard';
import FlexContainer from './common/FlexContainer';

const SessionId = ({ accountAlias, accountId, userId, region }) => {

  // const styles = {
  //   container: {
  //     outline: "0px solid black"
  //   }
  // };

  return (
    <FlexContainer>
      <DetailCard title={accountAlias} subtitle={accountId} />
      <DetailCard title="Region" subtitle={region} />
    </FlexContainer>
  );
};

SessionId.propTypes = {
  accountAlias: PropTypes.string.isRequired,
  accountId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  region: PropTypes.string.isRequired
};

// SessionID.defaultProps = {
//   aProp: "Remove me"
// };

export default SessionId;
