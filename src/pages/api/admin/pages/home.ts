import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

type HomeContent = {
  title: string;
  subtitle: string;
  description: string;
  name: string;
  role: string;
  resumeLink: string;
  linkedinLink: string;
  githubLink: string;
};

const homeConfigPath = path.join(process.cwd(), 'src', 'config', 'home.json');

// Ensure config directory exists
const configDir = path.dirname(homeConfigPath);
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

// Default home content
const defaultHomeContent: HomeContent = {
  title: 'Hi!',
  subtitle: "I'm Risal - Full Stack Developer",
  description: "I'm a self-taught Software Engineer turned Full Stack Developer. I enjoy working with TypeScript, React, and Node.js. I also love exploring new technologies and learning new things.",
  name: 'Risal',
  role: 'Full Stack Developer',
  resumeLink: '',
  linkedinLink: 'https://linkedin.com/in/risalamin',
  githubLink: 'https://github.com/risalamin'
};

function getHomeContent(): HomeContent {
  try {
    if (fs.existsSync(homeConfigPath)) {
      const content = fs.readFileSync(homeConfigPath, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Error reading home config:', error);
  }
  return defaultHomeContent;
}

function saveHomeContent(content: HomeContent): void {
  fs.writeFileSync(homeConfigPath, JSON.stringify(content, null, 2));
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        const content = getHomeContent();
        res.status(200).json(content);
        break;

      case 'PUT':
        const newContent = req.body as HomeContent;
        
        // Validate required fields
        if (!newContent.title || !newContent.name || !newContent.role) {
          return res.status(400).json({ 
            message: 'Title, name, and role are required fields' 
          });
        }

        saveHomeContent(newContent);
        res.status(200).json({ 
          message: 'Home content updated successfully',
          content: newContent
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('Home API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
