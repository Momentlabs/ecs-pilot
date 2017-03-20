import React, { PropTypes } from 'react';

import * as defaultStyles from '../styles/default';
import { mergeStyles } from '../helpers/ui';

import TitleBox from './common/TitleBox';
import InstanceBar from './InstanceBar';

const Instances = ({ instances, securityGroups, clusterName, style }) => {

  const styles = {
    container: {
      // outline: "1px solid black"
    },
    title: {
      marginBottom: defaultStyles.primaryAbsoluteSpace,
    }
  };
  const mergedStyles = mergeStyles(styles, style, "container");

  // yeah yeah .... create an object with a key for each zone, 
  // get the keys back as an array, and take it's length.
  const noOfZones = Object.keys(instances.reduce( (zones, i) => {
    zones[i.ec2Instance.placement.availabilityZone] = true;
    return zones;
  }, {})).length;
  const noOfInstances = instances.length;
  const subtitle = 
    noOfInstances + ((noOfInstances > 1) ? " instances in " : " instance in ") +
    noOfZones + ((noOfZones > 1) ? " availability zones" : " availability zone");

  return (
    <div style={mergedStyles.container} >
      <TitleBox
        title="Instances"
        subtitle={subtitle}
        altColor
        style={styles.title}
      />
      {instances.map( (i) => <InstanceBar instance={i} securityGroups={securityGroups} cluserName={clusterName} />)}
    </div>
  );
};

Instances.propTypes = {
  instances: PropTypes.array.isRequired,
  securityGroups: PropTypes.array.isRequired,
  clusterName: PropTypes.string.isRequired,
  style: PropTypes.object
};

Instances.defaultProps = {
  style: {}
};

export default Instances;
