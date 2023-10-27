import React, { useContext, useState, useEffect, useRef } from 'react';
import { Table, Input, Button, Form } from 'antd';
import type { InputRef } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { AddCircleOutlined } from '@mui/icons-material';

const EditableContext = React.createContext<FormInstance<any> | null>(null);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const EditableRow: React.FC<IEditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

// Cell editing handler
const EditableCell: React.FC<IEditableCellProps> = ({
  title,
  inputType,
  editable,
  children,
  dataIndex,
  record,
  handleInputChange,
  fieldsRules,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!;

  useEffect(() => {
    if (editing) {
      inputRef.current!.focus();
    }
  }, [editing]);

  const getRuleObj = (dataField: string | number | symbol) => {
    const rules = fieldsRules?.filter(
      (item: any) => item.field === dataField
    )?.[0]?.rules?.[0];

    const ruleObj: TObject = {
      required: rules?.required === false ? false : true,
      message: `${title} ${rules?.message ? rules?.message : 'is not valid'}`,
      ...rules
    };

    return ruleObj;
  };

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();

      toggleEdit();
      handleInputChange({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  const inputNode =
    inputType === 'number' ? (
      <Input
        ref={inputRef}
        onPressEnter={save}
        onBlur={save}
        min={0}
        max={100000000}
        type="number"
      />
    ) : (
      <Input ref={inputRef} onPressEnter={save} onBlur={save} />
    );

  let childNode = children;

  if (editable) {
    const ruleObj = getRuleObj(dataIndex);
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex as string}
        rules={[ruleObj]}
      >
        {inputNode}
      </Form.Item>
    ) : (
      <div onClick={toggleEdit}>{children}</div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

type EditableTableProps = Parameters<typeof Table>[0];
type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;

// EditableTable Component
export const EditableTable: React.FC<
  EditableTableProps & EditableTableState
> = ({
  dataSource,
  tableColumns,
  handleAddRow,
  handleInputChange,
  disabled = false,
  showAddRowButton = true,
  fieldsRules,
  loading = false,
  dataTestID,
  showInfoWindow = false,
  infoWindow = null
}) => {
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell
    }
  };

  const columns = tableColumns.map((col: TObject) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record: TObject) => ({
        record,
        editable: col.editable,
        inputType: col.inputType ?? 'number',
        dataIndex: col.dataIndex,
        title: col.title,
        handleInputChange,
        fieldsRules
      })
    };
  });

  return (
    <>
      <Table
        data-test-id={dataTestID}
        components={components}
        dataSource={dataSource}
        columns={columns as ColumnTypes}
        pagination={false}
        scroll={{ y: 1600 }}
        loading={loading}
      />
      {
        <div
          className={`flex ${
            showInfoWindow ? 'justify-between' : 'justify-end'
          } my-5 px-2`}
        >
          {showInfoWindow && infoWindow}
          {showAddRowButton && (
            <Button
              data-test-id={dataTestID + 'AddRowButton'}
              onClick={handleAddRow}
              type="text"
              size="small"
              style={{ color: `${disabled ? 'gray' : '#2551B3'}` }}
              icon={<AddCircleOutlined />}
              disabled={disabled}
              className="flex flex-row items-center bg-transparent"
            >
              <span
                className={`pl-2 ${
                  disabled ? 'text-[#B4BAC0]' : 'text-blue-blue2'
                } `}
              >
                Add Another Row
              </span>
            </Button>
          )}
        </div>
      }
    </>
  );
};
