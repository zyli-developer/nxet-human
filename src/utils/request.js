import axios from "axios";
// const baseUrl = 'http://14.103.140.194:8000'
const baseUrl = "https://cloud.walliai.com";

class HttpRequest {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.queue = {};
  }
  getInsideConfig() {
    const config = {
      baseURL: this.baseUrl,
      timeout: 600000,
      headers: {
        "Content-Type": "application/json",
      },
    };
    // const token = getAccessToken()

    // if (token) {
    //   config.headers.Authorization = 'JWT ' + token
    // }

    return config;
  }
  interceptors(instance, { url, showError = true, is_code = true }) {
    // 请求拦截
    instance.interceptors.request.use(
      (config) => {
        // 添加请求时间戳
        config.params = {
          _t: Date.parse(new Date()) / 1000,
          ...config.params,
        };

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    // 响应拦截
    instance.interceptors.response.use(
      (res) => {
        return res.data;
      },

      (error) => {
        return Promise.reject(error);
      }
    );
  }

  request(options) {
    const instance = axios.create();
    options = Object.assign(this.getInsideConfig(), options);
    this.interceptors(instance, options);
    return instance(options);
  }
}
const request = new HttpRequest(baseUrl);
export default request;
