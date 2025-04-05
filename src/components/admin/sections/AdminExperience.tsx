
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Experience {
  id: number;
  role: string;
  company: string;
  duration: string;
  description: string;
  isActive: boolean;
}

export function AdminExperience() {
  const { toast } = useToast();
  
  const [experiences, setExperiences] = useState<Experience[]>([
    {
      id: 1,
      role: "Artificial Intelligence Engineer",
      company: "Jellyfish Technologies Pvt. Ltd.",
      duration: "Apr 2024 – Present",
      description: "Built SaaS platform for custom RAG-based chatbot creation using Qdrant and Llama3-70B. Developed system to cross-verify services in insurance documents. Created automated complaint registration system using Whisper v3 + fine-tuned GPT-4.",
      isActive: true
    },
    {
      id: 2,
      role: "Deep Learning Intern",
      company: "Bhramaand Pvt. Ltd.",
      duration: "Jun – Sep 2023",
      description: "Designed zero-shot classification system with bart-large-mnli. Built modules for real-time news story generation. Developed financial forecasting models using XGBoost.",
      isActive: false
    }
  ]);
  
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [formData, setFormData] = useState<Experience>({
    id: 0,
    role: "",
    company: "",
    duration: "",
    description: "",
    isActive: false
  });
  
  const [isSaving, setIsSaving] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleAdd = () => {
    setFormData({
      id: 0,
      role: "",
      company: "",
      duration: "",
      description: "",
      isActive: false
    });
    setIsEditing(0);
  };
  
  const handleEdit = (experience: Experience) => {
    setFormData(experience);
    setIsEditing(experience.id);
  };
  
  const handleDelete = (id: number) => {
    setExperiences(prev => prev.filter(exp => exp.id !== id));
    toast({
      title: "Deleted",
      description: "Experience entry has been removed."
    });
  };
  
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updatedExperiences = [...experiences];
    [updatedExperiences[index], updatedExperiences[index - 1]] = 
      [updatedExperiences[index - 1], updatedExperiences[index]];
    setExperiences(updatedExperiences);
  };
  
  const handleMoveDown = (index: number) => {
    if (index === experiences.length - 1) return;
    const updatedExperiences = [...experiences];
    [updatedExperiences[index], updatedExperiences[index + 1]] = 
      [updatedExperiences[index + 1], updatedExperiences[index]];
    setExperiences(updatedExperiences);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    setTimeout(() => {
      if (isEditing === 0) {
        // Add new experience
        const newExperience = {
          ...formData,
          id: Date.now()
        };
        setExperiences(prev => [newExperience, ...prev]);
        toast({
          title: "Added new experience",
          description: `${formData.role} at ${formData.company} has been added.`
        });
      } else {
        // Update existing experience
        setExperiences(prev => 
          prev.map(exp => exp.id === isEditing ? formData : exp)
        );
        toast({
          title: "Updated",
          description: `${formData.role} experience has been updated.`
        });
      }
      
      setIsEditing(null);
      setIsSaving(false);
    }, 800);
  };
  
  const handleCancel = () => {
    setIsEditing(null);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Experience</h1>
          <p className="text-muted-foreground">
            Manage your work experience
          </p>
        </div>
        
        <Button 
          className="tech-btn"
          onClick={handleAdd}
        >
          <Plus size={16} className="mr-2" />
          Add Experience
        </Button>
      </div>
      
      {isEditing !== null && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="glass border-white/10 border-2 border-tech-accent/30">
            <CardHeader>
              <CardTitle>
                {isEditing === 0 ? "Add New Experience" : "Edit Experience"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Job Title</Label>
                    <Input
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="bg-background/50"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="bg-background/50"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      name="duration"
                      placeholder="Apr 2024 – Present"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="bg-background/50"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      id="isActive"
                      name="isActive"
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={handleCheckboxChange}
                      className="rounded border-gray-400 h-4 w-4"
                    />
                    <Label htmlFor="isActive">Current Position</Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="bg-background/50 min-h-[120px]"
                    required
                  />
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="tech-btn"
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4"
      >
        {experiences.length === 0 ? (
          <Card className="glass border-white/10 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground mb-4">No experience entries yet</p>
              <Button 
                className="tech-btn"
                onClick={handleAdd}
              >
                <Plus size={16} className="mr-2" />
                Add Your First Experience
              </Button>
            </CardContent>
          </Card>
        ) : (
          experiences.map((experience, index) => (
            <Card 
              key={experience.id}
              className="glass border-white/10 hover:border-tech-accent/20 transition-colors"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    {experience.role}
                    {experience.isActive && (
                      <span className="text-xs bg-tech-accent/20 text-tech-accent px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                    >
                      <ArrowUp size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === experiences.length - 1}
                    >
                      <ArrowDown size={16} />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {experience.company} | {experience.duration}
                </CardDescription>
              </CardHeader>
              <CardContent className="py-2">
                <p className="text-sm text-muted-foreground">
                  {experience.description}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(experience.id)}
                >
                  <Trash2 size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(experience)}
                >
                  <Pencil size={16} className="mr-1" />
                  Edit
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </motion.div>
    </div>
  );
}
