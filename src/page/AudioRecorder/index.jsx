import React, { useState } from 'react';
import SpeechToText from './SpeechToText'; // 调整导入路径

const AudioRecorder = () => {
  const [transcript, setTranscript] = useState('');

  const handleTranscriptUpdate = (updatedTranscript) => {
    setTranscript(updatedTranscript);
  };

  return (
    <div>
      <h1>语音实时转文字</h1>
      <SpeechToText onTranscriptUpdate={handleTranscriptUpdate} />
      <p>转录结果: {transcript}</p>
    </div>
  );
};

export default AudioRecorder;
