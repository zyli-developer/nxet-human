import request from '../utils/request'

export const nhToken = (params)=>{
    return request.request({
        url:'/nh/user/v0/token',
        method:'POST',
        data:params
    })
}

export const dialogue = (params)=>{
    return request.request({
        url:'/nh/llm/v0/infer',
        method:'POST',
        data:params
    })
}

export const textToSpeech = (params)=>{
    return request.request({
        url:'/nh/tts/v0/infer',
        method:'POST',
        data:params
    })
}

export const audioToText = (params)=>{
    return request.request({
        url:'/nh/asr/v0/infer',
        method:'POST',
        data:params
    })
}