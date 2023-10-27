import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import 'antd/dist/antd.css';
import { useTranslation } from 'react-i18next';
import { INITAIL_PAGINATION_DATA } from '../../constants/common';
import { TopBar } from 'src/components';
import { CustomPagination } from '../../components/pagination';
import { SearchCategory } from '../../components/search';
import { FilterDrawer } from 'src/components/drawer';
import {
  DRAFT_INVOICE_SEARCH_CAT_LIST,
  INITIAL_USER_SEARCH_STATE
} from 'src/constants/invoice';
import {
  getInvoicesFilterParams,
  getInvoicesIsFilterApplied
} from 'src/store/selectors/entities/invoice';
import {
  setInvoiceFilterParams,
  resetInvoiceFilterParams,
  updateInvoices
} from '../../store/slices/entities/invoices';
import { prepareFilterRequestPayload } from 'src/utils/filterPayload';
import { InvoiceFilters } from 'src/components/filters/invoice-filters';
import { DraftInvoices } from './components/draft-invoices';
import { Tabs } from 'antd';
import { ApprovedInvoices } from './components/approved-invoices';
import { DraftInvoiceFilters } from 'src/components/filters/draft-invoice-filters';
import {
  getDraftInvoicesFilterParams,
  getDraftInvoicesIsFilterApplied
} from 'src/store/selectors/entities/draft-invoices';
import {
  resetDraftInvoiceFilterParams,
  setDraftInvoiceFilterParams,
  updateDraftInvoices
} from 'src/store/slices/entities/draft-invoices';
import {
  useGetApprovedInvoices,
  useGetDraftInvoices
} from 'src/hooks/useInvoice';

