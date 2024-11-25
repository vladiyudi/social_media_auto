import { Storage } from '@google-cloud/storage';
import { NextResponse } from 'next/server';

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

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `uploads/${Date.now()}-${file.name}`;
    const fileUpload = bucket.file(fileName);

    // Upload file to Google Cloud Storage
    await fileUpload.save(buffer, {
      metadata: {
        contentType: file.type,
      },
      resumable: false
    });

    // Generate a public URL for the file
    const imageUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
