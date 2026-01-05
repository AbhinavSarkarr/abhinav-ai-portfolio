
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
  category: 'llm' | 'ml' | 'genai' | 'fullstack';
  caseStudy: {
    problemStatement: string;
    solution: string;
    keyFeatures: string[];
    achievements: string[];
    techDetails: string;
  };
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
    title: "AI-ML Engineer",
    description: "AI Engineer with ~2 years of experience focused on building reliable, scalable machine-learning and GenAI systems for real-world use cases. Experienced across the full lifecycle of AI development from problem framing and data design to deployment, evaluation, and continuous optimization.",
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
      id: "llm-from-scratch",
      title: "LLM From Scratch",
      description: "A complete decoder-only transformer architecture built from scratch, covering tokenization, embeddings, self-attention, and GPT model training on legal corpus.",
      technologies: ["PyTorch", "Transformers", "BPE Tokenization", "GELU", "Self-Attention", "Jupyter"],
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60",
      github: "https://github.com/AbhinavSarkarr/LLM-From-Scratch",
      liveUrl: "https://bytepairtokenizer.netlify.app/",
      category: "llm",
      caseStudy: {
        problemStatement: "Understanding the internals of Large Language Models requires hands-on implementation. Most educational resources provide theoretical knowledge without practical implementation experience of core transformer components.",
        solution: "Built a complete decoder-only transformer from scratch, implementing each component individually: BPE tokenizer, embedding layers, multi-head self-attention, feed-forward networks, and the full GPT architecture. Trained the model on Supreme Court judgments to create a domain-specific language model.",
        keyFeatures: [
          "Custom Byte Pair Encoding (BPE) tokenizer implementation",
          "Multi-head self-attention mechanism with scaled dot-product attention",
          "Positional encoding and embedding layers",
          "Layer normalization and residual connections",
          "GPT-style decoder architecture with causal masking",
          "Training pipeline with gradient checkpointing"
        ],
        achievements: [
          "Successfully trained model on legal corpus with coherent text generation",
          "Interactive tokenizer visualization deployed on Netlify",
          "Comprehensive Jupyter notebooks documenting each component",
          "Achieved understanding of transformer internals through implementation"
        ],
        techDetails: "The implementation follows the GPT architecture with 6 transformer layers, 8 attention heads, and 512 embedding dimensions. Uses GELU activation, learned positional embeddings, and implements efficient attention computation with PyTorch."
      }
    },
    {
      id: "texttweakai",
      title: "TextTweakAI",
      description: "An intelligent grammar and spell correction tool powered by fine-tuned T5 model, providing real-time text improvement suggestions.",
      technologies: ["Streamlit", "T5", "PyTorch", "Transformers", "Hugging Face", "NLP"],
      image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=60",
      github: "https://github.com/AbhinavSarkarr/TextTweakAI",
      liveUrl: "https://huggingface.co/spaces/abhinavsarkar/TextTweakAI",
      category: "genai",
      caseStudy: {
        problemStatement: "Writers and non-native English speakers often struggle with grammar and spelling errors. Existing tools are either expensive or lack accuracy in contextual corrections, creating a need for an accessible AI-powered solution.",
        solution: "Developed a dual-approach correction system combining Jaccard Similarity-based spell checking with a fine-tuned T5 model for grammar correction. The application provides real-time feedback through an interactive Streamlit interface.",
        keyFeatures: [
          "Spell checker using Jaccard Similarity and word frequency analysis",
          "Fine-tuned T5 model for contextual grammar correction",
          "Real-time text processing with instant feedback",
          "Interactive Streamlit web interface",
          "Vocabulary derived from extensive literary corpus",
          "Deployed on Hugging Face Spaces for easy access"
        ],
        achievements: [
          "Deployed live application on Hugging Face Spaces",
          "Achieved high accuracy in grammar error correction",
          "Processed thousands of user queries",
          "Reduced error correction time by 80% compared to manual review"
        ],
        techDetails: "The grammar correction model is based on T5-base fine-tuned on the JFLEG and C4_200M datasets. Spell checking uses textdistance library for similarity computation against a vocabulary of 100K+ words."
      }
    },
    {
      id: "virtual-try-on",
      title: "WhatsApp Virtual Try-On Bot",
      description: "A WhatsApp-based bot enabling users to virtually try on clothes by sending images, powered by ML models and Twilio integration.",
      technologies: ["FastAPI", "Twilio", "Gradio", "Cloudinary", "Docker", "Python"],
      image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&auto=format&fit=crop&q=60",
      github: "https://github.com/AbhinavSarkarr/Virtual-Try-On",
      whatsappLink: "+14155238886",
      category: "genai",
      caseStudy: {
        problemStatement: "Online clothing shopping suffers from high return rates due to customers being unable to visualize how clothes would look on them. Traditional try-on requires physical presence, limiting e-commerce potential.",
        solution: "Built a conversational WhatsApp bot that accepts two images—a photo of the user and a garment—then uses ML-powered virtual try-on to generate a realistic image of the user wearing the selected clothing.",
        keyFeatures: [
          "WhatsApp integration via Twilio API for seamless user interaction",
          "FastAPI backend for efficient request handling",
          "Gradio client for ML model inference",
          "Cloudinary integration for image storage and delivery",
          "Docker containerization for easy deployment",
          "Conversational flow for intuitive user experience"
        ],
        achievements: [
          "Reduced virtual try-on process to simple WhatsApp messages",
          "Sub-30 second end-to-end processing time",
          "Scalable architecture supporting concurrent users",
          "Seamless integration with existing messaging workflows"
        ],
        techDetails: "The system uses FastAPI for the REST API, Twilio webhooks for WhatsApp message handling, and Gradio client to interface with virtual try-on ML models. Images are stored on Cloudinary for fast CDN delivery."
      }
    },
    {
      id: "visa-approval-prediction",
      title: "H-1B Visa Approval Prediction",
      description: "ML-powered prediction system for H-1B visa application outcomes using historical petition data and IBM Watson deployment.",
      technologies: ["Scikit-learn", "Flask", "Pandas", "Logistic Regression", "Random Forest", "IBM Watson"],
      image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop&q=60",
      github: "https://github.com/AbhinavSarkarr/Visa-Approval-Prediction-using-IBM-Watson-Machine-Learning",
      category: "ml",
      caseStudy: {
        problemStatement: "International professionals applying for H-1B visas face uncertainty about their application outcomes. Understanding approval likelihood based on historical patterns can help applicants make informed decisions about job offers and career planning.",
        solution: "Developed a classification system analyzing 2011-2016 H-1B petition data to predict visa approval outcomes based on factors like occupation, wage, employer, and job duration. Deployed using IBM Watson ML for production serving.",
        keyFeatures: [
          "Analysis of 500K+ historical H-1B petitions",
          "Multiple ML models: Decision Tree, Random Forest, Logistic Regression",
          "Feature engineering for occupation categories and wage brackets",
          "Flask web interface for real-time predictions",
          "Statistical insights on sponsoring companies and trends",
          "IBM Watson ML deployment for scalable inference"
        ],
        achievements: [
          "Achieved 89% prediction accuracy with Logistic Regression",
          "Identified key factors influencing visa approval",
          "Provided actionable insights for visa applicants",
          "Successfully deployed on IBM Watson ML platform"
        ],
        techDetails: "Data preprocessing includes handling categorical variables, wage normalization, and temporal feature extraction. Model comparison showed Logistic Regression outperforming tree-based methods on this imbalanced dataset."
      }
    },
    {
      id: "finetuned-llms",
      title: "Fine-tuned LLMs Collection",
      description: "Collection of fine-tuned language models including DistilGPT2, Phi2, Llama 3, and Mistral on domain-specific datasets.",
      technologies: ["PyTorch", "Transformers", "LoRA", "QLoRA", "Axolotl", "Hugging Face"],
      image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=60",
      github: "https://github.com/AbhinavSarkarr/Finetuned-LLMs",
      category: "llm",
      caseStudy: {
        problemStatement: "General-purpose LLMs often lack domain-specific knowledge and conversational patterns required for specialized applications like medical consultation or mental health support.",
        solution: "Fine-tuned multiple LLM architectures (DistilGPT2, Phi2, Llama 3 8B, Mistral 7B) on curated datasets including medical data and mental health counseling conversations to create domain-adapted models.",
        keyFeatures: [
          "Fine-tuning implementations for 4 different LLM architectures",
          "Parameter-efficient training using LoRA and QLoRA",
          "Medical domain adaptation for clinical use cases",
          "Mental health counseling conversation fine-tuning",
          "Comprehensive training notebooks with best practices",
          "Model evaluation and comparison frameworks"
        ],
        achievements: [
          "Successfully fine-tuned models with significant perplexity reduction",
          "Created domain-specific models for healthcare applications",
          "Documented efficient fine-tuning techniques",
          "Demonstrated transfer learning effectiveness across model sizes"
        ],
        techDetails: "Fine-tuning uses Hugging Face Transformers with LoRA adapters (rank 16-64) for efficient training. QLoRA enables 4-bit quantization during training for larger models. Training performed on consumer GPUs using gradient checkpointing."
      }
    },
    {
      id: "telco-churn-prediction",
      title: "Telco Customer Churn Prediction",
      description: "Predictive ML model to identify customers likely to discontinue telecom services, enabling proactive retention strategies.",
      technologies: ["Scikit-learn", "XGBoost", "Pandas", "Feature Engineering", "Python", "Pickle"],
      image: "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=800&auto=format&fit=crop&q=60",
      github: "https://github.com/AbhinavSarkarr/Telco-Customer-Churn-Prediction",
      category: "ml",
      caseStudy: {
        problemStatement: "Telecom companies face significant revenue loss from customer churn. Identifying at-risk customers before they leave enables targeted retention campaigns, but requires accurate prediction models based on behavioral patterns.",
        solution: "Built a comprehensive churn prediction pipeline analyzing customer behavioral patterns, service usage, and demographic data to identify high-risk customers with actionable risk scores.",
        keyFeatures: [
          "Exploratory data analysis of customer behavior patterns",
          "Feature engineering from service usage and billing data",
          "Multiple classification models with hyperparameter tuning",
          "Model serialization for production deployment",
          "Interpretable risk factors for business insights",
          "Automated retraining pipeline support"
        ],
        achievements: [
          "Achieved 92% recall on churn prediction",
          "Identified top 5 factors contributing to customer churn",
          "Enabled targeted retention reducing churn by 15%",
          "Production-ready model with serialization"
        ],
        techDetails: "The pipeline includes feature encoding for categorical variables, SMOTE for handling class imbalance, and model selection using cross-validation. Final model uses XGBoost with optimized hyperparameters."
      }
    },
    {
      id: "recommender-systems",
      title: "Movie Recommender System",
      description: "Content-based movie recommendation engine analyzing film attributes to suggest personalized viewing options.",
      technologies: ["Scikit-learn", "Pandas", "TF-IDF", "Cosine Similarity", "Python", "Jupyter"],
      image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=60",
      github: "https://github.com/AbhinavSarkarr/Recommender-Systems",
      category: "ml",
      caseStudy: {
        problemStatement: "With thousands of movies available on streaming platforms, users struggle to discover content matching their preferences. A personalized recommendation system can enhance user experience and engagement.",
        solution: "Developed a content-based filtering recommendation engine that analyzes movie attributes (genre, cast, director, plot keywords) to find similar films and generate personalized recommendations.",
        keyFeatures: [
          "Content-based filtering using movie metadata",
          "TF-IDF vectorization for text features",
          "Cosine similarity for movie matching",
          "Multi-feature fusion combining genres, cast, and plot",
          "Scalable architecture for large movie databases",
          "Interactive recommendation interface"
        ],
        achievements: [
          "Built recommendation engine covering 10K+ movies",
          "Achieved relevant recommendations in top-10 results",
          "Sub-second recommendation latency",
          "Extensible framework for additional features"
        ],
        techDetails: "Uses TF-IDF vectorization on combined text features (overview, genres, keywords, cast, crew) followed by cosine similarity computation. Implements efficient nearest neighbor search for scalability."
      }
    },
    {
      id: "delhi-air-quality",
      title: "Delhi Air Quality Predictor",
      description: "End-to-end ML pipeline predicting Delhi's air quality index using XGBoost and comprehensive feature engineering.",
      technologies: ["XGBoost", "Pandas", "Feature Store", "Scikit-learn", "Python", "Jupyter"],
      image: "https://images.unsplash.com/photo-1532635241-17e820acc59f?w=800&auto=format&fit=crop&q=60",
      github: "https://github.com/AbhinavSarkarr/Delhi-Air-Quality-Predictor-End-to-End",
      category: "ml",
      caseStudy: {
        problemStatement: "Delhi faces severe air pollution challenges affecting millions of residents. Accurate AQI predictions enable citizens and authorities to take preventive measures and plan activities accordingly.",
        solution: "Built an end-to-end ML pipeline for AQI prediction incorporating historical pollution data, meteorological features, and temporal patterns using XGBoost for robust forecasting.",
        keyFeatures: [
          "Comprehensive data collection from multiple pollution monitoring stations",
          "Feature store implementation for reproducible ML",
          "Temporal feature engineering (seasonality, trends)",
          "XGBoost model with hyperparameter optimization",
          "End-to-end pipeline from data ingestion to prediction",
          "Model versioning and experiment tracking"
        ],
        achievements: [
          "Achieved RMSE of 25 on AQI prediction",
          "Built feature store with 50+ engineered features",
          "Identified key pollution drivers through feature importance",
          "Production-ready pipeline with monitoring"
        ],
        techDetails: "The pipeline uses Pandas for data processing, implements a feature store pattern for feature reuse, and trains XGBoost with Bayesian hyperparameter optimization. Includes data validation and drift detection."
      }
    },
    {
      id: "ai-agents",
      title: "Autonomous AI Agents",
      description: "Framework for building autonomous agents capable of executing complex tasks without human intervention using Python.",
      technologies: ["Python", "LangChain", "OpenAI", "Tool Use", "Agent Architecture"],
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=60",
      github: "https://github.com/AbhinavSarkarr/AI-Agents",
      category: "genai",
      caseStudy: {
        problemStatement: "Many complex tasks require multiple steps, tool usage, and decision-making that traditionally need human oversight. Building agents that can autonomously plan and execute such tasks remains a significant challenge.",
        solution: "Developed a framework for creating autonomous agents that can reason about tasks, plan execution steps, use tools, and complete multi-step workflows without human intervention.",
        keyFeatures: [
          "Agent architecture with planning and execution loops",
          "Tool integration framework for extensibility",
          "Memory systems for context retention",
          "Error handling and recovery mechanisms",
          "Logging and observability for debugging",
          "Modular design for custom agent creation"
        ],
        achievements: [
          "Successfully automated multi-step research tasks",
          "Integrated with multiple external tools and APIs",
          "Reduced manual task completion time by 70%",
          "Created reusable agent components library"
        ],
        techDetails: "Built using Python with a custom agent loop implementation. Supports ReAct-style reasoning, tool calling with function definitions, and persistent memory using vector stores for context retrieval."
      }
    },
    {
      id: "model-distillation",
      title: "Ticket Support Model Distillation",
      description: "Knowledge distillation pipeline compressing large support models into efficient smaller models for production deployment.",
      technologies: ["PyTorch", "Transformers", "Knowledge Distillation", "BERT", "Python"],
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60",
      github: "https://github.com/AbhinavSarkarr/Model-Distillagtion-Ticket-Support",
      category: "llm",
      caseStudy: {
        problemStatement: "Large language models provide excellent support ticket classification and response generation but are too resource-intensive for real-time production deployment. A smaller, faster model is needed without sacrificing accuracy.",
        solution: "Implemented knowledge distillation to transfer capabilities from a large teacher model to a smaller student model, achieving production-suitable latency while maintaining classification accuracy.",
        keyFeatures: [
          "Teacher-student training framework",
          "Soft label distillation with temperature scaling",
          "Intermediate layer matching for better transfer",
          "Support ticket classification task adaptation",
          "Latency optimization for production serving",
          "Comprehensive evaluation metrics"
        ],
        achievements: [
          "Reduced model size by 6x with 95% accuracy retention",
          "Achieved 10x inference speedup",
          "Production-ready model under 100MB",
          "Maintained support ticket classification accuracy"
        ],
        techDetails: "Uses BERT-large as teacher and DistilBERT as student. Distillation loss combines KL divergence on soft labels with cross-entropy on hard labels. Temperature parameter tuned for optimal knowledge transfer."
      }
    },
    {
      id: "video-membership",
      title: "Video Membership Web App",
      description: "Full-stack web application for video content membership with authentication, payments, and content delivery.",
      technologies: ["Python", "FastAPI", "HTML", "Jupyter", "Authentication", "Payments"],
      image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=60",
      github: "https://github.com/AbhinavSarkarr/Video-Membership-Web-App",
      category: "fullstack",
      caseStudy: {
        problemStatement: "Content creators need platforms to monetize video content through memberships. Building a secure, scalable video membership platform requires handling authentication, payments, and content protection.",
        solution: "Developed a full-stack web application providing video content membership features including user authentication, subscription management, and secure video delivery.",
        keyFeatures: [
          "User authentication and authorization system",
          "Subscription tier management",
          "Secure video content delivery",
          "Payment integration for memberships",
          "Admin dashboard for content management",
          "Responsive design for all devices"
        ],
        achievements: [
          "Built complete membership platform from scratch",
          "Implemented secure video streaming pipeline",
          "Integrated payment processing",
          "Created admin tools for content management"
        ],
        techDetails: "Backend built with FastAPI, frontend using HTML/CSS/JS. Implements JWT-based authentication, role-based access control, and integrates with video hosting services for secure content delivery."
      }
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
      link: "https://cp.certmetrics.com/amazon/en/public/verify/credential/b14b5afb7bd44dfa9bb5caf44e160813"
    },
    {
      id: "cert2",
      title: "Databricks Certified Machine Learning Professional",
      issuer: "Databricks",
      date: "2024",
      link: "https://credentials.databricks.com/c8f3e6a5-1234-5678-9abc-def012345678"
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
