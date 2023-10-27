import React, { memo } from 'react';

const NotFound = () => (
  <div className="text-center">
    <header className="bg-white m-5 min-h-screen flex flex-col items-center text-black">
      <img
        src={require('../../assets/images/retailo.png')}
        className="h-80 pointer-events-none"
        alt="logo"
      />
      <p className="font-bold text-7xl">404</p>
      <p className="font-bold text-4xl">Page Not Found</p>
    </header>
  </div>
);

export default memo(NotFound);
