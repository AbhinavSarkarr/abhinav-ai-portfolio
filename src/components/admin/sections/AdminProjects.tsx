
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Github, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAdminData } from "@/contexts/AdminDataContext";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function AdminProjects() {
  const { toast } = useToast();
  const { data, addProject, updateProject, deleteProject } = useAdminData();
  
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    description: "",
    technologies: [] as string[],
    image: "",
    github: "",
    liveUrl: ""
  });
  
  const [techInput, setTechInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  // Log projects whenever they change
  useEffect(() => {
    console.log("Current projects in AdminProjects:", data.projects);
  }, [data.projects]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTechKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && techInput.trim()) {
      e.preventDefault();
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()]
      }));
      setTechInput("");
    }
  };
  
  const removeTech = (index: number) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index)
    }));
  };
  
  const handleAdd = () => {
    setFormData({
      id: "",
      title: "",
      description: "",
      technologies: [],
      image: "",
      github: "",
      liveUrl: ""
    });
    setIsEditing("new");
  };
  
  const handleEdit = (project: any) => {
    console.log("Edit project clicked:", project);
    setFormData({
      id: project.id,
      title: project.title,
      description: project.description,
      technologies: Array.isArray(project.technologies) ? [...project.technologies] : [],
      image: project.image || "",
      github: project.github || "",
      liveUrl: project.liveUrl || ""
    });
    setIsEditing(project.id);
  };
  
  const handleDeleteClick = (id: string) => {
    console.log("Delete project clicked:", id);
    setProjectToDelete(id);
    setOpenDialog(true);
  };
  
  const handleConfirmDelete = () => {
    if (projectToDelete) {
      console.log("Confirming deletion of project:", projectToDelete);
      deleteProject(projectToDelete);
      setProjectToDelete(null);
      setOpenDialog(false);
      toast({
        title: "Project deleted",
        description: "The project has been removed from your portfolio."
      });
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Filter out empty bullet points
      const cleanedTechnologies = formData.technologies.filter(tech => tech.trim() !== "");
      
      if (isEditing === "new") {
        // Add new project
        addProject({
          title: formData.title,
          description: formData.description,
          technologies: cleanedTechnologies,
          image: formData.image,
          github: formData.github,
          liveUrl: formData.liveUrl
        });
        toast({
          title: "Added new project",
          description: `${formData.title} has been added to your portfolio.`
        });
      } else if (isEditing) {
        // Update existing project
        console.log("Updating project:", formData);
        updateProject(formData.id, {
          title: formData.title,
          description: formData.description,
          technologies: cleanedTechnologies,
          image: formData.image,
          github: formData.github,
          liveUrl: formData.liveUrl
        });
        toast({
          title: "Updated",
          description: `${formData.title} project has been updated.`
        });
      }
    } catch (error) {
      console.error("Error saving project:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your project.",
        variant: "destructive"
      });
    } finally {
      setIsEditing(null);
      setIsSaving(false);
    }
  };
  
  const handleCancel = () => {
    setIsEditing(null);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Manage your portfolio projects
          </p>
        </div>
        
        <Button 
          className="tech-btn"
          onClick={handleAdd}
        >
          <Plus size={16} className="mr-2" />
          Add Project
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
                {isEditing === "new" ? "Add New Project" : "Edit Project"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} id="projectForm" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title</Label>
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="bg-background/50 min-h-[100px]"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className="bg-background/50"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="github">GitHub URL</Label>
                    <Input
                      id="github"
                      name="github"
                      value={formData.github || ""}
                      onChange={handleInputChange}
                      className="bg-background/50"
                      placeholder="https://github.com/username/repo"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="liveUrl">Live Demo URL</Label>
                    <Input
                      id="liveUrl"
                      name="liveUrl"
                      value={formData.liveUrl || ""}
                      onChange={handleInputChange}
                      className="bg-background/50"
                      placeholder="https://your-demo-url.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Technologies Used</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.technologies.map((tech, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-1 bg-tech-accent/20 text-tech-accent px-2 py-1 rounded-md text-sm"
                      >
                        {tech}
                        <button
                          type="button"
                          onClick={() => removeTech(index)}
                          className="ml-1 hover:text-white focus:outline-none"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                  <Input
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={handleTechKeyDown}
                    className="bg-background/50"
                    placeholder="Type a technology and press Enter"
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex gap-2 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                form="projectForm"
                className="tech-btn"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Project"}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.projects && data.projects.length > 0 ? (
          data.projects.map((project) => (
            <Card 
              key={project.id}
              className="glass border-white/10 hover:border-tech-accent/20 transition-colors overflow-hidden"
            >
              <div className="h-40 overflow-hidden relative">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60" />
              </div>
              
              <CardHeader className="pb-2">
                <CardTitle>{project.title}</CardTitle>
                <CardDescription>
                  {project.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="py-2">
                <div className="flex flex-wrap gap-2">
                  {project.technologies && project.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="skill-badge"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between pt-2">
                <div className="flex gap-2">
                  {project.github && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a href={project.github} target="_blank" rel="noopener noreferrer">
                        <Github size={16} />
                      </a>
                    </Button>
                  )}
                  
                  {project.liveUrl && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                        <Globe size={16} />
                      </a>
                    </Button>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteClick(project.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(project)}
                  >
                    <Pencil size={16} className="mr-1" />
                    Edit
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        ) : (
          <Card className="col-span-full glass border-white/10 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-muted-foreground mb-4">No projects added yet</p>
              <Button 
                className="tech-btn"
                onClick={handleAdd}
              >
                <Plus size={16} className="mr-2" />
                Add Your First Project
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setProjectToDelete(null);
              setOpenDialog(false);
            }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
