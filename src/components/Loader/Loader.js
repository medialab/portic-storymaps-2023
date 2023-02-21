import React from 'react';

/**
 * Header contains navigation and…
 * @param {Object} props
 * @param {String} props.message Text to show as loading message
 * @returns {React.ReactElement}
 */

export default function Loader({
  message,
  isLoading
}) {
  return (
    <div className={`Loader ${isLoading ? 'is-loading' : ''}`}>
      <div>
        {message}
      </div>
    </div>
  );
}