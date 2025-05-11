import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";

// Define types for different section data
type HeroData = {
  name?: string;
  title?: string;
  description?: string;
  image?: string;
  resumeLink?: string;
};

type ExperienceItem = {
  title: string;
  company: string;
  period: string;
  current: boolean;
  description: string[] | string;
  id: string;
  certificateLink?: string;
};

type ProjectItem = {
  title: string;
  description: string;
  technologies: string[];
  image: string;
  github?: string;
  liveUrl?: string;
  id: string;
  whatsappLink?: string;
};

type SkillCategory = {
  name: string;
  skills: string[];
  id: string;
};

type CertificationItem = {
  title: string;
  issuer: string;
  date: string;
  link?: string;
  id: string;
};

type PublicationItem = {
  title: string;
  publisher: string;
  date: string;
  link: string;
  description?: string;
  id: string;
};

type SocialLinks = {
  github?: string;
  linkedin?: string;
  twitter?: string;
  huggingface?: string;
  resume?: string;
  portfolio?: string;
};

// Define overall admin data structure
type AdminData = {
  hero: HeroData;
  experiences: ExperienceItem[];
  projects: ProjectItem[];
  skills: SkillCategory[];
  certifications: CertificationItem[];
  publications: PublicationItem[];
  social: SocialLinks;
};

// Define context type
interface AdminDataContextType {
  data: AdminData;
  updateHero: (data: Partial<HeroData>) => void;
  addExperience: (item: Omit<ExperienceItem, 'id'>) => void;
  updateExperience: (id: string, item: Partial<ExperienceItem>) => void;
  deleteExperience: (id: string) => void;
  addProject: (item: Omit<ProjectItem, 'id'>) => void;
  updateProject: (id: string, item: Partial<ProjectItem>) => void;
  deleteProject: (id: string) => void;
  addSkillCategory: (category: Omit<SkillCategory, 'id'>) => void;
  updateSkillCategory: (id: string, category: Partial<SkillCategory>) => void;
  deleteSkillCategory: (id: string) => void;
  addCertification: (item: Omit<CertificationItem, 'id'>) => void;
  updateCertification: (id: string, item: Partial<CertificationItem>) => void;
  deleteCertification: (id: string) => void;
  addPublication: (item: Omit<PublicationItem, 'id'>) => void;
  updatePublication: (id: string, item: Partial<PublicationItem>) => void;
  deletePublication: (id: string) => void;
  updateSocial: (links: Partial<SocialLinks>) => void;
  isLoading: boolean;
  saveToServer: () => void;
}

