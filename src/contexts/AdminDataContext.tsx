
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
  description: string[];
  id: string;
};

type ProjectItem = {
  title: string;
  description: string;
  technologies: string[];
  image: string;
  github?: string;
  liveUrl?: string;
  id: string;
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
  id: string;
};

type SocialLinks = {
  github?: string;
  linkedin?: string;
  twitter?: string;
  huggingface?: string;
  resume?: string;
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
}

// Sample initial data that matches the main site display
const initialData: AdminData = {
  hero: {
    name: "Abhinav Sarkar",
    title: "AI/LLM Engineer",
    description: "Specialized in NLP, RAG pipelines, and LLM fine-tuning. Creating solutions that leverage the power of artificial intelligence to solve real-world problems.",
    image: "/lovable-uploads/0f976acc-d38b-4ac7-96a7-02ccc53846b5.png",
    resumeLink: "https://drive.google.com/file/d/1kvz-xyhbenuvSjtZr98EC8WMhYjv4pIc/view"
  },
  experiences: [
    {
      id: "exp1",
      title: "Artificial Intelligence Engineer",
      company: "Jellyfish Technologies Pvt. Ltd.",
      period: "Apr 2024 – Present",
      current: true,
      description: [
        "Built SaaS platform for custom RAG-based chatbot creation using Qdrant and Llama3-70B",
        "Developed system to cross-verify services in insurance documents",
        "Created automated complaint registration system using Whisper v3 + fine-tuned GPT-4"
      ]
    },
    {
      id: "exp2",
      title: "Deep Learning Intern",
      company: "Bhramaand Pvt. Ltd.",
      period: "Jun – Sep 2023",
      current: false,
      description: [
        "Designed zero-shot classification system with bart-large-mnli",
        "Built modules for real-time news story generation",
        "Developed financial forecasting models using XGBoost"
      ]
    }
  ],
  projects: [
    {
      id: "proj1",
      title: "AutoDraft",
      description: "Chrome extension that automates email replies using Tavily AI, Crew AI, and Llama3-8B",
      technologies: ["TypeScript", "Langchain", "Llama", "Tavily AI", "Chrome Extension API"],
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
      github: "#",
      liveUrl: "#"
    },
    {
      id: "proj2",
      title: "TextTweak",
      description: "Real-time text improvement tool using fine-tuned Google T5-base for grammar/spell check",
      technologies: ["Python", "PyTorch", "T5", "Transformers", "FastAPI"],
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
      github: "#",
      liveUrl: "#"
    },
    {
      id: "proj3",
      title: "RAG Pipeline Builder",
      description: "End-to-end system for creating custom retrieval augmented generation pipelines",
      technologies: ["Python", "Qdrant", "LangChain", "Llama", "React"],
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
      github: "#"
    },
    {
      id: "proj4",
      title: "Insurance Document Analyzer",
      description: "AI system that extracts and cross-verifies services in insurance documents",
      technologies: ["OCR", "NLP", "BERT", "FastAPI", "React"],
      image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1",
      github: "#"
    }
  ],
  skills: [
    {
      id: "skill1",
      name: "Languages",
      skills: ["Python", "JavaScript", "TypeScript", "SQL", "R", "C++"]
    },
    {
      id: "skill2",
      name: "ML/AI",
      skills: ["PyTorch", "TensorFlow", "Scikit-learn", "LangChain", "Transformers", "Hugging Face"]
    },
    {
      id: "skill3",
      name: "Web/Cloud",
      skills: ["React", "FastAPI", "AWS", "Azure", "Docker", "GCP"]
    }
  ],
  certifications: [
    {
      id: "cert1",
      title: "Deep Learning Specialization",
      issuer: "DeepLearning.AI",
      date: "Dec 2023",
      link: "#"
    },
    {
      id: "cert2",
      title: "AWS Machine Learning Specialty",
      issuer: "Amazon Web Services",
      date: "May 2024",
      link: "#"
    }
  ],
  publications: [
    {
      id: "pub1",
      title: "LLM Optimizations for Production Applications",
      publisher: "Medium",
      date: "Mar 2024",
      link: "#"
    },
    {
      id: "pub2",
      title: "Efficient RAG Pipelines With Hybrid Search",
      publisher: "Towards Data Science",
      date: "Jan 2024",
      link: "#"
    }
  ],
  social: {
    github: "https://github.com/abhinav",
    linkedin: "https://linkedin.com/in/abhinav",
    twitter: "https://twitter.com/abhinav",
    huggingface: "https://huggingface.co/abhinav",
    resume: "https://drive.google.com/file/d/1kvz-xyhbenuvSjtZr98EC8WMhYjv4pIc/view"
  }
};

// Generate unique ID helper function
const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Create the context
const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

// Helper function to ensure localStorage updates
const saveToLocalStorage = (data: AdminData) => {
  try {
    localStorage.setItem('adminData', JSON.stringify(data));
    console.log('Data saved to localStorage:', data);
  } catch (e) {
    console.error('Failed to save admin data to localStorage', e);
  }
};

// Provider component
export const AdminDataProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AdminData>(() => {
    // Try to load from localStorage first
    const savedData = localStorage.getItem('adminData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        console.log('Loaded data from localStorage:', parsed);
        return parsed;
      } catch (e) {
        console.error('Failed to parse saved admin data', e);
      }
    }
    return initialData;
  });
  const { toast } = useToast();

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (!isLoading) {
      saveToLocalStorage(data);
    }
    setIsLoading(false);
  }, [data, isLoading]);

  // Data modification functions for each section
  const updateHero = (heroData: Partial<HeroData>) => {
    setData(prev => {
      const updated = {
        ...prev,
        hero: {
          ...prev.hero,
          ...heroData
        }
      };
      saveToLocalStorage(updated);
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
      saveToLocalStorage(updated);
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
      saveToLocalStorage(updated);
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
      saveToLocalStorage(updated);
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
      saveToLocalStorage(updated);
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
      saveToLocalStorage(updated);
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
      saveToLocalStorage(updated);
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
      saveToLocalStorage(updated);
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
      saveToLocalStorage(updated);
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
      saveToLocalStorage(updated);
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
      saveToLocalStorage(updated);
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
      saveToLocalStorage(updated);
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
      saveToLocalStorage(updated);
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
      saveToLocalStorage(updated);
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
      saveToLocalStorage(updated);
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
      saveToLocalStorage(updated);
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
      saveToLocalStorage(updated);
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
        isLoading
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
