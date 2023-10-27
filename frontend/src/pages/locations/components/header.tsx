import React from 'react';
import { BreadCrumbs } from 'src/components/breadcrumb';
import { TEST_ID_KEY_LOCATION } from 'src/constants/locations';

export const LocationHeader: React.FC<ILocationHeading> = ({
  pageBreadCrumb,
  headingText,
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
        <div data-test-id={`${TEST_ID_KEY_LOCATION}Heading`}>
          <span className="text-2xl font-bold">{headingText}</span>
        </div>
        {children}
      </div>
    </>
  );
};
