import React from 'react';

const Card = ({ children, className = '', noPadding = false }) => {
  return (
    <div className={`bg-card-white rounded-xl shadow-soft border border-border-grey ${noPadding ? '' : 'p-6'} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
