import axios from 'axios';
export const BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const initHttp = (store, onUnAuthCb) => {
  axios.interceptors.request.use(config => {
    const { auth: { jwt } } = store.getState();
    
    config.headers = config.headers || {};
    if (jwt) {
      config.headers['Authorization'] = `Token ${jwt}`;
    }

    return config;
  });

  axios.interceptors.response.use(res => res, err => {
    const message = err.response && err.response.data.message;

    if (message === 'invalid-jwt') {
      onUnAuthCb();
    }

    return Promise.reject(err);
  });
};

export const request = ({
  url,
  fullUrl,
  method = 'get',
  params = {},
  headers = {},
  body = {},
  formData,
  type = 'application/json',
  timeout = 20000,
}) => {
  const baseUrl = BASE_URL;

  if (!url && !fullUrl) {
    return Promise.reject(new Error('Request URL is undefined'));
  }

  const urlParams = {
    ...params
  };
  const reqHeaders = {
    Accept: 'application/json',
    'Content-Type': type,
    ...headers
  };
  
  return axios({
    method,
    url: fullUrl || `${baseUrl}${url}`,
    data: formData || JSON.stringify(body),
    params: urlParams,
    headers: reqHeaders,
    timeout
  });
}
