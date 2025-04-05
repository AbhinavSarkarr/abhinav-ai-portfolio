
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Github, 
  Linkedin, 
  Mail, 
  FileText, 
  Check,
  Globe,
  Twitter,
  Instagram,
  Youtube
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface SocialLink {
  id: string;
  name: string;
  url: string;
  icon: React.ReactNode;
}

export function AdminSocial() {
  const { toast } = useToast();
  
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { id: "github", name: "GitHub", url: "https://github.com/AbhinavSarkarr", icon: <Github size={20} /> },
    { id: "linkedin", name: "LinkedIn", url: "https://www.linkedin.com/in/abhinavsarkarrr/", icon: <Linkedin size={20} /> },
    { id: "huggingface", name: "Hugging Face", url: "https://huggingface.co/abhinavsarkar", icon: <span className="text-xl">🤗</span> },
    { id: "email", name: "Email", url: "abhinavsarkar53@gmail.com", icon: <Mail size={20} /> },
    { id: "resume", name: "Resume", url: "#", icon: <FileText size={20} /> }
  ]);
  
  const [formData, setSocialFormData] = useState<Record<string, string>>(
    socialLinks.reduce((acc, link) => ({ ...acc, [link.id]: link.url }), {})
  );
  
  const [isSaving, setIsSaving] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSocialFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    setTimeout(() => {
      const updatedLinks = socialLinks.map(link => ({
        ...link,
        url: formData[link.id] || link.url
      }));
      
      setSocialLinks(updatedLinks);
      
      toast({
        title: "Social links updated",
        description: "Your profile links have been successfully updated."
      });
      
      setIsSaving(false);
    }, 800);
  };

  const additionalPlatforms = [
    { id: "twitter", name: "Twitter", icon: <Twitter size={20} /> },
    { id: "instagram", name: "Instagram", icon: <Instagram size={20} /> },
    { id: "website", name: "Personal Website", icon: <Globe size={20} /> },
    { id: "youtube", name: "YouTube", icon: <Youtube size={20} /> }
  ];

  const handleAddPlatform = (platform: { id: string, name: string, icon: React.ReactNode }) => {
    // Check if platform already exists
    if (socialLinks.some(link => link.id === platform.id)) {
      toast({
        title: "Platform already exists",
        description: `${platform.name} is already in your social links.`,
        variant: "destructive"
      });
      return;
    }

    const newLink: SocialLink = {
      id: platform.id,
      name: platform.name,
      url: "",
      icon: platform.icon
    };

    setSocialLinks([...socialLinks, newLink]);
    setSocialFormData(prev => ({ ...prev, [platform.id]: "" }));

    toast({
      title: "Platform added",
      description: `${platform.name} has been added to your social links.`
    });
  };

  const handleRemoveLink = (id: string) => {
    setSocialLinks(socialLinks.filter(link => link.id !== id));
    setSocialFormData(prev => {
      const newData = { ...prev };
      delete newData[id];
      return newData;
    });

    toast({
      title: "Platform removed",
      description: "Social link has been removed from your profile."
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Social Links</h1>
        <p className="text-muted-foreground">
          Manage your online presence and contact information
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
              <CardTitle>Your Social Links</CardTitle>
              <CardDescription>
                Update your social media URLs and contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {socialLinks.map((link) => (
                  <div key={link.id} className="grid grid-cols-[auto_1fr_auto] gap-3 items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-tech-glass">
                      {link.icon}
                    </div>
                    
                    <div className="space-y-2 flex-1">
                      <Label htmlFor={link.id}>{link.name}</Label>
                      <Input
                        id={link.id}
                        name={link.id}
                        value={formData[link.id] || ""}
                        onChange={handleInputChange}
                        className="bg-background/50"
                        placeholder={`Your ${link.name} URL or email`}
                      />
                    </div>

                    {(link.id !== "github" && link.id !== "email") && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive self-end mb-2"
                        onClick={() => handleRemoveLink(link.id)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                
                <Button type="submit" className="tech-btn" disabled={isSaving}>
                  {isSaving ? <span className="flex items-center gap-2"><Check size={16} /> Saving...</span> : "Save Changes"}
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
              <CardTitle>Add More Platforms</CardTitle>
              <CardDescription>
                Expand your online presence with additional social platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {additionalPlatforms.map((platform) => (
                <div key={platform.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-tech-glass">
                      {platform.icon}
                    </div>
                    <span>{platform.name}</span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddPlatform(platform)}
                    disabled={socialLinks.some(link => link.id === platform.id)}
                  >
                    {socialLinks.some(link => link.id === platform.id) ? "Added" : "Add"}
                  </Button>
                </div>
              ))}

              <div className="pt-4 mt-4 border-t border-white/10">
                <h3 className="text-sm font-medium mb-3">Preview</h3>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-tech-glass hover:bg-tech-accent/20 transition-colors cursor-pointer"
                      title={link.name}
                    >
                      {link.icon}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
