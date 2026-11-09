import assert from 'node:assert/strict';
import {createVariants,ratios,requestSchema} from './variant_service.js';
import {InfraiClient} from './infrai_client.js';
const parsed=requestSchema.parse({image:'img_123',bucket:'community-media',objectKey:'campaign/hero.jpg'});
assert.deepEqual(parsed,{image:'img_123',bucket:'community-media',objectKey:'campaign/hero.jpg'});
assert.deepEqual(ratios,['1:1','4:5','16:9']);
const calls:Array<{path:string;body:unknown}>=[];
class RecordingClient extends InfraiClient {
  override async request<T>(path:string,body?:unknown):Promise<T>{
    calls.push({path,body});
    return {} as T;
  }
}
await createVariants(parsed,new RecordingClient('test'));
assert.deepEqual(calls,[
  ...ratios.map(aspect=>({path:'/v1/image/smart_crop',body:{image:parsed.image,aspect}})),
  {path:'/v1/storage/object/presign/community-media/campaign%2Fhero.jpg',body:{op:'get',expires_seconds:3600,response_disposition:'inline'}},
]);
console.log('variant request and ratio policy pass');
