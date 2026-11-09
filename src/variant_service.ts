import {z} from 'zod';
import {InfraiClient} from './infrai_client.js';
export const requestSchema=z.object({image:z.string().min(1), bucket:z.string().min(1), objectKey:z.string().min(1)});
export const ratios=['1:1','4:5','16:9'] as const;
export type VariantRequest=z.infer<typeof requestSchema>;
export async function createVariants(input:VariantRequest, client=new InfraiClient(process.env.INFRAI_API_KEY||'')){
  const request=requestSchema.parse(input);
  const variants=await Promise.all(ratios.map(async aspect=>({aspect,result:await client.smartCrop(request.image,aspect)})));
  const download=await client.presign(request.bucket,request.objectKey,{op:'get',expires_seconds:3600,response_disposition:'inline'});
  return {variants,download};
}
if(process.argv[1]?.endsWith('variant_service.ts')){
  const parsed=requestSchema.parse({image:process.env.IMAGE_ID,bucket:process.env.STORAGE_BUCKET,objectKey:process.env.OBJECT_KEY});
  createVariants(parsed).then(value=>console.log(JSON.stringify(value,null,2))).catch(error=>{console.error(error.message);process.exitCode=1});
}
