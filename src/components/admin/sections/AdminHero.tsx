
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAdminData } from "@/contexts/AdminDataContext";

export function AdminHero() {
  const { toast } = useToast();
  const { data, updateHero } = useAdminData();
  
  const [formData, setFormData] = useState({
    name: data.hero.name || "",
    headline: data.hero.title || "",
    introText: data.hero.description || "",
    profileImage: data.hero.image || "",
    resumeLink: data.hero.resumeLink || ""
  });
  
  // Update form data when context data changes
  useEffect(() => {
    console.log("Hero data in AdminHero:", data.hero);
    setFormData({
      name: data.hero.name || "",
      headline: data.hero.title || "",
      introText: data.hero.description || "",
      profileImage: data.hero.image || "",
      resumeLink: data.hero.resumeLink || ""
    });
  }, [data.hero]);
  
  const [isSaving, setIsSaving] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Update hero data using context
      console.log("Updating hero with:", formData);
      const updatedData = {
        name: formData.name,
        title: formData.headline,
        description: formData.introText,
        image: formData.profileImage,
        resumeLink: formData.resumeLink
      };
      
      updateHero(updatedData);
      
      toast({
        title: "Success!",
        description: "Hero section information updated successfully.",
      });
    } catch (error) {
      console.error("Error saving hero data:", error);
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
                  <Label htmlFor="resumeLink">Resume Link</Label>
                  <Input
                    id="resumeLink"
                    name="resumeLink"
                    value={formData.resumeLink}
                    onChange={handleInputChange}
                    className="bg-background/50"
                    placeholder="https://drive.google.com/file/your-resume-link"
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
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/150?text=No+Image";
                    }}
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
                <Button className="w-full glass border border-dashed border-white/20 hover:border-tech-accent/50 hover:bg-tech-glass/30" type="button">
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
