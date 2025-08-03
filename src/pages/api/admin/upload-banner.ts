import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import { uploadToCloudinary } from '@lib/cloudinary';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const form = new IncomingForm();
    
    const [fields, files] = await form.parse(req);
    
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const slug = Array.isArray(fields.slug) ? fields.slug[0] : fields.slug;
    
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    if (!slug) {
      return res.status(400).json({ message: 'Slug is required' });
    }

    // Validate file type
    if (!file.mimetype?.startsWith('image/')) {
      return res.status(400).json({ message: 'Only image files are allowed' });
    }

    // Read file buffer
    const fileBuffer = fs.readFileSync(file.filepath);
    
    // Upload to Cloudinary
    const fileName = `${slug}-banner`;
    const cloudinaryUrl = await uploadToCloudinary(fileBuffer, fileName, 'banners');

    // Clean up temporary file
    fs.unlinkSync(file.filepath);

    res.status(200).json({
      message: 'File uploaded successfully',
      url: cloudinaryUrl,
      filename: `${fileName}.jpg`
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      message: 'Failed to upload file',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
