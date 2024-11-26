import { Storage } from '@google-cloud/storage';
import { NextResponse } from 'next/server';
import { Readable } from 'stream';

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }
});

const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME;
const bucket = storage.bucket(bucketName);

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Create a unique filename
    const fileName = `uploads/${Date.now()}-${file.name}`;
    const fileUpload = bucket.file(fileName);

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Create a promise to handle the upload
    const uploadPromise = new Promise((resolve, reject) => {
      const stream = Readable.from(buffer);
      const writeStream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.type,
        },
        resumable: false
      });

      writeStream.on('error', (error) => {
        console.error('Upload stream error:', error);
        reject(error);
      });

      writeStream.on('finish', () => {
        resolve();
      });

      stream.pipe(writeStream);
    });

    // Wait for the upload to complete
    await uploadPromise;

    // Generate the public URL
    const imageUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to upload image',
      details: error.message 
    }, { status: 500 });
  }
}
