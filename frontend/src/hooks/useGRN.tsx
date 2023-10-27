import { useMutation, useQuery } from 'react-query';
import { GRNService } from '../services';

const grnService = new GRNService();

const useGetReceiptsByPoId = (id: TNumberOrString) =>
  useQuery(['receipts', id], () => grnService.fetchReceiptsByPoId(id), {
    retry: false,
    refetchOnWindowFocus: false
  });

const useGetGrnByReceiptId = (id: TNumberOrString) =>
  useQuery(['grn', id], () => grnService.fetchGrnByReceiptId(id), {
    retry: false,
    refetchOnWindowFocus: false
  });

const useGetReturnGrnByReceiptId = (id: TNumberOrString) =>
  useQuery(['return', id], () => grnService.fetchReturnGrnByReceiptId(id), {
    retry: false,
    refetchOnWindowFocus: false
  });

const useGetReturnReasons = (type = 'RETURN') =>
  useQuery(
    [`grn_reasons_${type}`],
    () => grnService.featchReturnReasons(type),
    { retry: false, refetchOnWindowFocus: false }
  );

const useUpdateGRN = () =>
  useMutation((data: IGRN) => grnService.updateGRN(data));

const useUpdateGRNStatus = () =>
  useMutation((data: TObject) => grnService.updateGRNStatus(data));

const useCreateGRNBackorder = () =>
  useMutation((data: TObject) => grnService.createGRNBackorder(data));

const useUpdateReturnGRNStatus = () =>
  useMutation((data: TObject) => grnService.updateReturnGRNStatus(data));

const useCreateGRNReturn = () =>
  useMutation((data: TObject) => grnService.createGRNReturn(data));

const useReturnGRN = () =>
  useMutation((data: IGRN) => grnService.returnGRN(data));

const usePrintGRN = () =>
  useMutation((id: string | number | undefined) =>
    grnService.printGRN(id, false)
  );

const usePrintReturnGRN = () =>
  useMutation((id: string | number | undefined) =>
    grnService.printGRN(id, true)
  );

const useAttachGrnInvoice = () =>
  useMutation((data: TDocsOrMultimedia) => grnService.attachFile(data));

const useDettachGrnInvoice = () =>
  useMutation((data: TDocsOrMultimedia) => grnService.detachFile(data));

const useCreateReturnIn = () =>
  useMutation((data: TObject) => grnService.createReturnIn(data));

const useAttachReturnInvoice = () =>
  useMutation((data: TDocsOrMultimedia) =>
    grnService.attachReturnAttachment(data)
  );

const useDettachReturnInvoice = () =>
  useMutation((data: TDocsOrMultimedia) =>
    grnService.detachReturnAttachment(data)
  );

export {
  useGetReceiptsByPoId,
  useGetGrnByReceiptId,
  useUpdateGRN,
  useUpdateGRNStatus,
  useCreateGRNBackorder,
  useGetReturnReasons,
  useCreateGRNReturn,
  useGetReturnGrnByReceiptId,
  useReturnGRN,
  useUpdateReturnGRNStatus,
  usePrintGRN,
  usePrintReturnGRN,
  useAttachGrnInvoice,
  useDettachGrnInvoice,
  useCreateReturnIn,
  useAttachReturnInvoice,
  useDettachReturnInvoice
};
