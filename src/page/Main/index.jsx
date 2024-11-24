import { useEffect, useRef, useState } from "react";
import "./index.css";
import NextCas from "@nextcas/sdk";
// import axios from "axios";
// import Icon from '../../components/Icon'
import sendSvg  from '../../icons/send.svg'
import { dialogue, nhToken } from "../../server/main";

let nextCas = null;

function Human() {
  const container = useRef(null);
  const chatRef =useRef(null)
  const [token, setToken] = useState();
  const [inited, setInited] = useState();
  const [progress, setProgress] = useState(0);
  
  const getToken = async () => {
    try {
      const response = await nhToken({"visitId":"123", "visitName":"abc"});
      console.log('%c [ response ]-19', 'font-size:13px; background:pink; color:#bf2c9f;', response)
      setToken(response.data);
    } catch (err) {
      console.log(
        "%c [ err ]-21",
        "font-size:13px; background:pink; color:#bf2c9f;",
        err
      );
    }
  };
  useEffect(() => {
    getToken();
      }, []);

  const initHuman = ()=>{
    nextCas = new NextCas(container.current, {
      avatarId: "avatar_257",
      actorId: "actor_114303",
      token,
      templateName: "base",
      // src:"http://192.168.1.12:3000/empty"
    });

    nextCas.on("initProgress", (cent) => {
      setProgress(() => cent);
    });
    nextCas.on("ready", (res) => {      
      setInited(true);
      setTimeout(() => {
        nextCas.speak("你好，请问有什么可以帮您", {
          onEnd: () => {
            console.log("onEnd");
          },
          onStart: () => {
            console.log("onStart");
          },
        });
      });
    });
  }
  useEffect(() => {
    if (!token) return;
    initHuman()
    return () => {
      nextCas?.destroy();
    };
  }, [container, token]);

  const [speakText, setSpeakText] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [status, setStatus] = useState("default");
  
  const handleMicClick = () => {
    setStatus("talking"); // 点击话筒切换到按住说话状态
  };
  // const ask = async () => {
  //   setChatHistory((prev) =>
  //     prev.concat({
  //       source: "guest",
  //       content: speakText,
  //     })
  //   );

  //   const askId = await nextCas.ask(speakText);

  //   const index = chatHistory.length;
  //   setSpeakText("");
  //   function reply(data) {
  //     if (data.id === askId) {
  //       if (!chatHistory[index]) {
  //         setChatHistory((prev) =>
  //           prev.concat({
  //             source: "nexthuman",
  //             content: data.data.content,
  //           })
  //         );
  //       } else {
  //         const chat = (chatHistory[index].content += data.data.content);
  //         setChatHistory( ()=>chat);
  //       }
        
  //       console.log('%c [ chatHistory ]-112', 'font-size:13px; background:pink; color:#bf2c9f;', chatHistory)
  //       if (data.data.last) {
  //         // 结束了
  //         nextCas.off("reply", reply);
  //       }
  //     }
  //   }
  //   nextCas.on("reply", reply);
  // };
 

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);
  const [inputColor,setInputColor] = useState('put')
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
      console.log('%c [ onresult ]-137', 'font-size:13px; background:pink; color:#bf2c9f;', event)
      const transcript = event.results[0][0].transcript;
    
      setChatHistory((prev) =>
        prev.concat({
          source: "guest",
          content: transcript,
        })
      );
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event);
    };

    recognition.onend = (event) => {
      console.log('%c [ onend ]-151', 'font-size:13px; background:pink; color:#bf2c9f;', event)
      setIsRecording(false);     
    };

    recognitionRef.current = recognition;
  };
 // 开始录音和语音识别
  const startRecording = () => {
    if (!recognitionRef.current) {
      initializeRecognition();
    }

    recognitionRef.current.start();
    setIsRecording(true);
  };

  // 停止录音和语音识别
  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };
  const handleMouseDown = async (e) => {
    console.log('%c [ e ]-177', 'font-size:13px; background:pink; color:#bf2c9f;', e)
    startYRef.current = e.touches[0].clientY; // 记录触摸的起始 Y 坐标
    setStatus("recording")
    setInputColor('down')
    timeoutRef.currepnt = setTimeout(() => {
      startRecording();
    }, 300); // 延迟 300 毫秒开始录音
  }
  const handleMouseUp = () => {
    setStatus("talking")
    setInputColor('put')
    setCancelRecording(false);
    clearTimeout(timeoutRef.current);
    if (isRecording) {
      stopRecording();
    }
  };
  const handleTouchMove =(e)=>{
    const currentY = e.touches[0].clientY; // 当前 Y 坐标
    if (startYRef.current - currentY > 50) {
      // 如果上滑超过 50 像素
      setCancelRecording(true);
    } else {
      setCancelRecording(false);
    }
  }

  const onkeydown =async (e)=>{
    if(!speakText) return
    if (e.keyCode === 13) {
      setChatHistory((prev)=>prev.concat([{
        source: "guest",
        content: speakText,
      }]))

      const talk = await dialogue({  "streaming":false,
        "data":speakText})
        console.log('%c [ talk ]-192', 'font-size:13px; background:pink; color:#bf2c9f;', talk)
        if(!talk) return

      nextCas.speak(talk, {
        onEnd: () => {
          console.log("onEnd");
          
        },
        onStart: () => {
          setSpeakText('')
          setChatHistory((prev)=>prev.concat([{
            source: "master",
            content: talk,
          }]))
          console.log("onStart");
          // chatRef.current.scrollTop = chatRef.current.scrollHeight;
        },
      });
		}
  }

  useEffect(()=>{
    if(!chatRef?.current) return
    chatRef.current.scrollTop = chatRef.current?.scrollHeight;
  },[chatHistory])

  return (
    <main>
      <div
        style={{
          position: "relative",
          width: "100vw",
          height: "100vh",
          flexShrink: 0,
          backgroundColor: "#4B526B",
        }}
        className={`${chatHistory.length>0 ? 'right_150': ''}`}
        ref={container}
      ></div>
      {!inited && (
        <div className='apis'>
          <div className='api_box'>
            <div className='api_title'>初始化状态：</div>
            {inited ? "初始化完成" : "正在加载" + progress + "%"}
          </div>
        </div>
      )}

      {inited && (
        <>
        <div className="chat" ref={chatRef}>
          {chatHistory?.map(e => (
            <div className={`chat-item ${e.source}`}>{e.content}</div>
          ))}
        </div>
        <div className="container">
            {status === "default" && (
              <div className='footer'>
                <div className="input-container">
                  <input
                    type="text"
                    placeholder="旅行这点事，来跟我聊聊吧"
                    className="input"
                    value={speakText}
                    onKeyDown={(e) => onkeydown(e)}
                    onChange={(e) => setSpeakText(e.target.value)} />
                  <button className="mic-button" onClick={handleMicClick}>
                    🎤
                  </button>
                </div>
                <div className='phone' onClick={(e) =>onkeydown(e)}>
                 {/* <Icon name='send'></Icon> */}
                 <img src={sendSvg} alt="" />
                </div>
              </div>
            )}

            { ['talking', 'recording'].includes(status)  && (
              <div className="input-container">
                <button
                  
                  placeholder={`${status === "recording" ? '松手发送':'按住说话'}`}
                  className={`input ${inputColor === 'put' ? 'put': 'down'}`}
                  readOnly
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                  onTouchStart={handleMouseDown}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleMouseUp}
                >   {cancelRecording
                  ? "松开取消"
                  : isRecording
                  ? "录音中..."
                  : "按住说话"}</button>
                <button className="mic-button">☰</button>
              </div>
            )}

       
          </div></>
      )}
      {inited && (<div className="bot">内容由AI生成，使用前请先仔细甄别</div>)}
    </main>
  );
}

export default Human;
