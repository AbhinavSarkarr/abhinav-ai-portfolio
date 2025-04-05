
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Publication {
  id: number;
  title: string;
  journal: string;
  year: string;
  description?: string;
  url?: string;
}

export function AdminPublications() {
  const { toast } = useToast();
  
  const [publications, setPublications] = useState<Publication[]>([
    {
      id: 1,
      title: "A Comprehensive Survey on Answer Generation Methods using NLP",
      journal: "NLP Journal (ScienceDirect)",
      year: "2023",
      description: "An extensive review of answer generation techniques in natural language processing, focusing on transformer-based approaches.",
      url: "#"
    }
  ]);
  
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [formData, setFormData] = useState<Publication>({
    id: 0,
    title: "",
    journal: "",
    year: "",
    description: "",
    url: ""
  });
  
  const [isSaving, setIsSaving] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAdd = () => {
    setFormData({
      id: 0,
      title: "",
      journal: "",
      year: "",
      description: "",
      url: ""
    });
    setIsEditing(0);
  };
  
  const handleEdit = (publication: Publication) => {
    setFormData(publication);
    setIsEditing(publication.id);
  };
  
  const handleDelete = (id: number) => {
    setPublications(prev => prev.filter(pub => pub.id !== id));
    toast({
      title: "Deleted",
      description: "Publication has been removed."
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    setTimeout(() => {
      if (isEditing === 0) {
        // Add new publication
        const newPublication = {
          ...formData,
          id: Date.now()
        };
        setPublications(prev => [...prev, newPublication]);
        toast({
          title: "Added new publication",
          description: `${formData.title} has been added to your profile.`
        });
      } else {
        // Update existing publication
        setPublications(prev => 
          prev.map(pub => pub.id === isEditing ? formData : pub)
        );
        toast({
          title: "Updated",
          description: `${formData.title} publication has been updated.`
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
          <h1 className="text-3xl font-bold">Publications</h1>
          <p className="text-muted-foreground">
            Manage your research publications and papers
          </p>
        </div>
        
        <Button 
          className="tech-btn"
          onClick={handleAdd}
        >
          <Plus size={16} className="mr-2" />
          Add Publication
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
                {isEditing === 0 ? "Add New Publication" : "Edit Publication"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Publication Title</Label>
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
                    <Label htmlFor="journal">Journal / Publisher</Label>
                    <Input
                      id="journal"
                      name="journal"
                      value={formData.journal}
                      onChange={handleInputChange}
                      className="bg-background/50"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="year">Publication Year</Label>
                    <Input
                      id="year"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      className="bg-background/50"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Abstract / Description (Optional)</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description || ""}
                    onChange={handleInputChange}
                    className="bg-background/50 min-h-[120px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="url">Publication URL (Optional)</Label>
                  <Input
                    id="url"
                    name="url"
                    value={formData.url || ""}
                    onChange={handleInputChange}
                    className="bg-background/50"
                    placeholder="https://publication-url.com"
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
                    {isSaving ? "Saving..." : "Save Publication"}
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
        {publications.length === 0 ? (
          <Card className="glass border-white/10 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-muted-foreground mb-4">No publications added yet</p>
              <Button 
                className="tech-btn"
                onClick={handleAdd}
              >
                <Plus size={16} className="mr-2" />
                Add Your First Publication
              </Button>
            </CardContent>
          </Card>
        ) : (
          publications.map((publication) => (
            <Card 
              key={publication.id}
              className="glass border-white/10 hover:border-tech-accent/20 transition-colors"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText size={18} className="text-tech-accent" />
                      {publication.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {publication.journal} ({publication.year})
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              {publication.description && (
                <CardContent className="py-2">
                  <p className="text-sm text-muted-foreground">
                    {publication.description}
                  </p>
                </CardContent>
              )}
              
              <CardFooter className="flex justify-between pt-2 border-t border-white/10">
                {publication.url ? (
                  <Button variant="ghost" size="sm" className="gap-1.5" asChild>
                    <a href={publication.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={14} />
                      View Publication
                    </a>
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">No publication link</span>
                )}
                
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(publication.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(publication)}
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
