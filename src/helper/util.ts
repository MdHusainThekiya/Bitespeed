import moment from 'moment';

const getStandaredDateTime = ( value : string ) => {
  if(value && value !== ""){
    return moment(value).format('YYYY-MM-DD HH:mm:ss.SSSZ');
  } else {
    return moment().format('YYYY-MM-DD HH:mm:ss.SSSZ');
  }
}

export default {
  getStandaredDateTime
}