import { HighlightOffOutlined, SearchOutlined } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';

export const SearchCategory: React.FC<ICategorySearch> = ({
  placeholder = 'Search',
  categoryList,
  intialState,
  onSearch
}) => {
  const [search, setSearch] = useState('');
  const [inputFocued, setInputFocued] = useState(false);

  const [selectedItemsState, setSelectedItemsState] =
    useState<Record<string, any>>(intialState);

  useEffect(() => {
    onSearch(selectedItemsState);
  }, [selectedItemsState]);

  const searchData = (value: string) => {
    setSearch(value);
  };

  const handleInputFocued = (isFocused: boolean) => {
    setInputFocued(isFocused);
  };

  const removeTags = (cat: string) => {
    const copySelectedItems = Object.assign({}, selectedItemsState);
    copySelectedItems[cat] = [];
    setSelectedItemsState(copySelectedItems);
  };

  const setSearchState = (value: string, name: string) => {
    const catVal = selectedItemsState[name];
    setSelectedItemsState((state) => ({
      ...state,
      [name]: [...catVal, value]
    }));
    setSearch('');
  };

  const selectChip = (value: string, name: string) => {
    setSearchState(value, name);
  };

  const showSearchCat = (category: Record<string, string>, index: number) => (
    <div
      className="hover:underline cursor-pointer"
      onClick={() => selectChip(search, category?.category)}
      key={index}
    >
      <p className={`text-blue-blue3 text-sm ${index !== 0 ? 'mt-2' : 'mt-0'}`}>
        Search <strong className="capitalize ">{category?.title}</strong> with
      </p>
      <p className={'text-gray-grey13 text-base'}>{search}</p>
    </div>
  );

  const getCatTag = (
    category: string,
    list: Array<string>,
    index: TNumberOrString
  ) => (
    <div className="flex m-[4px] " key={index}>
      <div className="p-2 text-white bg-blue-blue1 text-center rounded-l-lg  min-w-[70px] capitalize">
        {categoryList.find((x) => x.category === category)?.title}
      </div>
      <div
        className={`flex justify-between items-center pl-2 pr-2
       text-gray-grey13 border-2 border-gray-grey11 bg-white rounded-r-lg  
       min-w-[80px] w-[100%] whitespace-nowrap`}
      >
        {list?.map((item, i) => (
          <span key={i}>
            {` ${item.length > 10 ? item.slice(0, 10) + '...' : item}`}
            {list.length - 1 !== i ? ',\xa0' : null}
          </span>
        ))}
        <HighlightOffOutlined
          className="cursor-pointer min-w-[20px] text-black"
          onClick={() => removeTags(category)}
        />
      </div>
    </div>
  );

  return (
    <>
      <div
        className={`rounded-lg bg-gray-grey12 w-[100%] p-3 border
           ${inputFocued ? 'border-blue-blue1' : 'border-gray-grey12'}`}
      >
        <div className="flex justify-between items-center flex-row content-centers">
          <input
            type="text"
            className={`bg-gray-grey12 w-[90%]`}
            value={search}
            onClick={() => searchData(search)}
            onInput={(e: any) => searchData(e.target.value)}
            onFocus={() => handleInputFocued(true)}
            onBlur={() => handleInputFocued(false)}
            placeholder={placeholder}
          />
          <SearchOutlined className="cursor-pointer min-w-[20px] relative text-gray-grey2" />
        </div>

        {search?.length ? (
          <div className="border-radius-8 bg-white w-[44%] ml-[-12px] mt-4 p-4 rounded-lg shadow absolute z-20 break-all">
            {categoryList?.map((item: Record<string, string>, i: number) =>
              showSearchCat(item, i)
            )}
          </div>
        ) : null}
      </div>

      <div className="flex w-[100%] h-auto z-10 overflow-auto rounded-lg">
        {Object.keys(selectedItemsState).map((key, index) => {
          if (selectedItemsState[key].length) {
            return getCatTag(key, selectedItemsState[key], index);
          }

          return null;
        })}
      </div>
    </>
  );
};
