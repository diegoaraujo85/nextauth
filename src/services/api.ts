import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies';
import { signOut } from '../contexts/AuthContext';

let isRefreshing = false;
let failedRequestsQueue = [];

export function setupApiClient(ctx = undefined){
  let cookies = parseCookies(ctx);
  
  const api = axios.create({
    baseURL: 'http://localhost:3333',
    headers:{
      Authorization: `Bearer ${cookies['nextauth.token']}`,
    },
  });

  api.interceptors.response.use(
  response => response,
  (error:AxiosError) => {
    if (error.response.status === 401) {
      
      const isBrowser = typeof window !== 'undefined';
      
      if(error.response.data?.code === 'token.expired'){
        //renovar o token
        cookies = parseCookies(ctx);

        const {'nextauth.refreshToken':refreshToken} = cookies;
        const originalConfig = error.config;
        

        if(!isRefreshing){
        isRefreshing = true;

        api.post('/refresh', {
          refreshToken
          }).then(response => {
          const {token} = response.data;

          setCookie(ctx, 'nextauth.token', token, {
            maxAge: 30 * 24 * 60 * 60, // 30 dias
            path: '/',
          });
          setCookie(ctx, 'nextauth.refreshToken', response.data.refreshToken, {
            maxAge: 30 * 24 * 60 * 60, // 30 dias
            path: '/',
          });

          api.defaults.headers['Authorization'] = `Bearer ${token}`;

          failedRequestsQueue.forEach(req => req.onSuccess(token));
          failedRequestsQueue = [];
        })
        .catch((err) => {
          failedRequestsQueue.forEach(req => req.onFailure(err));
          failedRequestsQueue = [];
          
          if(isBrowser){
            signOut();
          }
        })
        .finally(() => {
          isRefreshing = false;
        })
        }

        return new Promise((resolve, reject) => {
        failedRequestsQueue.push({
          onSuccess: (token:string)=>{
            originalConfig.headers['Authorization'] = `Bearer ${token}`;

            resolve(api(originalConfig));
          },
          onFailure: (failureError:AxiosError)=>{
            reject(failureError);
          },
        })
        });
      }else{
        console.log('não é token expirado')
        console.log("🚀 ~ isBrowser", isBrowser)
        if(isBrowser){
          signOut();
        }
      }
    }
    return Promise.reject(error);
  });

  return api; 
}