// Sample initial data that matches the main site display
const initialData: AdminData = {
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
      image: "https://images.unsplash.com/photo-1589994965-fcf48d80b0fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
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
      image: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
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

// Generate unique ID helper function
const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Create the context
const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

// Helper function to ensure data is saved
const saveToLocalStorage = (data: AdminData) => {
  try {
    localStorage.setItem('adminData', JSON.stringify(data));
    console.log('Data saved to localStorage:', data);
  } catch (e) {
    console.error('Failed to save admin data to localStorage', e);
  }
};

// Simulated function to "save to server" - in a real app this would be an API call
const simulateServerSave = async (data: AdminData) => {
  console.log('Simulating saving data to server:', data);
  try {
    // In a real application, this would be an actual API call
    // For now we're just using localStorage as our "server"
    localStorage.setItem('deployedAdminData', JSON.stringify(data));
    localStorage.setItem('adminData', JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Error saving to "server":', e);
    return false;
  }
};

// Provider component
export const AdminDataProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AdminData>(initialData);
  const { toast } = useToast();
  
  // Initialize data from localStorage if available
  useEffect(() => {
    try {
      // First try to load from "deployed" data (representing server data)
      const deployedData = localStorage.getItem('deployedAdminData');
      if (deployedData) {
        const parsed = JSON.parse(deployedData);
        console.log('Loaded data from "deployed" storage:', parsed);
        setData(parsed);
      } 
      // Then try local admin data (representing draft changes)
      else {
        const savedData = localStorage.getItem('adminData');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          console.log('Loaded data from localStorage:', parsed);
          setData(parsed);
        } else {
          console.log('No data in localStorage, using initialData');
          saveToLocalStorage(initialData);
          // Also "deploy" the initial data
          localStorage.setItem('deployedAdminData', JSON.stringify(initialData));
        }
      }
    } catch (e) {
      console.error('Failed to load saved admin data', e);
      saveToLocalStorage(initialData);
      // Also "deploy" the initial data
      localStorage.setItem('deployedAdminData', JSON.stringify(initialData));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (!isLoading) {
      saveToLocalStorage(data);
      console.log("Data updated and saved to localStorage (draft)");
    }
  }, [data, isLoading]);

  // Function to "deploy" changes (simulate saving to server)
  const saveToServer = async () => {
    toast({ title: "Deploying changes...", description: "Please wait..." });
    try {
      const success = await simulateServerSave(data);
      if (success) {
        toast({ 
          title: "Changes deployed successfully", 
          description: "All users will now see your updates" 
        });
      } else {
        toast({ 
          title: "Deployment failed", 
          description: "Please try again later", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      toast({ 
        title: "Deployment error", 
        description: "An unexpected error occurred", 
        variant: "destructive" 
      });
      console.error("Error during deployment:", error);
    }
  };

  // Data modification functions for each section
  const updateHero = (heroData: Partial<HeroData>) => {
    console.log("Updating hero with:", heroData);
    setData(prev => {
      const updated = {
        ...prev,
        hero: {
          ...prev.hero,
          ...heroData
        }
      };
      return updated;
    });
    toast({ title: "Hero section updated", description: "Changes saved successfully" });
  };

  const addExperience = (item: Omit<ExperienceItem, 'id'>) => {
    const newItem = { ...item, id: generateId() };
    setData(prev => {
      const updated = {
        ...prev,
        experiences: [...prev.experiences, newItem]
      };
      return updated;
    });
    toast({ title: "Experience added", description: "New experience added successfully" });
  };

  const updateExperience = (id: string, item: Partial<ExperienceItem>) => {
    setData(prev => {
      const updated = {
        ...prev,
        experiences: prev.experiences.map(exp => 
          exp.id === id ? { ...exp, ...item } : exp
        )
      };
      return updated;
    });
    toast({ title: "Experience updated", description: "Changes saved successfully" });
  };

  const deleteExperience = (id: string) => {
    setData(prev => {
      const updated = {
        ...prev,
        experiences: prev.experiences.filter(exp => exp.id !== id)
      };
      return updated;
    });
    toast({ title: "Experience deleted", description: "Item removed successfully" });
  };

  // Project functions
  const addProject = (item: Omit<ProjectItem, 'id'>) => {
    const newItem = { ...item, id: generateId() };
    console.log("Adding new project:", newItem);
    setData(prev => {
      const updated = {
        ...prev,
        projects: [...prev.projects, newItem]
      };
      return updated;
    });
    toast({ title: "Project added", description: "New project added successfully" });
  };

  const updateProject = (id: string, item: Partial<ProjectItem>) => {
    console.log("Updating project with ID:", id, "New data:", item);
    setData(prev => {
      const updated = {
        ...prev,
        projects: prev.projects.map(proj => 
          proj.id === id ? { ...proj, ...item } : proj
        )
      };
      return updated;
    });
    toast({ title: "Project updated", description: "Changes saved successfully" });
  };

  const deleteProject = (id: string) => {
    console.log("Deleting project with ID:", id);
    setData(prev => {
      const updated = {
        ...prev,
        projects: prev.projects.filter(proj => proj.id !== id)
      };
      return updated;
    });
    toast({ title: "Project deleted", description: "Item removed successfully" });
  };

  // Skill functions
  const addSkillCategory = (category: Omit<SkillCategory, 'id'>) => {
    const newCategory = { ...category, id: generateId() };
    setData(prev => {
      const updated = {
        ...prev,
        skills: [...prev.skills, newCategory]
      };
      return updated;
    });
    toast({ title: "Skill category added", description: "New category added successfully" });
  };

  const updateSkillCategory = (id: string, category: Partial<SkillCategory>) => {
    setData(prev => {
      const updated = {
        ...prev,
        skills: prev.skills.map(cat => 
          cat.id === id ? { ...cat, ...category } : cat
        )
      };
      return updated;
    });
    toast({ title: "Skills updated", description: "Changes saved successfully" });
  };

  const deleteSkillCategory = (id: string) => {
    setData(prev => {
      const updated = {
        ...prev,
        skills: prev.skills.filter(cat => cat.id !== id)
      };
      return updated;
    });
    toast({ title: "Skill category deleted", description: "Category removed successfully" });
  };

  // Certification functions
  const addCertification = (item: Omit<CertificationItem, 'id'>) => {
    const newItem = { ...item, id: generateId() };
    setData(prev => {
      const updated = {
        ...prev,
        certifications: [...prev.certifications, newItem]
      };
      return updated;
    });
    toast({ title: "Certification added", description: "New certification added successfully" });
  };

  const updateCertification = (id: string, item: Partial<CertificationItem>) => {
    setData(prev => {
      const updated = {
        ...prev,
        certifications: prev.certifications.map(cert => 
          cert.id === id ? { ...cert, ...item } : cert
        )
      };
      return updated;
    });
    toast({ title: "Certification updated", description: "Changes saved successfully" });
  };

  const deleteCertification = (id: string) => {
    setData(prev => {
      const updated = {
        ...prev,
        certifications: prev.certifications.filter(cert => cert.id !== id)
      };
      return updated;
    });
    toast({ title: "Certification deleted", description: "Item removed successfully" });
  };

  // Publication functions
  const addPublication = (item: Omit<PublicationItem, 'id'>) => {
    const newItem = { ...item, id: generateId() };
    setData(prev => {
      const updated = {
        ...prev,
        publications: [...prev.publications, newItem]
      };
      return updated;
    });
    toast({ title: "Publication added", description: "New publication added successfully" });
  };

  const updatePublication = (id: string, item: Partial<PublicationItem>) => {
    setData(prev => {
      const updated = {
        ...prev,
        publications: prev.publications.map(pub => 
          pub.id === id ? { ...pub, ...item } : pub
        )
      };
      return updated;
    });
    toast({ title: "Publication updated", description: "Changes saved successfully" });
  };

  const deletePublication = (id: string) => {
    setData(prev => {
      const updated = {
        ...prev,
        publications: prev.publications.filter(pub => pub.id !== id)
      };
      return updated;
    });
    toast({ title: "Publication deleted", description: "Item removed successfully" });
  };

  // Social links function
  const updateSocial = (links: Partial<SocialLinks>) => {
    setData(prev => {
      const updated = {
        ...prev,
        social: {
          ...prev.social,
          ...links
        }
      };
      return updated;
    });
    toast({ title: "Social links updated", description: "Changes saved successfully" });
  };

  return (
    <AdminDataContext.Provider
      value={{
        data,
        updateHero,
        addExperience,
        updateExperience,
        deleteExperience,
        addProject,
        updateProject,
        deleteProject,
        addSkillCategory,
        updateSkillCategory,
        deleteSkillCategory,
        addCertification,
        updateCertification,
        deleteCertification,
        addPublication,
        updatePublication, 
        deletePublication,
        updateSocial,
        isLoading,
        saveToServer
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
};

// Custom hook for using the context
export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (context === undefined) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
};
