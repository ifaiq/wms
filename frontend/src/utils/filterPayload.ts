import moment from 'moment';

export const prepareFilterRequestPayload = (data: TObject) => {
  Object.entries(data).forEach((entry) => {
    if (entry[1] === '' || entry[1] === null) {
      delete data[entry[0]];
    }
  });

  if (data?.from) data.from = moment(data.from).format('YYYY-MM-DD');
  if (data?.till) data.till = moment(data.till).format('YYYY-MM-DD');
  return data;
};
