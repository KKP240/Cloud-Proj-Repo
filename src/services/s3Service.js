// src/services/s3Service.js
require('dotenv').config();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const region = process.env.AWS_REGION || 'ap-southeast-1';
const bucket = process.env.S3_BUCKET;

const s3 = new S3Client({ region });

async function getPresignedUploadUrl(key, contentType='application/octet-stream', expiresIn=900) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType
  });
  const url = await getSignedUrl(s3, command, { expiresIn });
  return url;
}

module.exports = { getPresignedUploadUrl };
