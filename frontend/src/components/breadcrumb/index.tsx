import React from 'react';
import { Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';

export const BreadCrumbs: React.FC<IBreadCrumbDynamic> = ({
  routesArray,
  separator = '>',
  id
}) => {
  const renderBreadCrumbs = (
    route: any,
    _params: any,
    routes: any,
    paths: any
  ) => {
    const last = routes.indexOf(route) === routes.length - 1;
    return last ? (
      <span className="text-blue-blue3 capitalize ">
        {route.breadcrumbName}
      </span>
    ) : (
      <Link to={`/${paths.join('/')}`}>{route.breadcrumbName}</Link>
    );
  };

  return (
    <Breadcrumb
      separator={separator}
      className="text-lg"
      params={id ? id : undefined}
      routes={routesArray}
      itemRender={renderBreadCrumbs}
    />
  );
};
