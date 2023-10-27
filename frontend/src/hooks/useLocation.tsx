import { useMutation, useQuery } from 'react-query';
import { LocationService } from '../services';

const locationService = new LocationService();

const useGetLocations = (params: Record<string, string>) =>
  useQuery(['locations', params], () => locationService.fetcLocations(params), {
    retry: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true
  });

const useCreateLocation = () =>
  useMutation((data: TObject) => locationService.createLocation(data));

const useUpdateLocation = () =>
  useMutation((data: TObject) => locationService.updateLocation(data));

const useGetLocationById = (id: TNumberOrString) =>
  useQuery(
    ['location', id],
    () => (id ? locationService.getLocationById(id) : null),
    { retry: false, refetchOnWindowFocus: false, keepPreviousData: true }
  );

const useUpdateLocationStatus = () =>
  useMutation((data: TObject) => locationService.updateLocationStatus(data));

const useGetAllLocationsByType = (params: TObject) =>
  useQuery(
    ['allParentLocationsByType', params],
    () => {
      return params.warehouseId
        ? locationService.getAllParentLocationsByType(params)
        : null;
    },
    { retry: false, refetchOnWindowFocus: false, keepPreviousData: true }
  );

export {
  useGetLocations,
  useCreateLocation,
  useUpdateLocation,
  useGetLocationById,
  useUpdateLocationStatus,
  useGetAllLocationsByType
};
