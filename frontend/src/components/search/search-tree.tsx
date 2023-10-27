import { HighlightOffOutlined, SearchOutlined } from '@mui/icons-material';
import { Input, InputRef, Select, Tag } from 'antd';
import { BaseSelectRef } from 'rc-select';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FormElement } from 'src/components';

const { Option } = Select;

const CategoryTagIcon = (key: string) => (
  <div className="relative left-[-8px] bg-blue-blue1 h-10 mr-1 rounded-l-lg flex items-center">
    <p className="text-lg text-white capitalize px-2">{key}</p>
  </div>
);

export const SearchCategory: React.FC<ICategorySearch> = ({
  placeholder = 'Search',
  categoryList,
  intialState,
  onSearch
}) => {
  // This will save the searched string
  const [searchString, setSearchString] = useState('');
  // This will contain the {key:value[]} of categories
  const [searchedItems, setSearchedItems] = useState(intialState);

  // This 'BaseSelectRef' ref, reference is taken by going to component definetion
  const dropDownRef = useRef<BaseSelectRef>(null);
  const inputRef = useRef<InputRef>(null);

  const {
    control,
    formState: { errors }
  } = useForm({ mode: 'onChange' });

  // Sets the searched string
  const handleSearch = (e: TObject) => {
    setSearchString(e.target.value);
  };

  // Set the searched item from the dropdown to searchedItems array
  const handleSelectedOption = (key: string) => {
    // Extract the array from key:value pair
    const searchedArray = searchedItems[key];

    // In case of comma separated value, parse and remove the ending white space if any
    const parsedSS = searchString
      .split(',')
      .filter((value: string) => value !== '');

    // Update the searched array with new items on respective key
    setSearchedItems((state) => ({
      ...state,
      [key]: [...searchedArray, ...parsedSS]
    }));

    // Reset the searched string
    setSearchString('');

    // Remove the focus from dropdown and apply focus to input
    dropDownRef.current?.blur();
    inputRef.current?.focus();
  };

  // Responsible for resetting the state and removing of tag
  const handleCategoryTagClose = (e: TObject, key: string) => {
    e.preventDefault();

    setSearchedItems((state) => ({
      ...state,
      [key]: []
    }));
  };

  // Responsible for setting the search params as {key:value[]}
  useEffect(() => {
    onSearch(searchedItems);
  }, [searchedItems]);

  // Renders the Options of DropDown
  const renderCategoryDropDown = categoryList.map((category: TObject, key) => (
    <Option key={key} title={category.title} value={category.category}>
      <li key={key} className="list-none">
        <p className="text-blue-blue3 text-sm">
          Search <b>{category.title}</b> with
        </p>
        <p className="text-gray-grey2 text-sm">{searchString}</p>
      </li>
    </Option>
  ));

  // Renders the tags with searched options
  const renderCategoryTags = () => {
    const categoryTagsArray = [];

    for (const key in searchedItems) {
      const categoryArray = searchedItems[key];
      const categoryArrayLength = categoryArray.length;

      if (categoryArrayLength) {
        categoryTagsArray.push(
          <Tag
            key={key}
            className="flex items-center rounded-lg h-10"
            icon={CategoryTagIcon(key)}
            closable={true}
            closeIcon={<HighlightOffOutlined />}
            onClose={(e) => handleCategoryTagClose(e, key)}
          >
            {categoryArray.map((item: string, index: number) => (
              <span className="pr-1 text-sm" key={index}>
                {item.length > 10 ? item.slice(0, 10) + '...' : item}
                {index < categoryArrayLength - 1 ? ', ' : null}
              </span>
            ))}
          </Tag>
        );
      }
    }

    return categoryTagsArray;
  };

  return (
    <div className="w-full">
      {/* Component positioning ref here: https://jsfiddle.net/nwH8A/ */}
      <div className="relative">
        <Select
          ref={dropDownRef}
          className="absolute"
          size="large"
          aria-hidden="true"
          style={{ width: '100%' }}
          placeholder={placeholder}
          value={null}
          defaultValue={null}
          onChange={handleSelectedOption}
          open={searchString.length && !errors?.search?.message ? true : false}
        >
          {renderCategoryDropDown}
        </Select>
        <Controller
          control={control}
          rules={{
            pattern: {
              value: new RegExp('^([\\w .,/-])*$'),
              message:
                'Only Alphanumerics, spaces, /,-,. and commas are allowed'
            }
          }}
          name="search"
          render={({ field: { onChange } }) => (
            <FormElement
              errorMessage={errors?.search?.message}
              errorClassname="absolute bottom-[-80px]"
            >
              <Input
                ref={inputRef}
                className="absolute rounded-lg bg-gray-grey12 passwordBg"
                style={{ width: '100%' }}
                size="large"
                placeholder={placeholder}
                suffix={<SearchOutlined htmlColor="gray" />}
                value={searchString}
                onChange={(e) => {
                  handleSearch(e);
                  onChange(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowUp' || e.key === 'ArrowDown')
                    dropDownRef!.current?.focus();
                }}
              />
            </FormElement>
          )}
        />
        <div className="absolute w-full top-[50px] flex overflow-x-auto scroll-smooth">
          {renderCategoryTags()}
        </div>
      </div>
    </div>
  );
};
