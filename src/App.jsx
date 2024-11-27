import React from 'react';
import { RouterProvider } from 'react-router-dom';
import routes  from './router';
// import Human from './page/Main';
// import AudioRecorder from './page/AudioRecorder';
// import VoiceButton from './page/VoiceButton';
// import Recorder from './page/Recorder'

function App() {
  return (
    <RouterProvider router={routes} />
    // <Router>
    //   <Routes>
    //     {route.map((route, index) => (
    //       <RouteGuard
    //         key={index}
    //         path={route.path}
    //         element={<route.component />}  // 使用 element 属性传递组件
    //         isProtected={route.isProtected}  // 传递是否需要保护的标识
    //       />
    //     ))}
    //   </Routes>
    // </Router>
//<Recorder></Recorder>
  //  <Human />
  // <AudioRecorder></AudioRecorder>
  // <VoiceButton></VoiceButton>
  );
}

export default App;
