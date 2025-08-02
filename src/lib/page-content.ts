import fs from 'fs';
import path from 'path';

export type HomeContent = {
  title: string;
  subtitle: string;
  description: string;
  name: string;
  role: string;
  resumeLink: string;
  linkedinLink: string;
  githubLink: string;
};

export type AboutContent = {
  title: string;
  name: string;
  content: string;
  techStack: string[];
  certifications: Certification[];
};

export type Certification = {
  id: string;
  title: string;
  issuer: string;
  date: string;
  imageUrl: string;
  credentialUrl?: string;
  description?: string;
};

// Default contents
export const defaultHomeContent: HomeContent = {
  title: 'Hi!',
  subtitle: "I'm Risal - Full Stack Developer",
  description: "I'm a self-taught Software Engineer turned Full Stack Developer. I enjoy working with TypeScript, React, and Node.js. I also love exploring new technologies and learning new things.",
  name: 'Risal',
  role: 'Full Stack Developer',
  resumeLink: '',
  linkedinLink: 'https://linkedin.com/in/risalamin',
  githubLink: 'https://github.com/risalamin'
};

export const defaultAboutContent: AboutContent = {
  title: 'About',
  name: 'Risal Amin',
  content: `Hi, I'm Risal. I started learning web development in November 2021, after building my first web app with Python and the Streamlit module. Since then, I've been dedicated to learning as much as I can about web development.

I began my journey by completing the front-end course on FreeCodeCamp and then moved on to The Odin Project to learn fullstack development. I'm always motivated to learn new technologies and techniques, and I enjoy getting feedback to help me improve.

On this website, I'll be sharing my projects and writing about what I've learned. I believe that writing helps me better understand and retain new information, and I'm always happy to share my knowledge with others. If you have any questions or want to connect, don't hesitate to reach out!`,
  techStack: ['Next.js', 'TypeScript', 'Firebase', 'TailwindCSS'],
  certifications: [
    {
      id: '1',
      title: 'Example Certification',
      issuer: 'Example Institution',
      date: '2024-01-01',
      imageUrl: '/assets/certifications/example-cert.jpg',
      credentialUrl: 'https://example.com/credential',
      description: 'Example certification description'
    }
  ]
};

export function getHomeContent(): HomeContent {
  try {
    const homeConfigPath = path.join(process.cwd(), 'src', 'config', 'home.json');
    if (fs.existsSync(homeConfigPath)) {
      const content = fs.readFileSync(homeConfigPath, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Error reading home config:', error);
  }
  return defaultHomeContent;
}

export function getAboutContent(): AboutContent {
  try {
    const aboutConfigPath = path.join(process.cwd(), 'src', 'config', 'about.json');
    if (fs.existsSync(aboutConfigPath)) {
      const content = fs.readFileSync(aboutConfigPath, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Error reading about config:', error);
  }
  return defaultAboutContent;
}
