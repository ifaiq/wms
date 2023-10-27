import React from 'react';
import { BreadCrumbs } from 'src/components/breadcrumb';
import { generateFormattedId } from 'src/utils/format-ids';

export const UserHeader: React.FC<IUserHeading> = ({
  headingText,
  pageBreadCrumb,
  id,
  children
}) => {
  return (
    <>
      <div className="mb-5 flex justify-between">
        <div className="basis-3/5 self-center">
          <BreadCrumbs routesArray={pageBreadCrumb} />
        </div>
      </div>
      <div className="flex mb-6 justify-between">
        <div>
          <span className="text-2xl font-bold">{`${headingText} ${
            id ? generateFormattedId(id, 2) : ''
          }`}</span>
        </div>
        {id && children}
      </div>
    </>
  );
};
