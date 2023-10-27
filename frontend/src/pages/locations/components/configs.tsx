import { Info } from '@mui/icons-material';
import { Card, Tooltip } from 'antd';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { CustomCheckbox } from 'src/components';
import { TEST_ID_KEY_LOCATION } from 'src/constants/locations';
import {
  getLocationGRNStatus,
  getLocationReturnStatus,
  getLocationSaleStatus
} from 'src/store/selectors/features/location';
import { setConfigurationDetails } from 'src/store/slices/features/location';

const CONFIG_DETAILS = (
  <div className="m-1">
    <div className="my-2">
      <h1 className="text-white font-bold">Available for Sale:</h1>
      <p className="text-white">
        Only check this when location is available for Sales,
      </p>
    </div>
    <div className="my-2">
      <h1 className="text-white font-bold">GRN Applicable:</h1>
      <p className="text-white">
        Only check this when location is available for GRN,
      </p>
    </div>
    <div className="my-2">
      <h1 className="text-white font-bold">Return Applicable:</h1>
      <p className="text-white">
        Only check this when location is available to accept Returns,
      </p>
    </div>
  </div>
);

const cardTitle = (
  <div className="flex items-center">
    <span className="mr-2">Configuration Details</span>
    <Tooltip title={CONFIG_DETAILS}>
      <Info fontSize="small" style={{ color: 'lightgray' }} />
    </Tooltip>
  </div>
);

export const LocationConfigs: React.FC<ILocationConfigs> = ({
  locationId,
  selectedParentId,
  selectedParentsConfigs
}) => {
  const dispatch = useDispatch();
  const [t] = useTranslation('location');

  const saleStatus = useSelector(getLocationSaleStatus);
  const grnStatus = useSelector(getLocationGRNStatus);
  const returnStatus = useSelector(getLocationReturnStatus);

  const setConfigFlags = (AVS: boolean, GRN: boolean, RTN: boolean) => {
    if (selectedParentId) {
      if (
        selectedParentsConfigs?.availableForSale &&
        selectedParentsConfigs?.grnApplicable
      ) {
        dispatch(
          setConfigurationDetails({
            availableForSale: AVS,
            grnApplicable: selectedParentsConfigs?.grnApplicable,
            returnApplicable: selectedParentsConfigs?.returnApplicable
          })
        );
        return;
      }

      if (
        selectedParentsConfigs?.grnApplicable === true ||
        selectedParentsConfigs?.returnApplicable === true
      ) {
        dispatch(
          setConfigurationDetails({
            availableForSale: selectedParentsConfigs?.availableForSale,
            grnApplicable: selectedParentsConfigs?.grnApplicable,
            returnApplicable: selectedParentsConfigs?.returnApplicable
          })
        );
        return;
      }

      return;
    }

    dispatch(
      setConfigurationDetails({
        availableForSale: AVS,
        grnApplicable: GRN,
        returnApplicable: RTN
      })
    );
  };

  const overRideDefaultConfigs = () => {
    if (!selectedParentId && !selectedParentsConfigs) return;

    setConfigFlags(
      selectedParentsConfigs?.availableForSale,
      selectedParentsConfigs?.grnApplicable,
      selectedParentsConfigs?.returnApplicable
    );
  };

  useEffect(() => {
    if (!locationId) overRideDefaultConfigs();

    if (!selectedParentId) {
      setConfigFlags(true, true, false);
    }
  }, [selectedParentId]);

  const handleAvailableForSaleChange = () => {
    if (saleStatus) {
      setConfigFlags(false, false, true);
    } else {
      setConfigFlags(true, true, false);
    }
  };

  const handleGrnApplicableChange = () => {
    if (grnStatus) {
      setConfigFlags(false, false, true);
    } else {
      setConfigFlags(false, true, false);
    }
  };

  const handleReturnApplicableChange = () => {
    if (returnStatus) {
      setConfigFlags(true, true, false);
    } else {
      setConfigFlags(false, false, true);
    }
  };

  const handleSalesDisable = () => {
    return (
      (selectedParentId &&
        (!selectedParentsConfigs?.availableForSale ||
          !selectedParentsConfigs?.grnApplicable)) ||
      locationId
    );
  };

  const handleGrnDisable = () => {
    return (
      (selectedParentId && !selectedParentsConfigs?.grnApplicable) || locationId
    );
  };

  const handleReturnDisable = () => {
    return (
      (selectedParentId && !selectedParentsConfigs?.returnApplicable) ||
      locationId
    );
  };

  return (
    <Card title={cardTitle} className="rounded-lg bg-[#F1F4F6] mt-10">
      <div className="flex justify-between flex-wrap items-center gap-4">
        <div className="flex items-center">
          <CustomCheckbox
            dataTestID={`${TEST_ID_KEY_LOCATION}AvailableForSale`}
            onChange={handleAvailableForSaleChange}
            checked={saleStatus}
            disabled={handleSalesDisable()}
          />
          <span className="mx-6">{t('location.avblForSale')}</span>
        </div>
        <div className="flex items-center">
          <CustomCheckbox
            dataTestID={`${TEST_ID_KEY_LOCATION}GrnApplicable`}
            onChange={handleGrnApplicableChange}
            checked={grnStatus}
            disabled={handleGrnDisable()}
          />
          <span className="mx-6">{t('location.grnApplicable')}</span>
        </div>
        <div className="flex items-center">
          <CustomCheckbox
            dataTestID={`${TEST_ID_KEY_LOCATION}ReturnApplicable`}
            onChange={handleReturnApplicableChange}
            checked={returnStatus}
            disabled={handleReturnDisable()}
          />
          <span className="mx-6">{t('location.returnApplicable')}</span>
        </div>
      </div>
    </Card>
  );
};
