
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export function AdminHero() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "Abhinav Sarkar",
    headline: "AI/LLM Engineer",
    introText: "Specialized in NLP, RAG pipelines, and LLM fine-tuning. Creating solutions that leverage the power of artificial intelligence to solve real-world problems.",
    aboutMe: "I am a passionate AI/LLM Engineer with expertise in natural language processing and deep learning. With a background in computer science and a focus on cutting-edge AI technologies, I build intelligent systems that solve real-world problems. I specialize in developing RAG pipelines and fine-tuning language models for specific use cases.",
    keywords: "AI, LLM, NLP, RAG, Fine-tuning, Machine Learning",
    profileImage: "/lovable-uploads/0f976acc-d38b-4ac7-96a7-02ccc53846b5.png"
  });
  
  const [isSaving, setIsSaving] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // This would be replaced with an actual API call
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success!",
        description: "Hero section information updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update hero section. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hero & About</h1>
        <p className="text-muted-foreground">
          Manage your hero section and about me information
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle>Hero Content</CardTitle>
              <CardDescription>
                Update the main information displayed in your hero section
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="bg-background/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="headline">Headline</Label>
                    <Input
                      id="headline"
                      name="headline"
                      value={formData.headline}
                      onChange={handleInputChange}
                      className="bg-background/50"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="introText">Intro Text</Label>
                  <Textarea
                    id="introText"
                    name="introText"
                    value={formData.introText}
                    onChange={handleInputChange}
                    className="bg-background/50 min-h-[100px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="aboutMe">About Me</Label>
                  <Textarea
                    id="aboutMe"
                    name="aboutMe"
                    value={formData.aboutMe}
                    onChange={handleInputChange}
                    className="bg-background/50 min-h-[150px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="keywords">
                    Keywords (comma separated)
                  </Label>
                  <Input
                    id="keywords"
                    name="keywords"
                    value={formData.keywords}
                    onChange={handleInputChange}
                    className="bg-background/50"
                  />
                </div>
                
                <Button type="submit" className="tech-btn" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle>Profile Image</CardTitle>
              <CardDescription>
                Update your profile picture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-tech-accent/30">
                  <img
                    src={formData.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="profileImage">Image URL</Label>
                <Input
                  id="profileImage"
                  name="profileImage"
                  value={formData.profileImage}
                  onChange={handleInputChange}
                  className="bg-background/50"
                />
              </div>
              
              <div className="pt-2">
                <Button className="w-full glass border border-dashed border-white/20 hover:border-tech-accent/50 hover:bg-tech-glass/30">
                  Upload New Image
                </Button>
                
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Supports JPG, PNG, GIF up to 2MB
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
