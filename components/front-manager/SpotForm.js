import React, { useState } from 'react';

const SpotForm = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [url, setUrl] = useState(''); // Local state for the URL input

  const handleAddAttachment = (e) => {
    e.preventDefault();
    if (url) {
      setAttachments((prev) => [...prev, url]);
      setUrl(''); // Clear the URL input after adding
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, description, attachments });
    setName('');
    setDescription('');
    setAttachments([]);
    setUrl(''); // Clear all inputs after submission
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Image URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button onClick={handleAddAttachment}>Add Image</button>
      <button type="submit">Create Marker</button>
    </form>
  );
};

export default SpotForm;
