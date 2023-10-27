import { useMutation, useQuery } from 'react-query';
import { TransferService } from 'src/services';

const transferService = new TransferService();

const useGetTransfers = (
  params: Record<string, string | number | Array<string>>
) =>
  useQuery(
    ['transfers', params],
    () => transferService.fetchTransfers(params),
    { retry: false, keepPreviousData: true, refetchOnWindowFocus: false }
  );

const useGetTransferById = (id: string | number) =>
  useQuery(
    ['transfer', id],
    () => (!id ? false : transferService.fetchTransferById(id)),
    { retry: false, refetchOnWindowFocus: true }
  );

const useCreateTransfer = () =>
  useMutation((data: TObject) => transferService.createTransfer(data));

const useUpdateTransfer = () =>
  useMutation((data: TObject) => transferService.updateTransfer(data));

const useBulkUploadTransferProducts = () =>
  useMutation((data: TDocsOrMultimedia) =>
    transferService.bulkUploadProducts(data)
  );

const useGetTransferReasons = () =>
  useQuery(['transfer_reasons'], () => transferService.fetchTransferReasons(), {
    retry: false,
    refetchOnWindowFocus: false
  });

const useUpdateTransferStatus = () =>
  useMutation((data: TObject) => transferService.updateTransferStatus(data));

const useBulkCreateTransfer = () =>
  useMutation((data: TDocsOrMultimedia) =>
    transferService.bulkCreateTransfers(data)
  );

export {
  useGetTransfers,
  useGetTransferById,
  useCreateTransfer,
  useUpdateTransfer,
  useBulkUploadTransferProducts,
  useGetTransferReasons,
  useUpdateTransferStatus,
  useBulkCreateTransfer
};
