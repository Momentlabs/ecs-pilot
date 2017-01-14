import React, {PropTypes} from 'react';
import Paper from 'material-ui/Paper';
import * as c from '../../styles/colors';


// Since this component is simple and static, there's no parent container for it.
const getStyles =({size, rightAnchor, space, metricFontSize, titleFontSize}) => {
  const boxSize = size ? size : 60;
  const anchor = rightAnchor ? rightAnchor : 0;
  const offset = space ? space : 0;

  const metricFS = metricFontSize ? metricFontSize : 'xx-large';
  const titleFS = titleFontSize ? titleFontSize : 'medium';

  // console.log("Using metric FS: ", metricFS, "given metricFontSize", metricFontSize);

  // Yes, the proper way to do this is measure the string in pixes then figure it out.
  // let metricFS = 'xx-large';
  // if (metric.length <=3) {
  //   metricFS = 'xx-large';
  // } else if (metric.length <= 6) {
  //   metricFS = 'large';
  // } else if (metric.length <= 9) {
  //   metricFS = 'medium';
  // } else {
  //   metricFS = 'small';
  // }

  // let titleFS = 'medium';
  // if (title.length <= 7) {
  //   titleFS = 'medium';
  // } else if (title.length <= 15) {
  //   titleFS = 'small';
  // } else {
  //   titleFS = 'x-small';
  // }

  return (
    {
      metricBox: { 
        right: anchor - offset,
        backgroundColor: c.metricBackground,
        height: boxSize, 
        width: boxSize,
        display: "inline-block",
        textAlign: 'center',
        position: "absolute",
        top: 0,
        bottom: "auto",
        marginTop: 10,
      },

      metric: {
        padding: 0,
        marginTop: 18,
        marginBottom: 23,
        fontSize: metricFS,
        fontWeight: "bold"
      },

      metricTitle : {
        color: c.metricName,
        justifyContent: 'center',
        left: 'auto',
        right: 'auto',
        textAlign: "center",
        fontSize: titleFS,
        fontWeight: 'bold'
      }
    }
  );
};

const MetricBox = (props) => {
  const {metric, title} = props;
  const styles = getStyles(props);

  return (
    <Paper style={styles.metricBox}>
      <p style={styles.metric}>
        {metric}
      </p>
      <p style={styles.metricTitle}>
        {title}
      </p>
    </Paper>
  );
};

MetricBox.propTypes = {
  metric: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  titleFontSize: PropTypes.string,
  metricFontSize: PropTypes.string,
  size: PropTypes.number,
  rightAnchor: PropTypes.number,
  space: PropTypes.number
};

export default MetricBox;