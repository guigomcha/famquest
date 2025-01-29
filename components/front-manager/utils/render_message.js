import React, { useState, useEffect } from 'react';

export const renderEmptyState = (message) => (
  <div className="empty-container">
    <p>{message}</p>
  </div>
);


// Function to safely render description with line breaks
export const renderDescription = (description) => {
  if (!description) return null;
  // Replace newlines with <br /> to preserve formatting
  const formattedDescription = description.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      {line}
      <br />
    </React.Fragment>
  ));
  return formattedDescription;
};