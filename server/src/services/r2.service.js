'use strict';

import { DeleteObjectCommand, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from 'uuid';
import r2Client from '../config/r2';
import config from '../config/config';

const generateKey = (folder, originalname) => {
  const ext = originalname.split('.').pop().toLowerCase();
  return `${folder}/${uuidv4()}.${ext}`;
}

const FOLDERS = {
  image:       'images',
  video:       'videos',
  pdf:         'pdfs',
  thumbnail:   'thumbnails',
  certificate: 'certificates',
  avatar:      'avatars',
};


const uploadFile = async ({
  buffer,
  originalname,
  mimeType,
  folder,
  isPublic = false,
}) => {
  const key = generateKey(folder, originalname);

  // What:  PutObjectCommand uploads the file to R2.
  // Why ContentType:
  //   Without ContentType, R2 serves the file as application/octet-stream.
  //   Browsers do not know how to display or play octet-stream files.
  //   Setting the correct type means browsers handle the file correctly —
  //   images display, videos play, PDFs render inline.
  const command = new PutObjectCommand({
    Bucket:      config.r2.bucketName,
    Key:         key,
    Body:        buffer,
    ContentType: mimeType,
  });

  await r2Client.send(command);

  // Build the URL depending on whether the file is public or private
  const url = isPublic && config.r2.publicUrl
    ? `${config.r2.publicUrl}/${key}`
    : null;
  // Why null for private files:
  //   Private files do not have a permanent URL.
  //   The signed URL changes every time it is generated.
  //   We store the key and generate signed URLs on-demand.

  return { key, url };
};

// ── Delete a file ─────────────────────────────────────────────────────────────
// What:  Permanently deletes a file from R2.
// When used:
//   When an instructor deletes a lesson — the video is deleted from R2.
//   When an instructor replaces a thumbnail — old image is deleted.
// Why important:
//   Without deletion, every replaced file stays in R2 forever.
//   R2 charges for storage (after the free tier). Orphaned files cost money.

const deleteFile = async (key) => {
  if (!key) return;  // safety guard — never call with empty key

  const command = new DeleteObjectCommand({
    Bucket: config.r2.bucketName,
    Key:    key,
  });

  await r2Client.send(command);
};

// ── Generate a signed URL ─────────────────────────────────────────────────────
// What:  Creates a temporary URL that allows access to a private R2 file.
// Why temporary:
//   Private files cannot be accessed directly — they return 403.
//   A signed URL embeds a cryptographic signature that proves our
//   backend authorised access. The signature expires after `expiresIn` seconds.
//   After expiry, the URL returns 403 even if the file still exists.
// Why 1 hour expiry:
//   Long enough to watch a full lecture without the URL expiring mid-video.
//   Short enough that a shared URL does not give indefinite access.
// Usage:
//   Before returning a lesson to a student, call this for each file_url.
//   Return the signed URL to the frontend instead of the raw key.

const getSignedFileUrl = async (key, expiresIn = config.signedUrl.expiresIn) => {
  if (!key) return null;

  const command = new GetObjectCommand({
    Bucket: config.r2.bucketName,
    Key:    key,
  });

  return getSignedUrl(r2Client, command, { expiresIn });
};

// ── Extract key from URL ───────────────────────────────────────────────────────
// What:  Extracts the R2 key from a full public URL.
// Why needed:
//   Public files store the full URL in the database.
//   To delete them, we need just the key portion.
//   "https://pub-XXX.r2.dev/images/uuid.jpg" → "images/uuid.jpg"

const getKeyFromUrl = (url) => {
  if (!url || !config.r2.publicUrl) return null;
  return url.replace(`${config.r2.publicUrl}/`, '');
};


export {
    uploadFile,
    deleteFile,
    getSignedFileUrl,
    getKeyFromUrl,
    FOLDERS
}