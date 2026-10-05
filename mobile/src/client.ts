import 'react-native-url-polyfill/auto';
import { createClient, processLock } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
const url=process.env.EXPO_PUBLIC_SUPABASE_URL;
const key=process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const configured=!!url&&!!key;
// Chunk sessions to stay below Keychain item limits. Commit the manifest last.
const storage={
 async getItem(key:string){const manifest=await SecureStore.getItemAsync(key);if(!manifest)return null;const {id,count}=JSON.parse(manifest);const chunks=await Promise.all(Array.from({length:count},(_,i)=>SecureStore.getItemAsync(key+'.'+id+'.'+i)));return chunks.some(v=>v===null)?null:chunks.join('');},
 async setItem(key:string,value:string){const previous=await SecureStore.getItemAsync(key);const id=Date.now().toString(36)+Math.random().toString(36).slice(2);const chunks=value.match(/[\s\S]{1,1500}/g)||[''];for(let i=0;i<chunks.length;i++)await SecureStore.setItemAsync(key+'.'+id+'.'+i,chunks[i]);await SecureStore.setItemAsync(key,JSON.stringify({id,count:chunks.length}));if(previous){const old=JSON.parse(previous);await Promise.all(Array.from({length:old.count},(_,i)=>SecureStore.deleteItemAsync(key+'.'+old.id+'.'+i)));}},
 async removeItem(key:string){const previous=await SecureStore.getItemAsync(key);await SecureStore.deleteItemAsync(key);if(previous){const old=JSON.parse(previous);await Promise.all(Array.from({length:old.count},(_,i)=>SecureStore.deleteItemAsync(key+'.'+old.id+'.'+i)));}}
};
export const supabase=createClient(url||'https://not-configured.supabase.co',key||'not-configured',{auth:{storage,persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,lock:processLock}});
export const origin=(process.env.EXPO_PUBLIC_API_ORIGIN||'https://community.degiftgrid.com').replace(/\/$/,'');
export const asset=(value?:string|null)=>value?(value.startsWith('/')?origin+value:value):undefined;
export async function api(path:string,method='GET',body?:unknown):Promise<any>{
 const {data:{session}}=await supabase.auth.getSession();
 const form=body instanceof FormData;
 const response=await fetch(origin+'/api'+path,{method,headers:{...(session?{Authorization:'Bearer '+session.access_token}:{}),...(!form&&body!==undefined?{'Content-Type':'application/json'}:{})},...(body===undefined?{}:{body:form?body as FormData:JSON.stringify(body)})});
 const data=await response.json().catch(()=>({error:'Unexpected server response.'}));if(!response.ok)throw new Error(data.error||'Request failed.');return data;
}
export async function upload(uri:string,name:string,type:string,path='/community/media'){
 const form=new FormData();form.append('file',{uri,name,type} as unknown as Blob);return api(path,'POST',form);
}
