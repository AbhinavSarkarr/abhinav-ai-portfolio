
// Define types for different section data
export type HeroData = {
  name: string;
  title: string;
  description: string;
  image: string;
  resumeLink: string;
};

export type DescriptionItem = {
  main: string;
  subPoints?: string[];
};

export type ExperienceItem = {
  id: string;
  title: string;
  company: string;
  period: string;
  current: boolean;
  description: DescriptionItem[];
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
      title: "Artificial Intelligence Engineer - 1",
      company: "Jellyfish Technologies Pvt. Ltd.",
      period: "January 2025 – Present",
      current: true,
      description: [
        {
          main: "Led delivery of GenAI systems for job matching, data quality, and platform safety, collaborating with cross-functional teams on candidate-facing and analytics workflows.",
          subPoints: [
            "Engineered content moderation and entity extraction system achieving 96% accuracy @ 75% match, ensuring reliable screening (110s P95) and structured population of candidate/job profiles.",
            "Designed hybrid lexical + semantic recommendation engine for skill-based job matching, achieving sub-500ms retrieval latency and increasing apply-through on job postings."
          ]
        },
        {
          main: "Spearheaded lead quality by designing dual-agent AI workflow, enabling context-aware hand-off from data capture to guided sales across 12+ tools using shared memory and persistent sessions."
        },
        {
          main: "Pioneered audio-based multimodal RAG search system for sales workflows, translating customer queries into precise service/product retrieval across 9,000+ indexed offerings."
        }
      ]
    },
    {
      id: "exp2",
      title: "Associate Artificial Intelligence Engineer",
      company: "Jellyfish Technologies Pvt. Ltd.",
      period: "February 2024 – December 2024",
      current: false,
      description: [
        {
          main: "Spearheaded AI-driven support automation, partnering with 3-member engineering team to improve ticket triage accuracy and response reliability.",
          subPoints: [
            "Architected email query extraction and escalation pipeline achieving 94% escalation precision and 92% extraction accuracy, reducing manual triage by 40%.",
            "Developed and documented RAG support response system, achieving 87% context precision with P99 latency of 13.64s, improving automated reply reliability."
          ]
        },
        {
          main: "Fine-tuned Mistral-7B on 18GB Indian legal corpus using DAPT + SFT with 760K+ instruction pairs, reducing perplexity from 18.2 to 10.5 and achieving 83% accuracy on 5K legal QA set.",
          subPoints: [
            "Trained with DDP across 4×H100 GPUs, achieving 3× throughput and 87% scaling efficiency, reducing training time from 6 to 2 days."
          ]
        },
        {
          main: "Built radar-based vital-sign prediction models achieving ±5 BPM heart-rate accuracy across 222K samples and breathing-rate detection across 119K samples, optimized for edge inference via PyTorch JIT."
        },
        {
          main: "Resolved heart-rate inference issues under motion via FFT-based periodicity analysis across 30 radar bins, IIR band-pass filtering, and Viterbi-style temporal smoothing."
        }
      ]
    },
    {
      id: "exp3",
      title: "Deep Learning Engineer",
      company: "AI Zoned",
      period: "June – September 2023",
      current: false,
      description: [
        {
          main: "Designed and executed a zero-shot classification system using bart-large-mnli 1.0 to categorize individuals based on their preferences, work experience, and career aspirations with predefined categories."
        },
        {
          main: "Developed predictive modules for financial forecasting, utilizing XGBoost Regressor to predict corporate maintenance expenditures and contractor profits based on projected workload for branch operations."
        }
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
      title: "AWS Certified Cloud Practitioner",
      issuer: "Amazon Web Services",
      date: "2024",
      link: "https://www.credly.com/badges/aws-cloud-practitioner"
    },
    {
      id: "cert2",
      title: "Databricks Certified Machine Learning Professional",
      issuer: "Databricks",
      date: "2024",
      link: "https://credentials.databricks.com/machine-learning-professional"
    },
    {
      id: "cert3",
      title: "Finetuning Large Language Models",
      issuer: "DeepLearning.AI",
      date: "April 2024",
      link: "#"
    },
    {
      id: "cert4",
      title: "Prompt Engineering with Llama 2&3",
      issuer: "DeepLearning.AI",
      date: "March 2024",
      link: "#"
    },
    {
      id: "cert5",
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
