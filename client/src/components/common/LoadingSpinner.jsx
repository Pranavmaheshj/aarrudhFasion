import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Loading exquisite collection...' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} rounded-full border-brand-borderWarm border-t-brand-magenta animate-spin`}
      />
      {text && <p className="mt-3 text-sm text-brand-dark/70 font-serif italic tracking-wide">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
