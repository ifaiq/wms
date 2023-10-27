// TODO: Need to resolve ts error when below two files are imported

// import { FormInstance } from 'antd'
// import { ValidateMessages } from 'rc-field-form/lib/interface';

type ReactNode = import('react').ReactNode;
type ReactChild = import('react').ReactChild;
type ReactChildren = import('react').ReactChildren;
type Component = import('react').Component;
type TFunction = () => void;
type TObject = Record<string, number, string, undefined, boolean, TFunction>;
type TArrayOfObjects = TObject[];
type TNumberOrString = string | number;
type TNumberOrStringOrEmpty = string | number | undefined;
type TStringOrEmpty = string | undefined | null;
type TFunctionOrObject = TFunction | TObject;
type TDocsOrMultimedia = string | Blob | TObject;
/**
 * Redux Store types
 */
type TDispatch = import('../store/index').AppDispatch;
type TReduxState = import('../store/index').ReduxState;

interface ILoginDataProps {
  email: string;
  password: string;
}

interface IHttpRequestOptions {
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
}

interface IActionOptions {
  dispatch?: TDispatch;
  state: TReduxState;
}
interface IActionButton {
  dataCy?: string;
  onClick?: TFunction;
  text: string;
  type?: 'button' | 'submit' | 'reset';
  icon?: ReactNode;
  size?: 'small' | 'medium' | 'large' | 'full' | 'auto';
  style?: object;
  disabled?: boolean;
  id?: number | string;
  minWidthClass?: string;
  dataTestID?: string;
  isReturn?: boolean;
  className?: string;
  isLoading?: boolean;
}
interface IStatusButton {
  dataCy?: string;
  onClick?: TFunction;
  text: string;
  type?: 'button' | 'submit' | 'reset';
  icon?: ReactNode;
  size?: 'small' | 'medium' | 'large' | 'full' | 'auto';
  style?: object;
  disabled?: boolean;
  id?: number | string;
  isReturn?: boolean;
  refetch: () => void;
  dataTestID?: string;
}

interface IActionButtonOutlined {
  dataCy?: string;
  onClick?: TFunction;
  text: string;
  type?: 'button' | 'submit' | 'reset';
  icon?: ReactNode;
  size?: 'small' | 'medium' | 'large' | 'full' | 'auto';
  style?: object;
  disabled?: boolean;
  theme?: string;
  dataTestID?: string;
}

interface IError {
  message?: string;
  code?: string;
}
type IPaginationType = {
  skip: number;
  take: number;
  page?: number;
  pageSize?: number;
};
interface IPagination {
  current: number | undefined;
  total: number | undefined;
  onChange: (page: number, pageSize: number) => void;
  pageSize?: number | undefined;
  showSizeChanger?: boolean;
  simple?: boolean;
}
interface ITopBar {
  title: string;
  search?: boolean;
  searchComponent?: ReactNode;
}
interface IInput {
  className?: string;
  placeholder?: string;
  value?: string | number;
  size?: 'large' | 'middle' | 'small';
  onChange?: (text) => void;
  type?: string;
  suffix?: ReactNode;
  disabled?: boolean;
  style?: object;
  minValue?: number;
  maxValue?: number;
  addonAfter?: ReactNode;
  maxLength?: number;
  dataTestID?: string;
}

interface IInputMask {
  placeholder?: string;
  size?: 'large' | 'middle' | 'small';
  value?: string | undefined;
  onChange?: TFunctionOrObject;
  type?: string;
  suffix?: ReactNode;
  disabled?: boolean;
  mask: string | RegExp | Date;
  style?: object;
}

interface ISearchInput extends IInput {
  onSearch: (text) => void;
}

type RouteParams = {
  id: string;
};
interface IBreadCrumb {
  parentText?: string;
  currentText?: string;
  onClick?: TFunction;
  routes?: IRoute[];
}

interface IRoute {
  path: string;
  breadcrumbName: string;
  status?: string;
}

