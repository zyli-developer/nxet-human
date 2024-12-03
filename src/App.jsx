import React from "react";
import { RouterProvider } from "react-router-dom";
import routes from "./router";
import { ConfigProvider} from "antd";

// import Human from './page/Main';
// import AudioRecorder from './page/AudioRecorder';
// import VoiceButton from './page/VoiceButton';
// import Recorder from './page/Recorder'
import dayjs from "dayjs";

import "dayjs/locale/zh-cn";

import zhCN from "antd/locale/zh_CN";

dayjs.locale("zh-cn");
function App() {
  // const {width,height} =useWindowSize()
  return (
    <ConfigProvider locale={zhCN}>
      <RouterProvider router={routes} />
    </ConfigProvider>
    //  <Human />
    // <AudioRecorder></AudioRecorder>
    // <VoiceButton></VoiceButton>
  );
}

export default App;
