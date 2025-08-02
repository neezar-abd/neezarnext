import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

type AboutContent = {
  title: string;
  name: string;
  content: string;
  techStack: string[];
  certifications: Certification[];
};

type Certification = {
  id: string;
  title: string;
  issuer: string;
  date: string;
  imageUrl: string;
  credentialUrl?: string;
  description?: string;
};

const aboutConfigPath = path.join(process.cwd(), 'src', 'config', 'about.json');

// Ensure config directory exists
const configDir = path.dirname(aboutConfigPath);
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

// Default about content
const defaultAboutContent: AboutContent = {
  title: 'About',
  name: 'Risal Amin',
  content: `Hi, I'm Risal. I started learning web development in November 2021, after building my first web app with Python and the Streamlit module. Since then, I've been dedicated to learning as much as I can about web development.

I began my journey by completing the front-end course on FreeCodeCamp and then moved on to The Odin Project to learn fullstack development. I'm always motivated to learn new technologies and techniques, and I enjoy getting feedback to help me improve.

On this website, I'll be sharing my projects and writing about what I've learned. I believe that writing helps me better understand and retain new information, and I'm always happy to share my knowledge with others. If you have any questions or want to connect, don't hesitate to reach out!`,
  techStack: ['Next.js', 'TypeScript', 'Firebase', 'TailwindCSS'],
  certifications: []
};

function getAboutContent(): AboutContent {
  try {
    if (fs.existsSync(aboutConfigPath)) {
      const content = fs.readFileSync(aboutConfigPath, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Error reading about config:', error);
  }
  return defaultAboutContent;
}

function saveAboutContent(content: AboutContent): void {
  fs.writeFileSync(aboutConfigPath, JSON.stringify(content, null, 2));
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        const content = getAboutContent();
        res.status(200).json(content);
        break;

      case 'PUT':
        const newContent = req.body as AboutContent;
        
        // Validate required fields
        if (!newContent.title || !newContent.name || !newContent.content) {
          return res.status(400).json({ 
            message: 'Title, name, and content are required fields' 
          });
        }

        // Ensure techStack is an array
        if (!Array.isArray(newContent.techStack)) {
          newContent.techStack = [];
        }

        saveAboutContent(newContent);
        res.status(200).json({ 
          message: 'About content updated successfully',
          content: newContent
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('About API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
