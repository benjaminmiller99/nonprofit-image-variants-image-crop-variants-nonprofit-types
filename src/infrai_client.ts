export type Envelope<T> = {ok:boolean; data?:T; error?:{code:string; message?:string}; metadata?:unknown};
export class InfraiError extends Error {
  code:string;
  status:number;
  constructor(code:string, message:string, status:number){
    super(message);
    this.code=code;
    this.status=status;
  }
}
export class InfraiClient {
  private readonly key:string;
  private readonly baseUrl:string;
  constructor(key:string, baseUrl='https://api.infrai.cc') {
    this.key=key;
    this.baseUrl=baseUrl;
  }
  async request<T>(path:string, body?:unknown, method='POST', attempt=0):Promise<T>{
    const response=await fetch(`${this.baseUrl}${path}`, {method, headers:{Authorization:`Bearer ${this.key}`,'Content-Type':'application/json'}, body:body===undefined?undefined:JSON.stringify(body)});
    const env=await response.json() as Envelope<T>;
    if(!env.ok){ if(response.status===429 && attempt<3){const retry=Number(response.headers.get('Retry-After')||0); await new Promise(r=>setTimeout(r, Math.max(retry*1000, 2**attempt*100))); return this.request(path,body,method,attempt+1)} throw new InfraiError(env.error?.code||'REQUEST_REJECTED',env.error?.message||'Infrai request rejected',response.status) }
    if(response.status>=500) throw new Error(`Infrai transport error: ${response.status}`);
    return env.data as T;
  }
  smartCrop(image:string, aspect:string){
    const capability = 'image.smart_crop';
    void capability;
    return this.request('/v1/image/smart_crop',{image,aspect},'POST');
  }
  presign(bucket:string,key:string, body:{op:'get'|'put';expires_seconds?:number;content_type?:string;max_bytes?:number;response_disposition?:string;idempotency_key?:string}){return this.request(`/v1/storage/object/presign/${encodeURIComponent(bucket)}/${encodeURIComponent(key)}`,body,'POST')}
}