interface IRouteChildren extends IRoute {
  children: IRoute[];
}

interface IBreadCrumbDynamic {
  separator?: '|' | '>';
  routesArray: Array;
  navigate?: TFunctionOrObject;
  id?: string;
  breadcrumb?: string;
  currentName?: string;
}
interface IForm {
  form?: FormInstance;
  component?: ReactNode;
  initialValues?: object;
  labelAlign?: 'left' | 'right';
  labelWrap?: boolean;
  labelCol?: object;
  layout?: 'horizontal' | 'vertical' | 'inline';
  name?: string;
  colon?: boolean;
  preserve?: boolean;
  requiredMask?: boolean;
  scrollToFirstError?: boolean;
  size?: 'small' | 'middle' | 'large';
  validateMessages?: ValidateMessages;
  className?: string;
  onFieldsChange?: (changedFields, allFields) => void;
  onFinish?: (values) => void;
  onFinishFailed?: ({ values, errorFields, outOfDate }) => void;
  onValuesChange?: (changedValues, allValues) => void;
  dataTestID?: string;
}
interface IFormItem {
  name?: string | Array<number, string>;
  component?: ReactNode;
  label?: string;
  rules?: Rule[];
  style?: object;
  disabled?: boolean;
  tooltip?: string;
}
interface IFormElement {
  label?: string;
  style?: object;
  errorMessage?: string;
  disabled?: boolean;
  isRequired?: boolean;
  dataTestID?: string;
  errorClassname?: string;
}
interface ISelect {
  showSearch?: boolean;
  value?: string | number | Array;
  size?: 'large' | 'middle' | 'small';
  defaultValue?: string | string[] | number | number[];
  options: ISelectOption[];
  dataIndex?: string;
  placeholder?: string;
  onChange?: (text) => void;
  onInput?: (text) => void;
  allowClear?: boolean;
  style?: object;
  mode?: 'multiple' | 'tags';
  tagRender?: (props) => ReactNode | any;
  notFoundContent?: ReactNode;
  disabled?: boolean;
  maxTagCount?: number | 'responsive';
  dataTestID?: string;
  onClear?: TFunction;
}

interface ISearchSelect {
  data: IPOProducts[];
  dataIndex?: string;
  onChange?: (text) => void;
  handleSearch?: (text) => void;
  value?: TObject;
  disabled?: boolean;
  loading?: boolean;
  dataTestID?: string;
}

interface ISelectOption {
  id: TNumberOrString;
  name: TNumberOrString;
}
interface IAlert {
  message: string | undefined;
  showIcon?: boolean;
  type?: 'success' | 'info' | 'warning' | 'error';
}
interface IFilters {
  applyFilter: (values) => void;
  filterParams?: Record<string, string | number | Array>;
}
interface IFiltersHeder {
  openDrawer: () => void;
  closeDrawer: () => void;
  resetFilters?: () => void;
  isShowReset?: boolean;
}
interface IDrawer {
  title?: string;
  DrawerHeader?: ReactNode;
  placement?: 'left' | 'right' | 'bottom' | 'top';
  closable?: boolean;
  onClose?: () => void;
  visible?: boolean;
  key?: string;
  width?: number;
}
interface INavDrawer {
  title?: string;
}
interface ITab {
  defaultActiveKey?: string;
  onChange: (activeKey) => void;
  activeKey?: string;
  centered?: boolean;
  size?: 'large' | 'small';
  tabBarStyle?: object;
  tabPosition?: 'top' | 'right' | 'bottom' | 'left';
  type?: 'line' | 'card' | 'editable-card';
  onTabClick?: (key) => void;
}
interface ITabItem {
  key: string;
  tab: string;
  style?: object;
}

interface IConfirmPopUp {
  title?: string;
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}
interface IModal {
  title?: string;
  visible: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  closable?: boolean;
  closeModal?: () => void;
  destroyOnClose?: boolean;
  icon?: ReactNode;
  cancelText?: string;
  okText?: string;
  width?: number;
  showCancelButton?: boolean;
}