export const Invoices: React.FC = () => {
  const dispatch = useDispatch();
  const [t] = useTranslation('invoice');
  const invoiceFilterParams = useSelector(getInvoicesFilterParams);
  const isInvoiceFilterApplied = useSelector(getInvoicesIsFilterApplied);
  const draftInvoiceFilterParams = useSelector(getDraftInvoicesFilterParams);

  const isDraftInvoiceFilterApplied = useSelector(
    getDraftInvoicesIsFilterApplied
  );

  const [totalInvoices, setTotalInvoices] = useState<number>();
  const [totalDraftInvoices, setTotalDraftInvoices] = useState<number>();

  const [pagination, setPagination] = useState<IPaginationType>(
    INITAIL_PAGINATION_DATA
  );

  const [searchParams, setSearchParams] = useState<Record<string, string>>();

  const invoiceRequestPayload: TObject = prepareFilterRequestPayload({
    ...pagination,
    ...invoiceFilterParams
  });

  const draftRequestPayload: TObject = prepareFilterRequestPayload({
    ...pagination,
    ...draftInvoiceFilterParams,
    ...searchParams
  });

  const {
    isLoading: isDraftsLoading,
    isSuccess: isDraftsSuccess,
    data: draftsData
  } = useGetDraftInvoices(draftRequestPayload);

  const {
    isLoading: isApprovedInvoicesLoading,
    isSuccess: isApprovedInvoicesSuccess,
    data: approvedInvoicesData
  } = useGetApprovedInvoices(invoiceRequestPayload);

  useEffect(() => {
    if (approvedInvoicesData && isApprovedInvoicesSuccess) {
      dispatch(updateInvoices(approvedInvoicesData?.data?.items));
      setTotalInvoices(approvedInvoicesData?.data?.meta?.totalCount);
    }
  }, [isApprovedInvoicesSuccess, approvedInvoicesData]);

  useEffect(() => {
    if (draftsData && isDraftsSuccess) {
      dispatch(updateDraftInvoices(draftsData?.data?.invoices));
      setTotalDraftInvoices(draftsData?.data?.total);
    }
  }, [isDraftsSuccess, draftsData]);

  const tabKeys = {
    approved: 'approved_invoices',
    drafts: 'draft_invoices'
  };

  const [selectedTab, setSelectedTab] = useState<string | number>(
    tabKeys.approved
  );

  const checkFilterApplied = () => {
    if (selectedTab === tabKeys.approved) return isInvoiceFilterApplied;
    else if (selectedTab === tabKeys.drafts) return isDraftInvoiceFilterApplied;
    else return false;
  };

  const handleFilterSetParams = (values: TObject) => {
    if (selectedTab === tabKeys.approved)
      dispatch(setInvoiceFilterParams(values));
    else if (selectedTab === tabKeys.drafts)
      dispatch(setDraftInvoiceFilterParams(values));
  };

  const handleFilterReset = () => {
    if (selectedTab === tabKeys.approved) dispatch(resetInvoiceFilterParams());
    else if (selectedTab === tabKeys.drafts)
      dispatch(resetDraftInvoiceFilterParams());
  };

  const renderFilterDrawers = () => {
    if (selectedTab === tabKeys.approved) {
      return (
        <InvoiceFilters
          filterParams={invoiceFilterParams}
          applyFilter={handleFilterSetParams}
        />
      );
    } else if (selectedTab === tabKeys.drafts) {
      return (
        <DraftInvoiceFilters
          filterParams={draftInvoiceFilterParams}
          applyFilter={handleFilterSetParams}
        />
      );
    }
  };

  //on tab change, reset filter parameters
  useEffect(() => {
    handleFilterReset();
  }, [selectedTab]);

  /* handle pagination state */

  const onChangePagination = (page: number, pageSize: number) => {
    const skip = (page - 1) * pageSize;
    setPagination((state: IPaginationType) => ({
      ...state,
      skip,
      page,
      take: pageSize
    }));
  };

  /* handle search state */
  const handleSearchData = (values: TObject) => {
    setSearchParams({ ...values });
    setPagination(INITAIL_PAGINATION_DATA);
  };

  const tabCountStyle = {
    fontSize: '0.65rem',
    backgroundColor: 'red',
    borderRadius: '1rem',
    marginLeft: '1rem',
    color: 'white'
  };

  const renderTabHeader = (title: string, count: number | undefined) => {
    return (
      <>
        <span className=" text-base">{title}</span>
        <span className=" font-bold px-2 py-1" style={tabCountStyle}>
          {count ? count : 0}
        </span>
      </>
    );
  };

  return (
    <>
      <TopBar
        title={t('invoice.title')}
        searchComponent={
          selectedTab === tabKeys.drafts && (
            <SearchCategory
              onSearch={handleSearchData}
              intialState={INITIAL_USER_SEARCH_STATE}
              categoryList={DRAFT_INVOICE_SEARCH_CAT_LIST}
            />
          )
        }
      />
      <div className="lg:mx-9">
        {/* Action bar */}
        <div className={`flex my-6 justify-end`}>
          <div className="flex justify-between items-center">
            <CustomPagination
              simple
              current={pagination?.page}
              pageSize={pagination?.take}
              onChange={onChangePagination}
              total={
                selectedTab === tabKeys.approved
                  ? totalInvoices
                  : totalDraftInvoices
              }
              showSizeChanger
            />
            <FilterDrawer
              isFilterApplied={checkFilterApplied()}
              onReset={handleFilterReset}
            >
              {renderFilterDrawers()}
            </FilterDrawer>
          </div>
        </div>

        <Tabs
          defaultActiveKey={tabKeys.approved}
          onChange={(e) => {
            setSelectedTab(e);
          }}
        >
          <Tabs.TabPane
            tab={renderTabHeader('Approved', totalInvoices)}
            key={tabKeys.approved}
          >
            <div className="mb-44">
              <ApprovedInvoices isLoading={isApprovedInvoicesLoading} />
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={renderTabHeader('Drafts', totalDraftInvoices)}
            key={tabKeys.drafts}
          >
            <DraftInvoices isLoading={isDraftsLoading} />
          </Tabs.TabPane>
        </Tabs>
      </div>
    </>
  );
};
