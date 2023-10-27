import { useMutation, useQuery } from 'react-query';
import { AdjustmentService } from '../services';

const adjustmentService = new AdjustmentService();

const useGetAdjustmentById = (id: string | number) =>
  useQuery(
    ['adjustment', id],
    () => (!id ? false : adjustmentService.fetchAdjustmentById(id)),
    { retry: false, refetchOnWindowFocus: false }
  );

const useCreateAdjustment = () =>
  useMutation((data: TObject) => adjustmentService.createAdjustment(data));

const useUpdateAdjustment = () =>
  useMutation((data: TObject) => adjustmentService.updateAdjustment(data));

const useBulkUploadAdjustProducts = () =>
  useMutation((data: TDocsOrMultimedia) =>
    adjustmentService.bulkUploadProducts(data)
  );

const useGetAdjusmentReasons = () =>
  useQuery(
    ['adjust_reasons'],
    () => adjustmentService.fetchAdjustmentReasons(),
    { retry: false, refetchOnWindowFocus: false }
  );

const useUpdateAdjustmentStatus = () =>
  useMutation((data: TObject) =>
    adjustmentService.updateAdjustmentStatus(data)
  );

const useBulkCreateAdjustment = () =>
  useMutation((data: TDocsOrMultimedia) =>
    adjustmentService.bulkCreateAdjustments(data)
  );

export {
  useGetAdjustmentById,
  useCreateAdjustment,
  useUpdateAdjustment,
  useBulkUploadAdjustProducts,
  useGetAdjusmentReasons,
  useUpdateAdjustmentStatus,
  useBulkCreateAdjustment
};
