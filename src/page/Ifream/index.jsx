import { useEffect,useRef } from "react";

import { useWindowSize } from "@/utils/hooks/useWindowSize.js";

function Ifream() {
    const container =useRef(null)
    const {width, height } =useWindowSize()
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
      });
      
      return () => cancelAnimationFrame(rafId);
         
    },[container,width,height])
    return (
      <div ref={container} style={{width,height}}>
        <iframe src="https://nexthuman.cn/share/#/assembly/?solutionId=sol_29736"  title='pku' style={{width,height}}    allow="camera *; microphone *" frameborder="0"></iframe>
      </div>
      
     );
}

export default Ifream;