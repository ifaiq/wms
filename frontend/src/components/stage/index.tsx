import React from 'react';

export const Stage: React.FC<IPOStatus> = ({ title, icon, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center bg-gray-grey5 px-3 py-1 rounded-full w-fit gap-x-2 text-blue-blue3 justify-between"
  >
    {icon}
    {title}
  </button>
);
