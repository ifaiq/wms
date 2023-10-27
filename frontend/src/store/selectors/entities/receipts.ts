import { createSelector } from 'reselect';

const receiptsEntitySelector = (state: TReduxState) => state.entities.receipt;

export const getPoReceipts = createSelector(
  receiptsEntitySelector,
  (receipts: TObject) => Object.values(receipts.data)
);

export const getFormatedReceiptsData = createSelector(getPoReceipts, (data) => {
  const formatedDataArr: TArrayOfObjects = [];
  data.forEach((item: TObject) => {
    formatedDataArr.push(item);

    if (item?.returnReceipts?.length) {
      item?.returnReceipts.forEach((returnReceipt: TObject) =>
        formatedDataArr.push(returnReceipt)
      );
    }
  });
  return formatedDataArr;
});