interface ICheckbox {
  onChange: (value) => void;
  checked?: boolean;
  value?: boolean;
  disabled?: boolean;
  defaultChecked?: boolean;
  autoFocus?: boolean;
  before?: string;
  after?: string;
  dataTestID?: string;
}
interface IMenu {
  onClick?: () => void;
  defaultSelectedKeys?: Array;
}
interface IMenuItem {
  key: string;
}
interface ICategorySearch {
  categoryList: Array<Record<string, string>>;
  intialState: Record<string, Array>;
  placeholder? = 'Search';
  onSearch: (state) => void;
}

interface IStatuses {
  status?: string;
  title: string;
  icon?: ReactNode;
  onClick?: TFunction;
  current?: number;
  initial?: number;
  seprator?: string | ReactNode;
  onChange?: (current?: number) => void;
}
interface IUpload {
  name?: TStringOrEmpty;
  fileName?: TStringOrEmpty;
  fieldName?: TDocsOrMultimedia;
  id?: TNumberOrString;
  path?: string;
  url?: string;
  status?: string;
}
interface IDatePicker {
  onChange: (text) => void;
  onOk?: (text) => void;
  placeholder?: string;
  size?: 'large' | 'middle' | 'small';
  inputReadOnly?: boolean;
  mode?: 'date' | 'month' | 'year' | 'decadeng';
  placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';
  picker?: 'date' | 'week' | 'month' | 'quarter' | 'year';
  value?: moment;
  defaultValue?: string | number;
  defaultPickerValue?: string | number;
  showTime?: boolean;
  showToday?: boolean;
  format?: string;
  disabled?: boolean;
  disabledDate?: (currentDate: moment) => void;
  style?: object;
  format?: string;
  dataTestID?: string;
}

interface IDivivder {
  type: 'horizontal' | 'vertical';
  style?: object;
  dashed?: boolean;
}

interface ILoader {
  className?: string;
  loaderColor?: string;
}

interface IFormProps {
  props: TObject;
}
interface IFilterDrawer extends IDrawer {
  showReset?: boolean;
  isFilterApplied: boolean;
  onReset: TFunction;
}
interface IErrorModal extends IModal {
  title: string;
  pageSize?: number;
  errorList: string[];
}

interface IDynamicForm {
  form?: FormInstance;
  formName: string;
  disabled?: boolean;
  initialValues?: TObject[];
  renderFunction: (params: IFormRenderer) => React.ReactNode;
  handleSubmit?: TFunction;
  className: string;
}

interface IFormRenderer {
  fields: Field[];
  operation: {
    add: (defaultValue?: any, insertIndex?: number) => void;
    remove: (from: number, to?: number) => void;
    move?: (index: number | number[]) => void;
  };
  meta?: { errors };
}

interface INumberInput extends IInput {
  defaultValue?: number;
  decimalSeparator?: string;
  precision?: number;
  formatter?: (
    value?: number | string,
    info?: { userTyping: boolean; input: string }
  ) => string;
  parser?: (string) => number;
  onBlur?: (text) => void;
  controls?: boolean | { upIcon?: React.ReactNode; downIcon?: React.ReactNode };
  keyboard?: boolean;
}

interface IList {
  header?: ReactNode;
  footer?: ReactNode;
  data: TObject[] | string[];
  renderFunction: (item) => ReactNode;
  bordered?: boolean;
  pagination?: boolean | TObject;
  size?: 'default' | 'large' | 'small';
  style?: TObject;
}

interface IInfoList {
  header?: ReactNode;
  footer?: ReactNode;
  data: IInfoListData[] | string[];
  bordered?: boolean;
  size?: 'default' | 'large' | 'small';
  style?: TObject;
}

interface IInfoListData {
  title: string;
  data: TNumberOrString;
}

interface IBulkCreate {
  refetch: (options: TObject) => void;
}
