import { S3Client } from '@aws-sdk/client-s3';
import config from './config.js';

const r2Client = new S3Client({
  endpoint: config.r2.endpoint,
  region: 'auto',
  credentials: {
    accessKeyId: config.r2.accessKeyId,
    secretAccessKey: config.r2.secretAccessKey,
  },
});

export default r2Client;
