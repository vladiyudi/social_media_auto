import { Storage } from '@google-cloud/storage';
import { NextResponse } from 'next/server';
import { Readable } from 'stream';
import path from 'path';

let storage;
try {
  if (process.env.NODE_ENV === 'development') {
    // For local development, use credentials from environment variables
    storage = new Storage({
      projectId: 'poetic-analog-442510-e8',
      credentials: {
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }
    });
  } else {
    // For production, use the mounted credentials file
    storage = new Storage();
  }
} catch (error) {
  console.error('Error initializing storage:', error);
}

const bucketName = 'knbl-sma';
const bucket = storage.bucket(bucketName);

export async function POST(request) {
  try {
    if (!storage || !bucket) {
      throw new Error('Storage not properly initialized');
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Create a unique filename
    const fileName = `uploads/${Date.now()}-${file.name}`;
    const blob = bucket.file(fileName);

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Create a promise to handle the upload
    const uploadPromise = new Promise((resolve, reject) => {
      const blobStream = blob.createWriteStream({
        resumable: false,
        metadata: {
          contentType: file.type,
        },
      });

      blobStream.on('error', (error) => {
        console.error('Upload error:', error);
        reject(error);
      });

      blobStream.on('finish', async () => {
        // Instead of setting ACL, we'll just get the public URL since the bucket is publicly accessible
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
        resolve(publicUrl);
      });

      blobStream.end(buffer);
    });

    // Wait for the upload to complete
    const publicUrl = await uploadPromise;

    return NextResponse.json({ 
      success: true,
      url: publicUrl,
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to upload file',
      details: error.message 
    }, { status: 500 });
  }
}
