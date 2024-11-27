import { useEffect, useMemo, useRef, useState } from "react";
import "./index.css";
import NextCas from "@nextcas/sdk";

import { blobToBase64 } from "../../utils/index";
import { v4 as uuid } from "uuid";
import sendSvg from "../../assets/send.svg";
import adudioSvg from "../../assets/audio.svg";
import {
  dialogue,
  nhToken,
  textToSpeech,
  audioToText,
} from "../../server/main";

let nextCas = null;

function Human() {
  const container = useRef(null);
  const chatRef = useRef(null);
  const [token, setToken] = useState();
  const [inited, setInited] = useState();
  const [progress, setProgress] = useState(0);

  const getToken = async () => {
    try {
      const response = await nhToken({ visitId: "123", visitName: "abc" });
      setToken(response.data);
    } catch (err) {
      console.log(
        "%c [ err ]-23",
        "font-size:13px; background:pink; color:#bf2c9f;",
        err
      );
    }
  };
  useEffect(() => {
    getToken();
  }, []);

  useEffect(() => {
    if (!token) return;
    nextCas = new NextCas(container.current, {
      avatarId: "avatar_514087",
      actorId: "actor_100256",
      token,
      templateName: "base",
    });

    nextCas.on("initProgress", (cent) => {
      setProgress(() => cent);
    });
    nextCas.on("ready", (res) => {
      setInited(true);
    });
    return () => {
      nextCas?.destroy();
    };
  }, [container, token]);

  const [speakText, setSpeakText] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [status, setStatus] = useState("default");

  const handleMicClick = (type) => {
    setStatus(type); // 点击话筒切换到按住说话状态
  };

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);
  const [inputColor, setInputColor] = useState("put");
  const [cancelRecording, setCancelRecording] = useState(false);

  const startYRef = useRef(0); // 记录触摸开始的 Y 坐标

  // 初始化 SpeechRecognition
  const initializeRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("当前浏览器不支持语音识别功能，请使用 Chrome 或其他支持的浏览器。");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "zh-CN"; // 设置语言为中文
    recognition.interimResults = false; // 是否返回中间结果
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setChatHistory((prev) =>
        prev.concat({
          id: uuid(),
          source: "guest",
          content: transcript,
        })
      );
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event);
    };

    recognition.onend = (event) => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
  };

  const initAudio = () => {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
      })
      .then(initAudioData)
      .catch((e) => {
        console.log("出问题", e);
      });
  };
  const audioCtx = useRef(null);
  const source = useRef(null);
  const analyserNode = useRef(null);

  const initAudioData = (stream) => {
    recognitionRef.current = stream;
    audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    // audioCtx.sampleRate = 1600;
    source.current = audioCtx.current.createMediaStreamSource(
      recognitionRef.current
    );
    analyserNode.current = audioCtx.current.createAnalyser();
    analyserNode.current.fftSize = 4096;

    analyserNode.current.smoothingTimeConstant = 0.85;
    source.current.connect(analyserNode.current);
    recordAudioData();
  };
  const recordAudioData = () => {
    const chunks = [];
    const recorder = new MediaRecorder(recognitionRef.current, {
      mimeType: "audio/webm",
    });

    recorder.ondataavailable = (event) => {
      chunks.push(event.data);
    };

    recorder.onstop = async () => {
      const audioBlob = new Blob(chunks, { type: "audio/wav" });
      const base64 = await blobToBase64(audioBlob);
      initFetch(base64);
    };

    recorder.start();
    setTimeout(() => recorder.stop(), 5000);
  };

  const initFetch = async (base64data) => {
    const asr = await audioToText({
      data: base64data,
      format: "wav",
      sampleRate: 1600,
    });

    if (!asr) return;
    const text = await dialogue({ streaming: false, data: asr.data });

    if (!text) return;
    const audioRes = await textToSpeech({ streaming: false, data: asr.data });

    nextCas.speakByAudio(audioRes.data);
  };
  // 开始录音和语音识别
  const startRecording = () => {
    // if (!recognitionRef.current) {
    // initializeRecognition();
    initAudio();
    // }
    // recognitionRef.current.start();
    setIsRecording(true);
  };

  // 停止录音和语音识别
  const stopRecording = () => {
    // if (recognitionRef.current) {
    // recognitionRef.current.stop();
    // }

    // 关闭麦克风
    const tracks = recognitionRef.current.getAudioTracks();
    for (let i = 0, len = tracks.length; i < len; i++) {
      tracks[i].stop();
    }
    // 断开音频节点
    analyserNode.current.disconnect();
    source.current.disconnect();
    analyserNode.current = null;
    source.current = null;

    setIsRecording(false);
  };
  const handleMouseDown = async (e) => {
    if (e && e.touches?.length > 0) {
      startYRef.current = e?.touches[0]?.clientY || 0; // 记录触摸的起始 Y 坐标
    }
    setStatus("recording");
    setInputColor("down");
    timeoutRef.currepnt = setTimeout(() => {
      startRecording();
    }, 300); // 延迟 300 毫秒开始录音
  };
  const handleMouseUp = () => {
    setStatus("talking");
    setInputColor("put");
    setCancelRecording(false);
    clearTimeout(timeoutRef.current);
    if (isRecording) {
      stopRecording();
    }
  };
  const handleTouchMove = (e) => {
    const currentY = e?.touches[0]?.clientY || 0; // 当前 Y 坐标
    if (startYRef.current - currentY > 50) {
      // 如果上滑超过 50 像素
      setCancelRecording(true);
    } else {
      setCancelRecording(false);
    }
  };

  const sendSpeak = async () => {
    if (!speakText) return;
    setChatHistory((prev) =>
      prev.concat([
        {
          id: uuid(),
          source: "guest",
          content: speakText,
        },
      ])
    );

    const talk = await dialogue({ streaming: false, data: speakText });
    if (!talk) return;
    const audio = await textToSpeech({ data: talk });
    console.log(
      "%c [ audio ]-296",
      "font-size:13px; background:pink; color:#bf2c9f;",
      audio
    );
    nextCas.speakByAudio(audio.data, {
      onEnd: () => {
        setSpeakText("");
        console.log("onEnd");
      },
      onStart: () => {
        setChatHistory((prev) =>
          prev.concat([
            {
              id: uuid(),
              source: "master",
              content: talk,
            },
          ])
        );
      },
    });
  };

  const onkeydown = async (e) => {
    if (e.keyCode === 13) {
      sendSpeak();
    }
  };

  useEffect(() => {
    if (!chatRef?.current) return;
    chatRef.current.scrollTop = chatRef.current?.scrollHeight;
  }, [chatHistory]);

  const containerCss = useMemo(() => {
    return {
      position: "relative",
      width: `${chatHistory.length > 0 ? "calc(100vw - 150px)" : "100vw"}`,
      height: "calc(100vh - 380px)",
      flexShrink: 0,
      backgroundColor: "#4B526B",
    };
  }, [chatHistory]);

  return (
    <main className="main">
      <div className="content">
        <div
          style={containerCss}
          className={`${chatHistory.length > 0 ? "right_150" : ""}`}
          ref={container}
        ></div>
        <div className="chat" ref={chatRef}>
          {chatHistory?.map((e) => (
            <div key={e.id} className={`chat-item ${e.source}`}>
              {e.content}
            </div>
          ))}
        </div>
      </div>
      {!inited && (
        <div className="apis">
          <div className="api_box">
            <div className="api_title">初始化状态：</div>
            <div className="api_title">
              {inited ? "初始化完成" : "正在加载" + progress + "%"}
            </div>
          </div>
        </div>
      )}

      {inited && (
        <>
          <div className="container">
            {status === "default" && (
              <div className="footer">
                <div className="input-container">
                  <input
                    type="text"
                    placeholder="来跟我聊聊吧"
                    className="input"
                    value={speakText}
                    onKeyDown={(e) => onkeydown(e)}
                    onChange={(e) => setSpeakText(e.target.value)}
                  />
                  <button
                    className="mic-button"
                    onClick={() => handleMicClick("talking")}
                  >
                    <img src={adudioSvg} alt="" />
                  </button>
                </div>
                <div className="phone" onClick={(e) => sendSpeak(e)}>
                  <img src={sendSvg} alt="" />
                </div>
              </div>
            )}

            {inited && ["talking", "recording"].includes(status) && (
              <div className="input-container">
                <button
                  placeholder={`${
                    status === "recording" ? "松手发送" : "按住说话"
                  }`}
                  className={`input ${inputColor === "put" ? "put" : "down"}`}
                  readOnly
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                  onTouchStart={handleMouseDown}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleMouseUp}
                >
                  {cancelRecording
                    ? "松开取消"
                    : isRecording
                    ? "录音中..."
                    : "按住说话"}
                </button>

                <button
                  className="mic-button"
                  onClick={() => handleMicClick("default")}
                >
                  ☰
                </button>
              </div>
            )}
            <div className="bot">内容由AI生成，使用前请先仔细甄别</div>
          </div>
        </>
      )}
    </main>
  );
}

export default Human;
