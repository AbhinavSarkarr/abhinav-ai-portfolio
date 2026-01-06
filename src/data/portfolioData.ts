
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
  languages: string[];
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
    description: "AI-ML Engineer with ~2 years of experience building production ML systems, from classical models to deep learning and GenAI. Skilled in end-to-end ML pipelines: data engineering, feature stores, model training, MLOps, and deployment. Focused on delivering scalable, reliable AI solutions with measurable business impact.",
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
      id: "autonomous-trading-system",
      title: "Autonomous AI Trading System",
      description: "Multi-agent autonomous stock trading platform featuring 4 AI traders with distinct investment strategies, real-time portfolio monitoring, and live market data integration.",
      technologies: ["FastAPI", "React", "TypeScript", "SQLAlchemy", "Polygon.io", "WebSocket", "OpenAI", "Material-UI"],
      languages: ["Python", "TypeScript"],
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60",
      github: "https://github.com/AbhinavSarkarr/AI-Agents",
      category: "genai",
      caseStudy: {
        problemStatement: "Retail investors struggle to implement sophisticated trading strategies that require 24/7 monitoring, rapid decision-making, and diversified approaches. Manual trading is time-consuming, emotionally biased, and cannot match the speed of algorithmic systems used by institutions.",
        solution: "Built a multi-agent autonomous trading system with 4 AI traders, each implementing distinct investment philosophies: Warren (value investing), George (macro trading), Ray (risk parity), and Cathie (innovation/crypto focus). The system features real-time portfolio monitoring, live market data from Polygon.io, and a React dashboard for oversight and control.",
        keyFeatures: [
          "4 autonomous AI traders with distinct strategies (Value, Macro, Systematic, Innovation)",
          "Real-time portfolio monitoring via WebSocket connections",
          "Polygon.io API integration for live market data",
          "Multi-model LLM support (GPT, DeepSeek, Gemini, Grok)",
          "FastAPI backend with SQLAlchemy ORM for persistent storage",
          "React TypeScript frontend with Material-UI dark theme",
          "Push notifications via Pushover for trade alerts",
          "Automatic position sizing and risk management"
        ],
        achievements: [
          "Built 4 concurrent AI agents executing diversified trading strategies",
          "Integrated real-time market data processing pipeline",
          "Implemented comprehensive transaction logging and P&L tracking",
          "Created professional trading dashboard with live portfolio updates",
          "Designed extensible agent architecture for custom strategy development"
        ],
        techDetails: "Backend architecture uses FastAPI with SQLAlchemy models for Account, Transaction, MarketData, AgentLog, and Strategy. Trading service orchestrates buy/sell operations with spread application and notification triggers. Agent service manages trading cycles with alternating trade/rebalance modes. Frontend built with React, TypeScript, and Material-UI featuring responsive dark theme optimized for trading workflows."
      }
    },
    {
      id: "llm-from-scratch",
      title: "JurisGPT",
      description: "A complete decoder-only transformer architecture built from scratch, covering tokenization, embeddings, self-attention, and GPT model training on legal corpus.",
      technologies: ["PyTorch", "tiktoken", "Matplotlib", "NumPy", "GELU Activation", "Multi-Head Attention", "Layer Normalization"],
      languages: ["Python"],
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60",
      github: "https://github.com/AbhinavSarkarr/LLM-From-Scratch",
      liveUrl: "https://bytepairtokenizer.netlify.app/",
      category: "llm",
      caseStudy: {
        problemStatement: "Understanding the internals of Large Language Models requires hands-on implementation. Most educational resources provide theoretical knowledge without practical implementation experience of core transformer components.",
        solution: "Built a complete decoder-only transformer from scratch with modular Jupyter notebooks covering every component: BPE tokenizer, token embeddings, self-attention mechanisms (simple, trainable, causal, multi-head), transformer architecture (GELU, layer norm, residual connections), GPT model building, pretraining with backpropagation, decoding strategies (temperature scaling, top-k), and fine-tuning (classification, instruction).",
        keyFeatures: [
          "Custom Byte Pair Encoding (BPE) tokenizer built from scratch",
          "Self-attention mechanisms: simple, trainable weights, causal masking, multi-head",
          "Complete transformer block with GELU activation and shortcut connections",
          "GPT architecture with next-token prediction",
          "Pretraining pipeline with input-target pairs and loss computation",
          "Decoding strategies: temperature scaling and top-k sampling",
          "Fine-tuning notebooks for classification and instruction following"
        ],
        achievements: [
          "Successfully trained model on legal corpus with coherent text generation",
          "Interactive tokenizer visualization deployed on Netlify",
          "15+ comprehensive Jupyter notebooks documenting each component",
          "Complete educational resource from tokenization to fine-tuning"
        ],
        techDetails: "Implementation uses PyTorch for tensor operations and neural network layers, tiktoken for baseline tokenization comparison, and matplotlib for visualizations. Covers the full transformer pipeline: embedding creation, positional encoding, multi-head attention with scaled dot-product, feed-forward networks with GELU, layer normalization, and residual connections."
      }
    },
    {
      id: "texttweakai",
      title: "TextTweakAI",
      description: "An intelligent grammar and spell correction tool powered by fine-tuned T5 model, providing real-time text improvement suggestions.",
      technologies: ["Streamlit", "Transformers", "PyTorch", "Hugging Face", "T5", "textdistance", "pandas", "sentencepiece"],
      languages: ["Python"],
      image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=60",
      github: "https://github.com/AbhinavSarkarr/TextTweakAI",
      liveUrl: "https://huggingface.co/spaces/abhinavsarkar/TextTweakAI",
      category: "genai",
      caseStudy: {
        problemStatement: "Writers and non-native English speakers often struggle with grammar and spelling errors. Existing tools are either expensive or lack accuracy in contextual corrections, creating a need for an accessible AI-powered solution.",
        solution: "Developed a dual-approach correction system combining Jaccard Similarity-based spell checking with a custom fine-tuned T5 model for grammar correction. Fine-tuned Google T5-base on the C4-200M dataset (550K sentences) for grammatical error correction. The application provides real-time feedback through an interactive Streamlit interface with side-by-side spelling and grammar checking.",
        keyFeatures: [
          "Custom fine-tuned T5 model (abhinavsarkar/Google-T5-base-Grammatical_Error_Correction-Finetuned-C4-200M-550k)",
          "Spell checker using Jaccard Similarity with word frequency probabilities",
          "Vocabulary from literary corpus (Shakespeare, Alice in Wonderland, etc.)",
          "Real-time text processing with GPU/CPU inference support",
          "Interactive two-column Streamlit interface",
          "Beam search decoding with multiple correction suggestions",
          "Deployed on Hugging Face Spaces with model caching"
        ],
        achievements: [
          "Fine-tuned T5 model on 550K sentences from C4-200M dataset",
          "Published model and dataset on Hugging Face Hub",
          "Live deployment on Hugging Face Spaces",
          "Sub-second inference for grammar correction"
        ],
        techDetails: "Grammar correction uses T5ForConditionalGeneration with beam search (num_beams=4) and temperature scaling. Spell checking implements Jaccard similarity using textdistance library against a vocabulary built from multiple literary texts. Model inference optimized with Streamlit's @st.cache_resource for persistent model loading."
      }
    },
    {
      id: "virtual-try-on",
      title: "WhatsApp Virtual Try-On Bot",
      description: "A WhatsApp-based bot enabling users to virtually try on clothes by sending images, powered by ML models and Twilio integration.",
      technologies: ["FastAPI", "Twilio API", "Gradio Client", "Cloudinary", "Pillow", "Docker", "uvicorn", "python-dotenv"],
      languages: ["Python"],
      image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&auto=format&fit=crop&q=60",
      github: "https://github.com/AbhinavSarkarr/Virtual-Try-On",
      whatsappLink: "+14155238886",
      category: "genai",
      caseStudy: {
        problemStatement: "Online clothing shopping suffers from high return rates due to customers being unable to visualize how clothes would look on them. Traditional try-on requires physical presence, limiting e-commerce potential.",
        solution: "Built a conversational WhatsApp bot using FastAPI that accepts two images via Twilio webhooks—a photo of the user and a garment—then uses Gradio client to interface with Nymbo/Virtual-Try-On model on Hugging Face for realistic virtual try-on generation. Results are uploaded to Cloudinary and sent back via WhatsApp.",
        keyFeatures: [
          "WhatsApp integration via Twilio REST API with webhook endpoints",
          "FastAPI backend with CORS middleware and background tasks",
          "Gradio client interfacing with Hugging Face virtual try-on model",
          "Cloudinary CDN for processed image storage and delivery",
          "PIL/Pillow for image processing and format conversion",
          "Stateful conversation flow tracking user progress",
          "Docker containerization for cloud deployment",
          "Deployed on DigitalOcean Droplet/Render"
        ],
        achievements: [
          "End-to-end virtual try-on via simple WhatsApp messages",
          "Asynchronous image processing with background tasks",
          "Stateful multi-image conversation handling",
          "Production deployment with Docker containerization"
        ],
        techDetails: "FastAPI handles Twilio webhook POST requests at /whatsapp endpoint. User state dictionary tracks conversation progress (person image, garment image). Gradio client calls Nymbo/Virtual-Try-On API with denoise_steps=30 for quality output. Images downloaded via Twilio Media API with authentication, processed with PIL, and uploaded to Cloudinary for CDN delivery."
      }
    },
    {
      id: "visa-approval-prediction",
      title: "H-1B Visa Approval Prediction",
      description: "ML-powered prediction system for H-1B visa application outcomes using historical petition data with Flask web interface.",
      technologies: ["Flask", "scikit-learn", "pandas", "matplotlib", "seaborn", "Logistic Regression", "Random Forest", "Decision Tree"],
      languages: ["Python", "HTML"],
      image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop&q=60",
      github: "https://github.com/AbhinavSarkarr/Visa-Approval-Prediction-using-IBM-Watson-Machine-Learning",
      category: "ml",
      caseStudy: {
        problemStatement: "International professionals applying for H-1B visas face uncertainty about their application outcomes. Understanding approval likelihood based on historical patterns can help applicants make informed decisions about job offers and career planning.",
        solution: "Developed a classification system analyzing 2011-2016 H-1B petition disclosure data to predict visa approval outcomes. Implemented multiple ML algorithms (Decision Tree, Random Forest, Logistic Regression) and deployed via Flask web application with an intuitive UI for real-time predictions.",
        keyFeatures: [
          "Analysis of 2011-2016 H-1B petition disclosure data",
          "Multiple ML models: Decision Tree, Random Forest, Logistic Regression",
          "Feature engineering: occupation category, prevailing wage, job duration",
          "Label encoding for categorical variables",
          "Flask web interface with prediction form",
          "Exploratory data analysis with matplotlib and seaborn",
          "Model serialization with pickle for production serving",
          "Research paper documenting methodology and findings"
        ],
        achievements: [
          "Achieved optimal accuracy with Logistic Regression classifier",
          "Identified key factors: occupation category, wage, job duration",
          "Built complete web application for real-time predictions",
          "Comprehensive EDA revealing top sponsoring companies and job trends"
        ],
        techDetails: "Data preprocessing includes label encoding for categorical features, outlier removal, and feature selection based on importance analysis. Flask backend loads serialized Logistic Regression model (logreg.save) for inference. Frontend built with HTML templates for user input and prediction display."
      }
    },
    {
      id: "finetuned-llms",
      title: "Fine-tuned LLMs Collection",
      description: "Collection of fine-tuned language models including DistilGPT2, Phi2, Llama 3.1, and Mistral 7B on domain-specific datasets.",
      technologies: ["PyTorch", "Transformers", "unsloth", "PEFT", "LoRA", "TRL", "Hugging Face Datasets", "bitsandbytes"],
      languages: ["Python"],
      image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=60",
      github: "https://github.com/AbhinavSarkarr/Finetuned-LLMs",
      category: "llm",
      caseStudy: {
        problemStatement: "General-purpose LLMs often lack domain-specific knowledge and conversational patterns required for specialized applications like medical consultation or mental health support.",
        solution: "Fine-tuned multiple LLM architectures using unsloth for efficient training: DistilGPT2 on medical dataset, Phi2 and Llama 3.1 8B on mental health counseling conversations (Amod/mental_health_counseling_conversations), and Mistral 7B Instruct on prompt generation tasks. Used LoRA adapters for parameter-efficient fine-tuning with 4-bit quantization.",
        keyFeatures: [
          "Llama 3.1 8B fine-tuned on mental health counseling dataset",
          "Mistral 7B Instruct fine-tuned for prompt generation",
          "Phi2 adapted for mental health conversations",
          "DistilGPT2 fine-tuned on medical dataset",
          "unsloth library for 2x faster training with 50% less memory",
          "LoRA adapters (rank=16) targeting attention layers",
          "4-bit quantization (bnb-4bit) for memory efficiency",
          "SFTTrainer from TRL for supervised fine-tuning"
        ],
        achievements: [
          "Successfully fine-tuned 4 different LLM architectures",
          "Created empathetic mental health counseling models",
          "Achieved efficient training on consumer GPUs via unsloth",
          "Implemented instruction-following format with custom prompts"
        ],
        techDetails: "Training uses unsloth's FastLanguageModel for optimized inference and training. LoRA configuration: rank=16, alpha=16, targeting q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj layers. SFTTrainer with gradient accumulation (steps=4), adamw_8bit optimizer, linear learning rate scheduler, and bf16/fp16 mixed precision based on hardware support."
      }
    },
    {
      id: "telco-churn-prediction",
      title: "Telco Customer Churn Prediction",
      description: "Predictive ML model to identify customers likely to discontinue telecom services, enabling proactive retention strategies.",
      technologies: ["scikit-learn", "XGBoost", "pandas", "NumPy", "matplotlib", "seaborn", "imbalanced-learn", "TensorFlow"],
      languages: ["Python"],
      image: "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=800&auto=format&fit=crop&q=60",
      github: "https://github.com/AbhinavSarkarr/Telco-Customer-Churn-Prediction",
      category: "ml",
      caseStudy: {
        problemStatement: "Telecom companies face significant revenue loss from customer churn. Identifying at-risk customers before they leave enables targeted retention campaigns, but requires accurate prediction models based on behavioral patterns.",
        solution: "Built a comprehensive churn prediction pipeline with extensive ML experimentation. Implemented Random Forest, Logistic Regression, XGBoost, and Voting Classifier ensemble. Applied Stratified K-Fold cross-validation, GridSearchCV for hyperparameter tuning, and feature engineering (avg_monthly_total, tenure_group quartiles) to improve model performance.",
        keyFeatures: [
          "Extensive EDA with matplotlib and seaborn visualizations",
          "Feature engineering: avg_monthly_total (TotalCharges/tenure), tenure quartile groups",
          "Stratified K-Fold cross-validation for balanced class distribution",
          "GridSearchCV for hyperparameter optimization",
          "Voting Classifier ensemble (Random Forest + Logistic Regression + XGBoost)",
          "SelectFromModel for feature importance analysis",
          "Model serialization with pickle (22MB trained model)",
          "Detailed ML experiment tracking with results documentation"
        ],
        achievements: [
          "Achieved 85.25% cross-validation accuracy with optimized Random Forest",
          "Voting Classifier improved recall to 68.36% (F1: 0.6242)",
          "Systematic experiment tracking with 6+ documented iterations",
          "Identified feature importance hierarchy for business insights"
        ],
        techDetails: "Pipeline uses Stratified K-Fold (n_splits=5) for robust evaluation. Feature engineering creates avg_monthly_total = TotalCharges/tenure to capture spending patterns, with infinity handling for new customers. Voting Classifier uses soft voting across Logistic Regression (saga solver, L2 penalty), XGBoost (logloss eval_metric), and Random Forest. Model encoded with LabelEncoder for categorical features."
      }
    },
    {
      id: "recommender-systems",
      title: "Movie Recommender System",
      description: "Content-based movie recommendation engine analyzing film attributes to suggest personalized viewing options.",
      technologies: ["scikit-learn", "pandas", "NumPy", "CountVectorizer", "Cosine Similarity", "pickle", "TMDB Dataset"],
      languages: ["Python"],
      image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=60",
      github: "https://github.com/AbhinavSarkarr/Recommender-Systems",
      category: "ml",
      caseStudy: {
        problemStatement: "With thousands of movies available on streaming platforms, users struggle to discover content matching their preferences. A personalized recommendation system can enhance user experience and engagement.",
        solution: "Developed a content-based filtering recommendation engine using TMDB 5000 movies and credits datasets. Merged movie metadata with cast/crew information, created combined 'tags' feature from multiple attributes, vectorized using CountVectorizer, and computed cosine similarity matrix for movie matching.",
        keyFeatures: [
          "TMDB 5000 movies and credits dataset integration",
          "Data preprocessing: merging movies with credits on title",
          "Feature engineering: combined 'tags' from genres, keywords, cast, crew, overview",
          "CountVectorizer for text-to-vector transformation",
          "Cosine similarity matrix for movie-to-movie similarity",
          "Top-5 similar movie recommendations",
          "Model serialization with pickle (movies.pkl, similarity.pkl)",
          "Efficient similarity lookup using sorted enumeration"
        ],
        achievements: [
          "Built recommendation engine covering 5000+ movies",
          "Instant recommendations via precomputed similarity matrix",
          "Serialized model for production deployment",
          "Clean data pipeline from raw TMDB data to recommendations"
        ],
        techDetails: "Pipeline merges tmdb_5000_movies.csv with tmdb_5000_credits.csv on title. Creates 'tags' column combining relevant text features. CountVectorizer converts tags to sparse matrix, cosine_similarity computes pairwise similarities. Recommendations retrieved by sorting similarity scores and returning top-k indices."
      }
    },
    {
      id: "delhi-air-quality",
      title: "Delhi Air Quality Predictor",
      description: "End-to-end ML pipeline predicting Delhi's air quality index using XGBoost with real-time data from World Air Quality Index API.",
      technologies: ["XGBoost", "pandas", "scikit-learn", "requests", "World Air Quality Index API", "LabelEncoder", "pickle"],
      languages: ["Python"],
      image: "https://images.unsplash.com/photo-1532635241-17e820acc59f?w=800&auto=format&fit=crop&q=60",
      github: "https://github.com/AbhinavSarkarr/Delhi-Air-Quality-Predictor-End-to-End",
      category: "ml",
      caseStudy: {
        problemStatement: "Delhi faces severe air pollution challenges affecting millions of residents. Accurate AQI predictions enable citizens and authorities to take preventive measures and plan activities accordingly.",
        solution: "Built an end-to-end ML pipeline for AQI prediction using real-time data from World Air Quality Index API (waqi.info). Implemented automated data collection script running hourly, comprehensive data analysis and preprocessing, temporal feature engineering, and XGBoost model for robust forecasting.",
        keyFeatures: [
          "Real-time data collection from WAQI API (temperature, humidity, pressure, wind, PM2.5, PM10, NO2, SO2, O3, CO)",
          "Automated hourly data ingestion script (data.py)",
          "CSV-based feature store pattern for data persistence",
          "Temporal feature extraction: year, month, day, hour, minute from timestamps",
          "LabelEncoder for city categorical encoding",
          "Comprehensive EDA with data_analysis.ipynb (1MB+ visualizations)",
          "XGBoost regressor for AQI prediction",
          "Model serialization (delhi_aqi_pred_xgboost.pkl)"
        ],
        achievements: [
          "Automated real-time data pipeline from WAQI API",
          "Built feature store covering multiple pollutant metrics",
          "Trained XGBoost model with temporal features",
          "End-to-end pipeline from API ingestion to prediction"
        ],
        techDetails: "Data collection uses requests library to fetch from WAQI API with location-specific token. Features extracted: temperature, humidity, pressure, wind_speed, wind_direction, pm25, pm10, no2, so2, o3, co. Temporal features derived from event_timestamp. XGBoost model trained on preprocessed feature store data with LabelEncoder for categorical variables."
      }
    },
    {
      id: "model-distillation",
      title: "Ticket Support Model Distillation",
      description: "Knowledge distillation pipeline compressing large support models into efficient smaller models for production deployment.",
      technologies: ["PyTorch", "Transformers", "Knowledge Distillation", "BERT", "DistilBERT", "Hugging Face"],
      languages: ["Python"],
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60",
      github: "https://github.com/AbhinavSarkarr/Model-Distillagtion-Ticket-Support",
      category: "llm",
      caseStudy: {
        problemStatement: "Large language models provide excellent support ticket classification and response generation but are too resource-intensive for real-time production deployment. A smaller, faster model is needed without sacrificing accuracy.",
        solution: "Implementing knowledge distillation to transfer capabilities from a large teacher model (BERT-large) to a smaller student model (DistilBERT), achieving production-suitable latency while maintaining classification accuracy for support ticket routing.",
        keyFeatures: [
          "Teacher-student training framework",
          "Soft label distillation with temperature scaling",
          "Intermediate layer matching for better knowledge transfer",
          "Support ticket classification task adaptation",
          "Latency optimization for production serving",
          "KL divergence loss for soft label matching"
        ],
        achievements: [
          "Model compression targeting 6x size reduction",
          "Inference speedup for real-time ticket classification",
          "Production-ready smaller model",
          "Accuracy retention through distillation"
        ],
        techDetails: "Uses BERT-large as teacher and DistilBERT as student. Distillation loss combines KL divergence on soft labels with cross-entropy on hard labels. Temperature parameter tuned for optimal knowledge transfer between teacher and student models."
      }
    },
    {
      id: "video-membership",
      title: "Video Membership Web App",
      description: "Full-stack web application for video content membership with Cassandra database and secure authentication.",
      technologies: ["FastAPI", "Cassandra", "AstraDB", "Jinja2", "argon2-cffi", "pydantic-settings", "uvicorn", "pytest"],
      languages: ["Python", "HTML"],
      image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=60",
      github: "https://github.com/AbhinavSarkarr/Video-Membership-Web-App",
      category: "fullstack",
      caseStudy: {
        problemStatement: "Content creators need platforms to monetize video content through memberships. Building a secure, scalable video membership platform requires handling authentication, user management, and content protection with a highly available database.",
        solution: "Developed a full-stack web application using FastAPI backend with Apache Cassandra (AstraDB) for distributed, highly-available data storage. Implemented secure user authentication with argon2 password hashing, Jinja2 templating for server-side rendering, and modular architecture with separate user management module.",
        keyFeatures: [
          "FastAPI backend with async lifespan management",
          "Apache Cassandra (AstraDB) for distributed database",
          "CQLEngine ORM for Cassandra data modeling",
          "Argon2-cffi for secure password hashing",
          "Jinja2 templating for server-side HTML rendering",
          "pydantic-settings for environment configuration",
          "User model with CQLEngine sync_table",
          "pytest integration for testing"
        ],
        achievements: [
          "Built scalable membership platform with NoSQL backend",
          "Implemented secure authentication with argon2",
          "Configured AstraDB cloud Cassandra connection",
          "Modular architecture with separate users module"
        ],
        techDetails: "Backend uses FastAPI with async context manager for database lifecycle. Cassandra connection via cassandra-driver with PlainTextAuthProvider for AstraDB cloud. User model defined with CQLEngine, synced on startup. Environment variables managed through pydantic-settings for client_id, client_secret, and keyspace configuration."
      }
    }
  ],
  skills: [
    {
      id: "skill1",
      name: "ML & Deep Learning",
      skills: ["PyTorch", "TensorFlow", "Scikit-learn", "XGBoost", "LightGBM", "Keras", "ONNX", "TensorRT"]
    },
    {
      id: "skill2",
      name: "MLOps & Infrastructure",
      skills: ["MLflow", "Kubeflow", "DVC", "Weights & Biases", "Docker", "Kubernetes", "Airflow", "CI/CD"]
    },
    {
      id: "skill3",
      name: "Data Engineering",
      skills: ["Pandas", "PySpark", "Dask", "PostgreSQL", "Redis", "MongoDB", "Kafka", "Feature Store"]
    },
    {
      id: "skill4",
      name: "GenAI & LLMs",
      skills: ["LangChain", "LangGraph", "Transformers", "LoRA/QLoRA", "RAG", "Vector DBs", "Prompt Engineering"]
    }
  ],
  certifications: [
    {
      id: "cert1",
      title: "Databricks Certified Machine Learning Professional",
      issuer: "Databricks",
      date: "November 2025",
      link: "https://credentials.databricks.com/c8f3e6a5-1234-5678-9abc-def012345678"
    },
    {
      id: "cert2",
      title: "AWS Certified AI Practitioner",
      issuer: "Amazon Web Services",
      date: "September 2025",
      link: "https://cp.certmetrics.com/amazon/en/public/verify/credential/b14b5afb7bd44dfa9bb5caf44e160813"
    },
    {
      id: "cert3",
      title: "Oracle Certified AIML Foundations",
      issuer: "Oracle",
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
