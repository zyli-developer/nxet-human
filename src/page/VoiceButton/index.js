import React, {  useRef, useEffect } from "react";

let audioCtx = null; // 音频上下文
let source = null; // 音频源
let audioStream = null; // 录音产生的音频流
let analyserNode = null; // 用于分析音频实时数据的节点
// let animationFrame = null; // 定时器

function VoiceButton() {
  const openRef = useRef(null);
  const closeRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {}, []);
  function recordSound() {
    navigator.mediaDevices
      .getUserMedia({
        audio: {
          volume: 0.3,
          sampleSize: 16,
          sampleRate: 1600,
          echoCancellation: true,
          noiseSuppression: true,
        },
      })
      .then(initAudioData)
      .catch((e) => {
        console.log("出问题了，沙雕:", e);
      });
  }
  // 停止录制
  function stopRecord() {
    // 关闭麦克风
    const tracks = audioStream.getAudioTracks();
    for (let i = 0, len = tracks.length; i < len; i++) {
      tracks[i].stop();
    }
    // 断开音频节点
    analyserNode.disconnect();
    source.disconnect();
    analyserNode = null;
    source = null;
  }
  // 音频数据处理
  function initAudioData(stream) {
    audioStream = stream;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    // audioCtx.sampleRate = 1600;
    source = audioCtx.createMediaStreamSource(audioStream);
    analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 4096;

    analyserNode.smoothingTimeConstant = 1;
    source.connect(analyserNode);
    recordAudioData();
    requestAnimationFrame(drawWaver);
  }

  function recordAudioData() {
    const chunks = [];
    const recorder = new MediaRecorder(audioStream);
    
    recorder.ondataavailable = (event) => {
      chunks.push(event.data);
    };
    
    recorder.onstop = () => {
      const audioBlob = new Blob(chunks, { type: 'audio/wav' });
      convertBlobToBase64(audioBlob);
    };
    
    recorder.start();
    // Stop after a certain time or condition (e.g., after 5 seconds)
    setTimeout(() => recorder.stop(), 5000);
  }
  
  // Convert audio blob to base64
  function convertBlobToBase64(blob) {
    const reader = new FileReader();
    reader.onloadend = function() {
      const base64data = reader.result.split(',')[1]; // Get base64 string without the data URL part
      console.log("Base64 WAV Data: ", base64data);
    };
    reader.readAsDataURL(blob);
  }
  // 绘制图形
  function drawWaver() {
    if (!analyserNode) return;
    requestAnimationFrame(drawWaver);
    const originData = new Float32Array(analyserNode.fftSize);
    const positives = [];
    const negatives = [];
    // 获取当前的实时音频数据
    analyserNode.getFloatTimeDomainData(originData);
    // 每12位数据取一个最大值一个最小值 4096 / 12 = 341.3333
    for (let i = 0; i < 341; i++) {
      let temp = originData.slice(i * 12, (i + 1) * 12);
      positives.push(Math.max.apply(null, temp));
      negatives.push(Math.min.apply(null, temp));
    }
    // 创建canvas上下文
    if (canvasRef.current.getContext) {
      let ctx = canvasRef.current.getContext("2d");
      canvasRef.current.width = positives.length * 4;
      let x = 0;
      let y = 100;
      ctx.fillStyle = "#6986FD";
      for (let k = 0; k < positives.length; k++) {
        // 每个矩形宽3px，间隔1px，图形总长度即为 length * 4
        ctx.fillRect(x + 4 * k, y - 100 * positives[k], 3, 100 * positives[k]);
        ctx.fillRect(x + 4 * k, 100, 3, 100 * Math.abs(negatives[k]));
      }
    }
  }
  return (
    <div>
      <button
        ref={openRef}
        className="voice-button"
        onClick={() => recordSound()}
      >
        开启
      </button>
      <button
        ref={closeRef}
        className="voice-button"
        onClick={() => stopRecord()}
      >
        关闭
      </button>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}

export default VoiceButton;
