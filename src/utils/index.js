export const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // 读取完成后的处理
    reader.onloadend = function () {
      const base64data = reader.result;
      const base64String = base64data.split(",")[1];
      resolve(base64String);
    };

    // 错误处理
    reader.onerror = function (error) {
      reject(error);
    };

    // 读取Blob对象，并作为data URL返回
    reader.readAsDataURL(blob);
  });
};
