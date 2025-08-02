import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import path from 'path';
import fs from 'fs';

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

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'assets', 'blog', slug);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate filename with extension
    const fileExtension = path.extname(file.originalFilename || '');
    const fileName = `banner${fileExtension}`;
    const uploadPath = path.join(uploadDir, fileName);

    // Move file to upload directory
    fs.copyFileSync(file.filepath, uploadPath);

    // Clean up temporary file
    fs.unlinkSync(file.filepath);

    // Return the public URL
    const publicUrl = `/assets/blog/${slug}/${fileName}`;

    res.status(200).json({
      message: 'File uploaded successfully',
      url: publicUrl,
      filename: fileName
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to upload file' });
  }
}
