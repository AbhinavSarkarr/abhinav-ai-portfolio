
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Award, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Certification {
  id: number;
  title: string;
  issuer: string;
  issueDate: string;
  url?: string;
}

export function AdminCertifications() {
  const { toast } = useToast();
  
  const [certifications, setCertifications] = useState<Certification[]>([
    {
      id: 1,
      title: "Finetuning Large Language Models",
      issuer: "DeepLearning.AI",
      issueDate: "April 2024",
      url: "https://www.deeplearning.ai"
    },
    {
      id: 2,
      title: "Prompt Engineering with Llama 2&3",
      issuer: "DeepLearning.AI",
      issueDate: "March 2024",
      url: "https://www.deeplearning.ai"
    },
    {
      id: 3,
      title: "Artificial Intelligence with Machine Learning",
      issuer: "Oracle",
      issueDate: "November 2023",
      url: "https://www.oracle.com"
    }
  ]);
  
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [formData, setFormData] = useState<Certification>({
    id: 0,
    title: "",
    issuer: "",
    issueDate: "",
    url: ""
  });
  
  const [isSaving, setIsSaving] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAdd = () => {
    setFormData({
      id: 0,
      title: "",
      issuer: "",
      issueDate: "",
      url: ""
    });
    setIsEditing(0);
  };
  
  const handleEdit = (certification: Certification) => {
    setFormData(certification);
    setIsEditing(certification.id);
  };
  
  const handleDelete = (id: number) => {
    setCertifications(prev => prev.filter(cert => cert.id !== id));
    toast({
      title: "Deleted",
      description: "Certification has been removed."
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    setTimeout(() => {
      if (isEditing === 0) {
        // Add new certification
        const newCertification = {
          ...formData,
          id: Date.now()
        };
        setCertifications(prev => [...prev, newCertification]);
        toast({
          title: "Added new certification",
          description: `${formData.title} has been added to your profile.`
        });
      } else {
        // Update existing certification
        setCertifications(prev => 
          prev.map(cert => cert.id === isEditing ? formData : cert)
        );
        toast({
          title: "Updated",
          description: `${formData.title} certification has been updated.`
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
          <h1 className="text-3xl font-bold">Certifications</h1>
          <p className="text-muted-foreground">
            Manage your professional certifications
          </p>
        </div>
        
        <Button 
          className="tech-btn"
          onClick={handleAdd}
        >
          <Plus size={16} className="mr-2" />
          Add Certification
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
                {isEditing === 0 ? "Add New Certification" : "Edit Certification"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Certification Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="bg-background/50"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="issuer">Issuing Organization</Label>
                    <Input
                      id="issuer"
                      name="issuer"
                      value={formData.issuer}
                      onChange={handleInputChange}
                      className="bg-background/50"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="issueDate">Issue Date</Label>
                    <Input
                      id="issueDate"
                      name="issueDate"
                      value={formData.issueDate}
                      onChange={handleInputChange}
                      className="bg-background/50"
                      placeholder="Month Year (e.g., April 2024)"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="url">Certificate URL (Optional)</Label>
                  <Input
                    id="url"
                    name="url"
                    value={formData.url || ""}
                    onChange={handleInputChange}
                    className="bg-background/50"
                    placeholder="https://credential-url.com"
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
                    {isSaving ? "Saving..." : "Save Certification"}
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
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {certifications.length === 0 ? (
          <Card className="col-span-full glass border-white/10 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-muted-foreground mb-4">No certifications added yet</p>
              <Button 
                className="tech-btn"
                onClick={handleAdd}
              >
                <Plus size={16} className="mr-2" />
                Add Your First Certification
              </Button>
            </CardContent>
          </Card>
        ) : (
          certifications.map((certification) => (
            <Card 
              key={certification.id}
              className="glass border-white/10 hover:border-tech-accent/20 transition-colors"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Award size={18} className="text-tech-accent" />
                      {certification.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {certification.issuer}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="py-2">
                <div className="flex items-center text-sm text-muted-foreground gap-1">
                  <Calendar size={14} />
                  <span>{certification.issueDate}</span>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between pt-2 border-t border-white/10">
                {certification.url ? (
                  <Button variant="ghost" size="sm" className="gap-1.5" asChild>
                    <a href={certification.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={14} />
                      View Certificate
                    </a>
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">No certificate link</span>
                )}
                
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(certification.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(certification)}
                  >
                    <Pencil size={16} className="mr-1" />
                    Edit
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </motion.div>
    </div>
  );
}
