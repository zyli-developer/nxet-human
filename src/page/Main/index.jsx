import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./index.module.scss";
import NextCas from "@nextcas/sdk";
import { v4 as uuid } from "uuid";
import Recorder from "js-audio-recorder";
import { blobToBase64 } from "../../utils/index";
import sendSvg from "../../assets/send.svg";
import adudioSvg from "../../assets/audio.svg";
import textSvg from "../../assets/text.svg";
import {
  dialogue,
  nhToken,
  textToSpeech,
  audioToText,
} from "../../server/main";
import { useWindowSize } from "@/utils/hooks/useWindowSize.js";
import { message } from "antd";

let nextCas = null;

function Human() {
  const container = useRef(null);
  const chatRef = useRef(null);
  const [token, setToken] = useState();
  const [inited, setInited] = useState();
  const [progress, setProgress] = useState(0);
  const { width, height } = useWindowSize();
  const [packShow, setPackShow] = useState(false);
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

  const recorder = useRef(null);
  useEffect(() => {
    getToken();
    recorder.current = new Recorder({
      sampleBits: 16, // 采样位数，支持 8 或 16，默认是16
      sampleRate: 16000, // 采样率，支持 11025、16000、22050、24000、44100、48000，根据浏览器默认值，我的chrome是48000
      numChannels: 1,
    });
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
  const [status, setStatus] = useState("talking");

  const handleMicClick = (type) => {
    setStatus(type); // 点击话筒切换到按住说话状态
    setIsRecording(false);
  };

  const [isRecording, setIsRecording] = useState(false);
  // const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);
  const [inputColor, setInputColor] = useState("put");
  const [cancelRecording, setCancelRecording] = useState(false);

  const startYRef = useRef(0); // 记录触摸开始的 Y 坐标

  const initFetch = async (base64data) => {
    const asr = await audioToText({
      data: base64data,
      format: "wav",
      sampleRate: 1600,
    });

    if (!asr) return;
    if (asr.data) {
      setChatHistory((prev) =>
        prev.concat([
          {
            id: uuid(),
            source: "guest",
            content: asr.data,
          },
        ])
      );
    }
    setPackShow(true);
    const text = await dialogue({ streaming: false, data: asr.data });
    if (!text) return;

    const audioRes = await textToSpeech({ streaming: false, data: text });
    nextCas.speakByAudio(audioRes.data, {
      onEnd: () => {
        console.log("onEnd");
      },
      onStart: () => {
        setChatHistory((prev) =>
          prev.concat([
            {
              id: uuid(),
              source: "master",
              content: text,
            },
          ])
        );
      },
    });
  };

  // 开始录音和语音识别
  const startRecording = () => {
    recorder.current.start().then(
      (res) => {
        console.log(
          "%c [ res ]-192",
          "font-size:13px; background:pink; color:#bf2c9f;",
          res
        );
      },
      (error) => {
        message.error(error?.message);
        console.log(
          "%c [ error ]-194",
          "font-size:13px; background:pink; color:#bf2c9f;",
          error
        );
      }
    );
    setIsRecording(true);
  };

  // 停止录音和语音识别
  const stopRecording = async () => {
    recorder.current.stop();
    const blob = recorder.current.getWAVBlob();
    const base64 = await blobToBase64(blob);
    setIsRecording(false);
    initFetch(base64);
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
    setPackShow(true);
    setSpeakText("");
    const talk = await dialogue({ streaming: false, data: speakText });
    if (!talk) return;
    const audio = await textToSpeech({ data: talk });

    nextCas.speakByAudio(audio.data, {
      onEnd: () => {
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
      width,
      height,
      right: packShow && chatHistory.length > 0 ? "-180px" : "",
      borderColor: "none",
      outlineColor: "none",
      boxShadow: "none",
    };
  }, [height,width,chatHistory, packShow]);

  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <div style={containerCss} ref={container} key="container"></div>
        {chatHistory.length > 0 && (
          <div className={styles.chat} ref={chatRef}>
            {packShow &&
              chatHistory?.map((e) => (
                <div
                  key={e.id}
                  className={`${styles.chat_item} ${styles[e.source]}`}
                >
                  {e.content}
                </div>
              ))}
            {packShow && (
              <span
                key="packup"
                className={styles.packup}
                onClick={() => setPackShow(false)}
              >
                {"<"}
              </span>
            )}
            {!packShow && chatHistory.length > 0 && (
              <span
                key="packdown"
                className={styles.packdown}
                onClick={() => setPackShow(true)}
              >
                {">"}
              </span>
            )}
          </div>
        )}
      </div>

      {!inited && (
        <div className={styles.apis}>
          <div className={styles.api_box}>
            <span>初始化状态：</span>
            <span>{inited ? "初始化完成" : "正在加载" + progress + "%"}</span>
          </div>
        </div>
      )}

      {inited && (
        <div className={styles.container}>
          {status === "default" && (
            <div className={styles.footer}>
              <div className={styles.input_container}>
                <input
                  type="text"
                  placeholder="来跟我聊聊吧"
                  className={styles.input}
                  value={speakText}
                  onKeyDown={(e) => onkeydown(e)}
                  onChange={(e) => setSpeakText(e.target.value)}
                />
                <button
                  className={styles.mic_button}
                  onClick={() => handleMicClick("talking")}
                >
                  <img src={adudioSvg} alt="" />
                </button>
              </div>
              <div className={styles.phone} onClick={(e) => sendSpeak(e)}>
                <img src={sendSvg} alt="" />
              </div>
            </div>
          )}

          {inited && ["talking", "recording"].includes(status) && (
            <div className={styles.input_container}>
              <button
                placeholder={`${
                  status === "recording" ? "松手发送" : "按住说话"
                }`}
                className={`${styles.input} ${
                  inputColor === "put" ? styles.put : styles.down
                }`}
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
                className={styles.mic_button}
                onClick={() => handleMicClick("default")}
              >
                <img src={textSvg} alt="" />
              </button>
            </div>
          )}
          <div className={styles.bot}>内容由AI生成，使用前请先仔细甄别</div>
        </div>
      )}
    </main>
  );
}

export default Human;
