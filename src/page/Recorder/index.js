import { useEffect } from 'react';
import 'recorder-core' //注意如果未引用Recorder变量，可能编译时会被优化删除（如vue3 tree-shaking），请改成 import 'recorder-core'，或随便调用一下 Recorder.a=1 保证强引用

//引入相应格式支持文件；如果需要多个格式支持，把这些格式的编码引擎js文件放到后面统统引入进来即可
import 'recorder-core/src/engine/mp3'
import 'recorder-core/src/engine/mp3-engine' //如果此格式有额外的编码引擎（*-engine.js）的话，必须要加上

//以上三个也可以合并使用压缩好的recorder.xxx.min.js
//比如 import Recorder from 'recorder-core/recorder.mp3.min' //已包含recorder-core和mp3格式支持

//可选的插件支持项，把需要的插件按需引入进来即可
import 'recorder-core/src/extensions/waveview'



let  rec,processTime,wave,recOpen

function Recorder() {
useEffect(()=>{
    recOpen=function(success){//一般在显示出录音按钮或相关的录音界面时进行此方法调用，后面用户点击开始录音时就能畅通无阻了
        rec=Recorder({ //本配置参数请参考下面的文档，有详细介绍
            type:"mp3",sampleRate:16000,bitRate:16 //mp3格式，指定采样率hz、比特率kbps，其他参数使用默认配置；注意：是数字的参数必须提供数字，不要用字符串；需要使用的type类型，需提前把格式支持文件加载进来，比如使用wav格式需要提前加载wav.js编码引擎
            ,onProcess:function(buffers,powerLevel,bufferDuration,bufferSampleRate,newBufferIdx,asyncEnd){
                //录音实时回调，大约1秒调用12次本回调，buffers为开始到现在的所有录音pcm数据块(16位小端LE)
                //可利用extensions/sonic.js插件实时变速变调，此插件计算量巨大，onProcess需要返回true开启异步模式
                //可实时上传（发送）数据，配合Recorder.SampleData方法，将buffers中的新数据连续的转换成pcm上传，或使用mock方法将新数据连续的转码成其他格式上传，可以参考文档里面的：Demo片段列表 -> 实时转码并上传-通用版；基于本功能可以做到：实时转发数据、实时保存数据、实时语音识别（ASR）等
                processTime=Date.now();
    
                //可实时绘制波形（extensions目录内的waveview.js、wavesurfer.view.js、frequency.histogram.view.js插件功能）
                wave&&wave.input(buffers[buffers.length-1],powerLevel,bufferSampleRate);
            }
        });
    
        rec.open(function(){//打开麦克风授权获得相关资源
            //rec.start() 此处可以立即开始录音，但不建议这样编写，因为open是一个延迟漫长的操作，通过两次用户操作来分别调用open和start是推荐的最佳流程
    
            //创建可视化，指定一个要显示的div
            if(Recorder.WaveView)wave=Recorder.WaveView({elem:".recwave"});
            success&&success();
        },function(msg,isUserNotAllow){//用户拒绝未授权或不支持
            console.log((isUserNotAllow?"UserNotAllow，":"")+"无法录音:"+msg);
        });
    };
},[])

    /**开始录音**/
function recStart(){//打开了录音后才能进行start、stop调用
    rec.start();
    
    //【稳如老狗WDT】可选的，监控是否在正常录音有onProcess回调，如果长时间没有回调就代表录音不正常
    var wdt=rec.watchDogTimer=setInterval(function(){
        if(!rec || wdt!=rec.watchDogTimer){ clearInterval(wdt); return } //sync
        if(Date.now()<rec.wdtPauseT) return; //如果暂停录音了就不检测：puase时赋值rec.wdtPauseT=Date.now()*2（永不监控），resume时赋值rec.wdtPauseT=Date.now()+1000（1秒后再监控）
        if(Date.now()-(processTime||startTime)>1500){ clearInterval(wdt);
            console.error(processTime?"录音被中断":"录音未能正常开始");
            // ... 错误处理，关闭录音，提醒用户
        }
    },1000);
    var startTime=Date.now(); rec.wdtPauseT=0; processTime=0;
};

/**结束录音**/
function recStop(){
    rec.watchDogTimer=0; //停止监控onProcess超时
    rec.stop(function(blob,duration){
        
        //简单利用URL生成本地文件地址，注意不用了时需要revokeObjectURL，否则霸占内存
        //此地址只能本地使用，比如赋值给audio.src进行播放，赋值给a.href然后a.click()进行下载（a需提供download="xxx.mp3"属性）
        var localUrl=(window.URL).createObjectURL(blob);
        console.log(blob,localUrl,"时长:"+duration+"ms");
        rec.close();//释放录音资源，当然可以不释放，后面可以连续调用start；但不释放时系统或浏览器会一直提示在录音，最佳操作是录完就close掉
        rec=null;
        
        //已经拿到blob文件对象想干嘛就干嘛：立即播放、上传、下载保存
        
        /*** 【立即播放例子】 ***/
        var audio=document.createElement("audio");
        document.body.prepend(audio);
        audio.controls=true;
        audio.src=localUrl;
        audio.play();
    },function(msg){
        console.log("录音失败:"+msg);
        rec.close();//可以通过stop方法的第3个参数来自动调用close
        rec=null;
    });
};
    return ( <div>

    <button onClick={()=>recStart()}>开始</button>
    <button  onClick={()=>recStop()}>停止</button>
    </div> );
}

export default Recorder;