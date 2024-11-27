import React, { useEffect, useRef, useState } from 'react';

const AudioRecorder = ({ onUploadComplete }) => { // Accept a callback prop
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    const requestUserMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);
      } catch (err) {
        console.error("Error accessing media devices:", err);
      }
    };

    requestUserMedia();
  }, []);

  const startRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.start();
      setIsRecording(true);

      const audioChunks = [];
      mediaRecorder.ondataavailable = e => {
        audioChunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { 'type' : 'audio/wav; codecs=opus' });
        sendAudioToServer(audioBlob);
      };
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // Function to send the audio blob to a server
  const sendAudioToServer = async (audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');

    try {
      const response = await fetch('https://yourserver.com/audio/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Audio uploaded successfully:', result);
        onUploadComplete(true, result); // Call the callback with success status and result
      } else {
        console.error('Upload failed:', response.statusText);
        onUploadComplete(false, response.statusText); // Call the callback with failure status
      }
    } catch (error) {
      console.error('Error sending audio to server:', error);
      onUploadComplete(false, error); // Call the callback with error status
    }
  };

  const canvasRef =useRef(null)
  const [isInit,setIsInit] = useState(false)
  const initCvs = ()=> {
    canvasRef.current.width = window.innerWidth * devicePixelRatio
    canvasRef.current.height = (window.innerHeight / 2) * devicePixelRatio
  }
  useEffect(()=>{
    initCvs()
    
  },[])
  return (
    <div>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      
    <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default AudioRecorder;

