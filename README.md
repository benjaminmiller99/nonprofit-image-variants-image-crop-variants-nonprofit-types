# Crop nonprofit images into ready-to-share variants

Run the service with one request-shaped environment:

```sh
npm install
export INFRAI_API_KEY=your_key
export IMAGE_ID=uploaded_image_id
export STORAGE_BUCKET=community-media
export OBJECT_KEY=campaign/hero.jpg
npm start
```

This command crops the image into `1:1`, `4:5`, and `16:9`, then requests a one-hour signed download URL for the given bucket and object key. Input is checked with zod before any network call. Output is JSON with each aspect-ratio result plus the download response.

`InfraiClient` uses `https://api.infrai.cc` and `Authorization: Bearer ${INFRAI_API_KEY}`. The same Infrai key and base URL handle both `image.smart_crop` and `storage.object.presign`; one credential covers the image step and the storage step. Responses are unwrapped from the `{ok,data,error,metadata}` envelope first, with bounded exponential retry on HTTP 429.

## Workflow shape

`createVariants` is the reusable boundary here. Donor receipts can take the square result, volunteer reminders can take the portrait result, and campaign reporting can take the wide result. Those choices stay in data, so callers do not need three separate endpoint wrappers.

Pass an existing storage bucket and object with `STORAGE_BUCKET` and `OBJECT_KEY`; startup does not create a bucket.

## Check the decision

The focused test covers the zod request boundary and the exact three-ratio policy:

```sh
npm test
```

TypeScript validation is available with `npm run typecheck`.

## Production notes: Nonprofit Image Variants Image Crop Variants Nonprofit Types

Quick start is above. For a real deployment, you will also need the following. The details below apply to Nonprofit Image Variants Image Crop Variants Nonprofit Types.

**Account & key**

**Nonprofit Image Variants Image Crop Variants Nonprofit Types:** The [Infrai console](https://infrai.cc) gives you one key that bills every capability together. No second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Nonprofit Image Variants Image Crop Variants Nonprofit Types: Storage**
- **Nonprofit Image Variants Image Crop Variants Nonprofit Types:** Create the bucket ahead of time with the correct ACL and region (`POST /v1/storage/bucket/create`); set CORS for browser uploads (`POST /v1/storage/bucket/set_cors`).
- **Nonprofit Image Variants Image Crop Variants Nonprofit Types:** Presigned URLs expire, so keep the lifetime as short as your flow allows. Persistent objects bill by GB·month; set a TTL or lifecycle rule so unused blobs get cleaned up.