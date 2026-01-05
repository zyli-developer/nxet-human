import { useEffect,useRef, useState } from "react";
import { Spin } from "antd";

import { useWindowSize } from "@/utils/hooks/useWindowSize.js";

function Ifream() {
    const container =useRef(null)
    const {width, height } =useWindowSize()
    const [isReady, setIsReady] = useState(false)
    
    useEffect(()=>{
      if(!container.current || !width || !height) return
      
      const rafId = requestAnimationFrame(() => {
            // 创建iframe
            const iframe = document.createElement("iframe");
            iframe.id = "slIframe";
            iframe.name = "slIframe";
            // 配置媒体权限
           

            iframe.allow =
              "geolocation;midi;encrypted-media;microphone *;camera *;display-capture *;";
            iframe.src = "https://nexthuman.cn/share/#/assembly/?solutionId=sol_29736";
            // 宽高要控制处理
            iframe.style = `border:none;width:${width};height:${height};`;
            // container.current.appendChild(iframe);
            
            // 成功获取到宽高后，设置准备完成
            setIsReady(true);
      });
      
      return () => cancelAnimationFrame(rafId);
         
    },[container,width,height])
    
    return (
      <div ref={container} style={{width,height}}>
        {!isReady ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            minHeight: '100vh'
          }}>
            <Spin size="large" tip="正在加载..." />
          </div>
        ) : (
          <iframe 
            src="https://nexthuman.cn/share/#/assembly/?solutionId=sol_29736"  
            title='pku' 
            style={{width,height}}    
            allow="camera *; microphone *" 
            frameBorder="0"
          />
        )}
      </div>
      
     );
}

export default Ifream;