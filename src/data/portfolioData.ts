
// Define types for different section data
export type HeroData = {
  name: string;
  title: string;
  description: string;
  image: string;
  resumeLink: string;
};

export type ExperienceItem = {
  id: string;
  title: string;
  company: string;
  period: string;
  current: boolean;
  description: string[] | string;
  certificateLink?: string;
};

export type ProjectItem = {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  image: string;
  github?: string;
  liveUrl?: string;
  whatsappLink?: string;
};

export type SkillCategory = {
  id: string;
  name: string;
  skills: string[];
};

export type CertificationItem = {
  id: string;
  title: string;
  issuer: string;
  date: string;
  link?: string;
};

export type PublicationItem = {
  id: string;
  title: string;
  publisher: string;
  date: string;
  link: string;
  description?: string;
};

export type SocialLinks = {
  github?: string;
  linkedin?: string;
  twitter?: string;
  huggingface?: string;
  resume?: string;
  portfolio?: string;
};

// Portfolio data
export const portfolioData = {
  hero: {
    name: "Abhinav Sarkar",
    title: "AI/LLM Engineer",
    description: "Specialized in NLP, RAG pipelines, LLM fine-tuning, and creating custom transformer architectures. Building intelligent systems that leverage the power of artificial intelligence to solve real-world problems.",
    image: "/lovable-uploads/0f976acc-d38b-4ac7-96a7-02ccc53846b5.png",
    resumeLink: "https://drive.google.com/file/d/1kvz-xyhbenuvSjtZr98EC8WMhYjv4pIc/view"
  },
  experiences: [
    {
      id: "exp1",
      title: "Artificial Intelligence Engineer",
      company: "Jellyfish Technologies Pvt. Ltd.",
      period: "February 2024 – Present",
      current: true,
      description: [
        "Fine-tuned Mistral-7B-Instruct-v0.3 on Indian legal corpus by scraping and processing judiciary judgments, CPC and IPC, implementing DAPT on 18GB of text followed by SFT on 760K+ curated input-response pairs leveraging DDP across 4 H200 GPUs, reducing training time from 40 to 8 days through optimized hyperparameters and parallelization",
        "Architected and deployed a SaaS platform for building custom RAG-based chatbots using diverse knowledge sources, incorporating hybrid search with re-ranking techniques for enhanced retrieval accuracy, leveraging llama-3.3-70b-Instruct, and seamlessly integrated a meeting scheduler agent via Dialogflow",
        "Implemented a Graph-based Entity extraction system using decoder architecture that identifies document-entity and entity-entity relationships during training and leverages those patterns for automatic extraction from new documents, achieving 91% precision with partial matching threshold of 60%"
      ]
    },
    {
      id: "exp2",
      title: "Deep Learning Intern",
      company: "Bhramaand Pvt. Ltd.",
      period: "June – September 2023",
      current: false,
      description: [
        "Designed and executed a zero-shot classification system using bart-large-mnli 1.0 to categorize individuals based on their preferences, work experience, and career aspirations with predefined categories",
        "Developed predictive modules for financial forecasting, utilizing XGBoost Regressor to predict corporate maintenance expenditures and contractor profits based on projected workload for branch operations"
      ],
      certificateLink: "https://drive.google.com/file/d/1Izrznc1wU2PE8EEQo2YMWLBPYWW12QV7/view?usp=sharing"
    }
  ],
  projects: [
    {
      id: "proj1",
      title: "JurisGPT",
      description: "A decoder-only transformer architecture built from scratch and trained on Supreme Court judgments data.",
      technologies: ["PyTorch", "Natural Language Processing", "Transformer Architecture", "GELU Activation", "BPE Tokenization"],
      image: "https://images.unsplash.com/photo-1589994965-fcf48d80b0fd?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      github: "https://github.com/AbhinavSarkarr/LLM-From-Scratch",
      liveUrl: "https://bytepairtokenizer.netlify.app/"
    },
    {
      id: "proj2",
      title: "TextTweak",
      description: "A tool that identifies and corrects spelling and grammatical errors, offering accurate suggestions for improved text clarity.",
      technologies: ["Hugging Face", "PyTorch", "T5", "Transformers", "Fine-tuning"],
      image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      liveUrl: "https://huggingface.co/spaces/abhinavsarkar/TextTweakAI"
    },
    {
      id: "proj4",
      title: "WhatsApp Virtual Try-On Bot",
      description: "A WhatsApp-based bot that allows users to send images and try on virtual outfits using a pre-trained model.",
      technologies: ["FastAPI", "Twilio", "Gradio", "Cloudinary", "Docker", "Python"],
      image: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      whatsappLink: "+14155238886",
      liveUrl: "https://github.com/your-username/whatsapp-virtual-try-on"
    },
    {
      id: "proj3",
      title: "Custom Tokenizer",
      description: "An interactive web application allowing users to train custom tokenizers using Byte Pair Encoding technique and visualize the tokenization process.",
      technologies: ["Byte Pair Encoding", "Tokenization", "Web Application", "Interactive Visualization"],
      image: "https://images.unsplash.com/photo-1555949963-aa4f59b51407?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      liveUrl: "https://bytepairtokenizer.netlify.app/"
    }
  ],
  skills: [
    {
      id: "skill1",
      name: "Libraries",
      skills: ["Accelerate", "DeepSpeed", "Pydantic", "BeautifulSoup", "Selenium", "Transformers", "XGBoost", "Keras"]
    },
    {
      id: "skill2",
      name: "Frameworks",
      skills: ["PyTorch", "Langchain", "FastAPI", "Axolotl", "Pandas", "NumPy", "Scikit-learn"]
    },
    {
      id: "skill3",
      name: "Databases",
      skills: ["MySQL", "Redis", "Chroma DB", "QDrant VectorDB", "Pinecone", "Neo4j"]
    },
    {
      id: "skill4",
      name: "Tools",
      skills: ["Docker", "RabbitMQ", "GitHub", "CI/CD Pipelines"]
    }
  ],
  certifications: [
    {
      id: "cert1",
      title: "Finetuning Large Language Models",
      issuer: "DeepLearning.AI",
      date: "April 2024",
      link: "#"
    },
    {
      id: "cert2",
      title: "Prompt Engineering with Llama 2&3",
      issuer: "DeepLearning.AI",
      date: "March 2024",
      link: "#"
    },
    {
      id: "cert3",
      title: "Artificial Intelligence with Machine Learning",
      issuer: "Oracle",
      date: "November 2023",
      link: "#"
    }
  ],
  publications: [
    {
      id: "pub1",
      title: "A Comprehensive Survey on Answer Generation Methods using NLP",
      publisher: "NLP Journal",
      date: "2024",
      link: "https://doi.org/10.1016/j.nlp.2024.100088",
      description: "A detailed analysis of various approaches, techniques, and challenges in generating accurate and contextually appropriate answers using modern NLP methods."
    }
  ],
  social: {
    github: "https://github.com/AbhinavSarkarr",
    linkedin: "https://www.linkedin.com/in/abhinavsarkarrr",
    huggingface: "https://huggingface.co/abhinavsarkar",
    portfolio: "https://abhinav-ai-portfolio.lovable.app/",
    resume: "https://drive.google.com/file/d/1kvz-xyhbenuvSjtZr98EC8WMhYjv4pIc/view"
  }
};
