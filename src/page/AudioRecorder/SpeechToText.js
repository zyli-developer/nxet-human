import React, { useEffect, forwardRef,useImperativeHandle,useRef, useState } from 'react';

const SpeechToText = forwardRef((props, ref) => {
  const {onTranscriptUpdate} = props;
  const [transcript, setTranscript] = useState('');
  const recognition = useRef(null)
  useEffect(() => {
    // 检查浏览器支持
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true; // 持续监听
      recognition.current.interimResults = true; // 返回临时结果
      recognition.current.lang = "zh-CN"; // 设置语言
      let result = [];

      recognition.current.onresult = (event) => {

       const len = event.results.length;
        if(event.results[len-1].isFinal){
          if(event.results[len - 1][0].transcript){
            result.push(event.results[len - 1][0].transcript);
            setTranscript(result);
            onTranscriptUpdate(result);
          }
        } else {
          const data = event.results[len - 1][0].transcript;
          setTranscript(result + data);
          onTranscriptUpdate(result + data);
        }
      };

      recognition.current.onerror = (event) => {
        console.error("Speech recognition.current error", event.error);
      };

      recognition.current.start(); // 开始识别

      return () => {
        recognition.current.stop(); // 组件卸载时停止识别
      }
    } else {
      console.log("Speech recognition.current not supported in this browser.");
    }
  }, [onTranscriptUpdate]);
  useImperativeHandle(ref, () => ({
    start,stop
}))

  const start =()=>{
    recognition.start(); // 开始识别
  }
  const stop =()=>{
    recognition.stop(); // 开始识别
  }
  return (
    <div>
      <p>实时转录: {transcript}</p>
    </div>
  );
});

export default SpeechToText;

