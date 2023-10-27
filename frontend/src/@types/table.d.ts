interface ITableColumn {
  title: string;
  dataIndex?: string;
  key: TNumberOrString;
  editable?: boolean;
  width?: TNumberOrString;
  fixed?: boolean | string;
  valueType?: string;
  inputType?: 'number' | 'text';
  render?: (
    text?: string,
    record?: TObject,
    index?: TNumberOrString
  ) => ReactNode;
  onCell?: (record?: TObject, rowIndex?: TNumberOrString) => void;
}

interface ITableOptions {
  fullScreen?: boolean;
  reload?: boolean;
  setting?: true;
  density?: boolean;
}

interface ITable {
  columns: TArrayOfObjects;
  loading?: boolean;
  dataSource: TArrayOfObjects;
  headerTitle?: string;
  rowKey?: TNumberOrString | any;
  size?: string;
  scroll?: { x?: number; y?: number };
  type?: 'checkbox' | 'radio';
  pagination?: boolean;
  paginationSize?: 20;
  paginationPosition?:
    | 'topLeft'
    | 'topCenter'
    | 'topRight'
    | 'bottomLeft'
    | 'bottomCenter'
    | 'bottomRight'
    | 'none';
  toolBarRender?: () => void;
  onRow?: TFunctionOrObject;
  rowClassName?: string;
  rowSelection?: TObject;
}

interface EditableTableState {
  dataSource: TArrayOfObjects;
  disabled?: boolean;
  tableColumns: TArrayOfObjects;
  handleAddRow?: () => void;
  handleInputChange?: (row: TObject) => void;
  fieldsRules?: TObject;
  showAddRowButton?: boolean;
  loading?: boolean;
  dataTestID?: string;
  showInfoWindow?: boolean;
  infoWindow?: ReactNode;
}

interface IEditableRowProps {
  index: number;
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
  minWidthClass?: string;
}

interface IEditableCellProps {
  title: React.ReactNode;
  inputType: 'number' | 'text';
  editable: boolean;
  children: React.ReactNode;
  dataIndex: keyof DataType;
  record: DataType;
  handleInputChange: (record: DataType) => void;
  fieldsRules?: TObject;
}

interface IFormFeildValidations {
  field: TNumberOrString;
  rules: IFormFeildRules[];
}

interface IFormFeildRules {
  required: boolean;
  message?: string;
  pattern?: RegExp;
  min?: string | number | array;
  max?: string | number | array;
  transform?: (value) => any;
  type?: string | number | boolean | url | email;
}
