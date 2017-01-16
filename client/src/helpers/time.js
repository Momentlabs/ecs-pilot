import moment from 'moment';

export const uptimeString = (unixTime) => {
  const launch = moment.unix(unixTime);
  const upDur = moment.duration(moment().diff(launch));
  const y = upDur.years();
  const m = upDur.months();
  const d = upDur.days();
  const h = upDur.hours();
  const mn = upDur.minutes();
  const s = upDur.seconds();
  if (y > 0) {
    return `${y} years, ${m} months, ${d} days and ${h} hours`;
  } else if (m > 0) {
    return `${m} months, ${d} days, ${h} hours and ${s} seconds`;
  } else if (d > 0) {
    return `${d} days ${h} hours ${mn} minutes and ${s} seconds`;
  } else if (h > 0) {
    return `${h} hours ${mn} minutes and ${s} seconds`;
  } else {
    return `${mn} minutes and ${s} seconds`;
  }
};