
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, PlusCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAdminData } from "@/contexts/AdminDataContext";

export function AdminExperience() {
  const { toast } = useToast();
  const { data, updateExperience, addExperience, deleteExperience } = useAdminData();
  
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    company: "",
    period: "",
    description: [""],
    current: false
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
  
  // Handle bullet point descriptions
  const handleDescriptionPointChange = (index: number, value: string) => {
    setFormData(prev => {
      const newDescription = [...prev.description];
      newDescription[index] = value;
      return { ...prev, description: newDescription };
    });
  };
  
  const addDescriptionPoint = () => {
    setFormData(prev => ({
      ...prev,
      description: [...prev.description, ""]
    }));
  };
  
  const removeDescriptionPoint = (index: number) => {
    if (formData.description.length === 1) return;
    
    setFormData(prev => {
      const newDescription = [...prev.description];
      newDescription.splice(index, 1);
      return { ...prev, description: newDescription };
    });
  };
  
  const handleAdd = () => {
    setFormData({
      id: "",
      title: "",
      company: "",
      period: "",
      description: [""],
      current: false
    });
    setIsEditing("new");
  };
  
  const handleEdit = (experience: any) => {
    // Make sure description is an array
    const description = Array.isArray(experience.description) 
      ? experience.description 
      : [experience.description];
    
    setFormData({
      id: experience.id,
      title: experience.title,
      company: experience.company,
      period: experience.period,
      description: description,
      current: experience.current
    });
    setIsEditing(experience.id);
  };
  
  const handleDelete = (id: string) => {
    deleteExperience(id);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Filter out empty bullet points
    const cleanedDescription = formData.description.filter(point => point.trim() !== "");
    
    setTimeout(() => {
      if (isEditing === "new") {
        // Add new experience
        addExperience({
          title: formData.title,
          company: formData.company,
          period: formData.period,
          description: cleanedDescription,
          current: formData.current
        });
      } else {
        // Update existing experience
        updateExperience(formData.id, {
          title: formData.title,
          company: formData.company,
          period: formData.period,
          description: cleanedDescription,
          current: formData.current
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
                {isEditing === "new" ? "Add New Experience" : "Edit Experience"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
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
                    <Label htmlFor="period">Duration</Label>
                    <Input
                      id="period"
                      name="period"
                      placeholder="Apr 2024 – Present"
                      value={formData.period}
                      onChange={handleInputChange}
                      className="bg-background/50"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      id="current"
                      name="current"
                      type="checkbox"
                      checked={formData.current}
                      onChange={handleCheckboxChange}
                      className="rounded border-gray-400 h-4 w-4"
                    />
                    <Label htmlFor="current">Current Position</Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Description (Bullet Points)</Label>
                  
                  <div className="space-y-2">
                    {formData.description.map((point, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={point}
                          onChange={(e) => handleDescriptionPointChange(index, e.target.value)}
                          className="bg-background/50 flex-1"
                          placeholder={`Bullet point ${index + 1}`}
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeDescriptionPoint(index)}
                          disabled={formData.description.length === 1}
                          className="h-10 w-10 text-muted-foreground hover:text-destructive"
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-2 flex items-center justify-center gap-1"
                    onClick={addDescriptionPoint}
                  >
                    <PlusCircle size={16} />
                    Add Bullet Point
                  </Button>
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
        {data.experiences.length === 0 ? (
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
          data.experiences.map((experience, index) => (
            <Card 
              key={experience.id}
              className="glass border-white/10 hover:border-tech-accent/20 transition-colors"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    {experience.title}
                    {experience.current && (
                      <span className="text-xs bg-tech-accent/20 text-tech-accent px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </CardTitle>
                </div>
                <CardDescription>
                  {experience.company} | {experience.period}
                </CardDescription>
              </CardHeader>
              <CardContent className="py-2">
                <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                  {Array.isArray(experience.description) ? (
                    experience.description.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))
                  ) : (
                    <li>{experience.description}</li>
                  )}
                </ul>
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
