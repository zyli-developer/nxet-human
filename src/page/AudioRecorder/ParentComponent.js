import React from 'react';
import AudioRecorder from './AudioRecorder'; // Adjust the import path as needed

const ParentComponent = () => {
  const handleUploadComplete = (success, result) => {
    if (success) {
      console.log('Upload successful:', result);
      // Handle success (e.g., update state or show success message)
    } else {
      console.error('Upload failed:', result);
      // Handle failure (e.g., update state or show error message)
    }
  };

  return (
    <div>
      <h1>Audio Recorder</h1>
      <AudioRecorder onUploadComplete={handleUploadComplete} />
    </div>
  );
};

export default ParentComponent;

