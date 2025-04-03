import React, { useState, useEffect } from 'react';

export const renderEmptyState = (message) => (
  <div className="empty-container">
    <p>{message}</p>
  </div>
);


// Function to safely render description with line breaks
export const renderDescription = (description) => {
  if (!description) return null;
  // Check if the description contains HTML tags by using a simple regex
  const containsHtml = /<\/?[a-z][\s\S]*>/i.test(description);

  if (containsHtml) {
    // If the description contains HTML, use dangerouslySetInnerHTML to render the HTML safely
    return (
      <div
        className="description"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    );
  }
  // Else, replace newlines with <br /> to preserve formatting
  const formattedDescription = description.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      {line}
      <br />
    </React.Fragment>
  ));
  return formattedDescription;
};