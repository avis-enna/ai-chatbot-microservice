import { KnowledgeBase } from '../types/index.js';

export const knowledgeBase: KnowledgeBase = {
  personalInfo: {
    name: "Your Name",
    title: "Full Stack Developer & AI Engineer",
    email: "your.email@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    summary: "Passionate full-stack developer with expertise in AI/ML, modern web technologies, and cloud architecture. Experienced in building scalable applications and implementing cutting-edge AI solutions.",
    linkedIn: "https://linkedin.com/in/yourprofile",
    github: "https://github.com/yourusername",
    portfolio: "https://yourportfolio.com"
  },
  
  experience: [
    {
      company: "Tech Innovation Inc.",
      position: "Senior Full Stack Developer",
      duration: "2022 - Present",
      location: "San Francisco, CA",
      description: "Lead development of AI-powered web applications and microservices architecture",
      achievements: [
        "Built and deployed 5+ production AI applications serving 10,000+ users",
        "Implemented microservices architecture reducing system latency by 40%",
        "Led a team of 4 developers in agile development practices",
        "Integrated multiple AI models including GPT, Claude, and custom trained models"
      ],
      technologies: ["React", "Node.js", "Python", "Docker", "AWS", "OpenAI API", "PostgreSQL"]
    },
    {
      company: "StartupXYZ",
      position: "Full Stack Developer",
      duration: "2020 - 2022",
      location: "San Francisco, CA",
      description: "Developed scalable web applications and implemented DevOps practices",
      achievements: [
        "Built responsive web applications using React and Node.js",
        "Implemented CI/CD pipelines reducing deployment time by 60%",
        "Developed RESTful APIs handling 1M+ requests daily",
        "Optimized database queries improving performance by 50%"
      ],
      technologies: ["React", "Node.js", "Express", "MongoDB", "Docker", "Jenkins", "AWS"]
    }
  ],
  
  skills: {
    technical: [
      "JavaScript/TypeScript", "Python", "Java", "Go", "Rust",
      "React", "Next.js", "Vue.js", "Angular", "Svelte",
      "Node.js", "Express", "FastAPI", "Django", "Spring Boot",
      "PostgreSQL", "MongoDB", "Redis", "Elasticsearch",
      "Docker", "Kubernetes", "AWS", "Azure", "GCP",
      "Machine Learning", "Deep Learning", "Natural Language Processing",
      "LLMs", "OpenAI API", "Hugging Face", "TensorFlow", "PyTorch"
    ],
    languages: ["JavaScript", "TypeScript", "Python", "Java", "Go", "Rust", "SQL"],
    frameworks: ["React", "Next.js", "Node.js", "Express", "FastAPI", "Django", "Spring Boot"],
    tools: ["Git", "Docker", "Kubernetes", "Jenkins", "GitHub Actions", "Terraform", "Prometheus"],
    databases: ["PostgreSQL", "MongoDB", "Redis", "Elasticsearch", "SQLite", "DynamoDB"]
  },
  
  education: [
    {
      institution: "University of California, Berkeley",
      degree: "Bachelor of Science in Computer Science",
      duration: "2016 - 2020",
      location: "Berkeley, CA",
      gpa: "3.8/4.0",
      relevant_coursework: [
        "Data Structures and Algorithms",
        "Machine Learning",
        "Database Systems",
        "Software Engineering",
        "Computer Networks",
        "Artificial Intelligence"
      ]
    }
  ],
  
  projects: [
    {
      name: "AI-Powered Content Generator",
      description: "Full-stack web application that generates marketing content using OpenAI GPT-4, with user authentication, payment integration, and analytics dashboard",
      technologies: ["React", "Node.js", "OpenAI API", "Stripe", "PostgreSQL", "Redis", "Docker"],
      github: "https://github.com/yourusername/ai-content-generator",
      demo: "https://ai-content-generator.yourportfolio.com",
      achievements: [
        "Processed 50,000+ content generation requests",
        "Integrated multiple AI models for different content types",
        "Implemented real-time collaboration features",
        "Built comprehensive analytics dashboard"
      ]
    },
    {
      name: "Microservices E-commerce Platform",
      description: "Scalable e-commerce platform built with microservices architecture, featuring product catalog, user management, order processing, and payment integration",
      technologies: ["React", "Node.js", "Express", "MongoDB", "Redis", "Docker", "Kubernetes", "AWS"],
      github: "https://github.com/yourusername/ecommerce-microservices",
      demo: "https://ecommerce-demo.yourportfolio.com",
      achievements: [
        "Handled 100,000+ transactions with 99.9% uptime",
        "Implemented event-driven architecture",
        "Built comprehensive monitoring and logging",
        "Deployed on AWS with auto-scaling"
      ]
    },
    {
      name: "Real-time Chat Application",
      description: "Modern chat application with WebSocket support, file sharing, emoji reactions, and AI-powered message suggestions",
      technologies: ["React", "Node.js", "Socket.io", "MongoDB", "Redis", "AWS S3"],
      github: "https://github.com/yourusername/realtime-chat",
      demo: "https://chat-app.yourportfolio.com",
      achievements: [
        "Supports 1,000+ concurrent users",
        "Implemented end-to-end encryption",
        "Built AI-powered message suggestions",
        "Added multi-language support"
      ]
    }
  ],
  
  certifications: [
    {
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2023",
      credentialId: "AWS-SAA-123456"
    },
    {
      name: "Google Cloud Professional Cloud Architect",
      issuer: "Google Cloud",
      date: "2022",
      credentialId: "GCP-PCA-789012"
    },
    {
      name: "Machine Learning Engineer Nanodegree",
      issuer: "Udacity",
      date: "2021",
      credentialId: "UDACITY-MLND-345678"
    }
  ]
};

export const chatPrompts = {
  systemPrompt: `You are an AI assistant representing a skilled full-stack developer and AI engineer. You have access to detailed information about their background, experience, skills, and projects. 

Your role is to:
1. Answer questions about their professional background, skills, and experience
2. Provide detailed information about their projects and achievements
3. Explain their technical expertise and capabilities
4. Discuss their education and certifications
5. Help visitors understand why they would be a great fit for their team or project

Guidelines:
- Be professional but friendly and approachable
- Provide specific examples and details when possible
- Highlight relevant experience based on the question
- If asked about something not in the knowledge base, politely redirect to available information
- Always maintain a positive and confident tone
- Use first person when referring to the developer (e.g., "I have experience with...")
- Keep responses concise but informative
- If asked about availability or hiring, mention that they're open to opportunities

Remember: You are representing this developer, so speak as if you ARE them, not about them.`,

  welcomeMessage: "Hi! I'm an AI assistant that can tell you all about my background, skills, and experience as a full-stack developer and AI engineer. Feel free to ask me anything about my projects, technical expertise, or professional experience!",

  fallbackResponses: [
    "That's an interesting question! While I don't have specific information about that, I'd be happy to tell you about my relevant experience with similar technologies or projects.",
    "I don't have details about that particular topic, but I can share information about my related skills and experience. What specific aspect would you like to know more about?",
    "That's outside my current knowledge base, but I'd love to discuss my experience with related technologies or projects. Is there something specific you'd like to know about my background?"
  ]
};

export const conversationStarters = [
  "What's your experience with AI and machine learning?",
  "Tell me about your most challenging project",
  "What technologies do you specialize in?",
  "What's your background in full-stack development?",
  "Can you describe your experience with cloud platforms?",
  "What programming languages are you most proficient in?",
  "Tell me about your experience with microservices",
  "What's your approach to building scalable applications?"
];
