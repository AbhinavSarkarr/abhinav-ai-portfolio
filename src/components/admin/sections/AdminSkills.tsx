
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X, Pencil, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface SkillCategory {
  id: number;
  name: string;
  skills: string[];
}

export function AdminSkills() {
  const { toast } = useToast();
  
  const [categories, setCategories] = useState<SkillCategory[]>([
    {
      id: 1,
      name: "Libraries",
      skills: ["Keras", "NLTK", "spaCy", "OpenCV", "Transformers", "XGBoost"]
    },
    {
      id: 2,
      name: "Frameworks",
      skills: ["Pandas", "Numpy", "TensorFlow", "Langchain", "Scikit-learn", "FastAPI", "PyTorch"]
    },
    {
      id: 3,
      name: "Databases",
      skills: ["MySQL", "Redis", "ChromaDB", "Qdrant", "Pinecone"]
    },
    {
      id: 4,
      name: "Tools",
      skills: ["Docker", "RabbitMQ", "GitHub", "CI/CD"]
    }
  ]);
  
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [editingCategoryName, setEditingCategoryName] = useState("");
  
  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: SkillCategory = {
        id: Date.now(),
        name: newCategoryName.trim(),
        skills: []
      };
      
      setCategories([...categories, newCategory]);
      setNewCategoryName("");
      setIsAddingCategory(false);
      
      toast({
        title: "Category Added",
        description: `${newCategoryName} category has been added.`
      });
    }
  };
  
  const handleDeleteCategory = (id: number) => {
    setCategories(categories.filter(category => category.id !== id));
    toast({
      title: "Category Deleted",
      description: "The skill category has been removed."
    });
  };
  
  const handleEditCategory = (category: SkillCategory) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };
  
  const handleUpdateCategoryName = () => {
    if (editingCategoryName.trim() && editingCategoryId) {
      setCategories(categories.map(category => 
        category.id === editingCategoryId 
          ? { ...category, name: editingCategoryName.trim() } 
          : category
      ));
      
      setEditingCategoryId(null);
      setEditingCategoryName("");
      
      toast({
        title: "Category Updated",
        description: "Category name has been updated."
      });
    }
  };
  
  const handleAddSkill = (categoryId: number) => {
    if (newSkill.trim()) {
      setCategories(categories.map(category => 
        category.id === categoryId
          ? { ...category, skills: [...category.skills, newSkill.trim()] }
          : category
      ));
      
      setNewSkill("");
      
      toast({
        title: "Skill Added",
        description: `${newSkill} has been added.`
      });
    }
  };
  
  const handleDeleteSkill = (categoryId: number, skillIndex: number) => {
    setCategories(categories.map(category => 
      category.id === categoryId
        ? { 
            ...category, 
            skills: category.skills.filter((_, index) => index !== skillIndex) 
          }
        : category
    ));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Technical Skills</h1>
          <p className="text-muted-foreground">
            Manage your skills and competencies
          </p>
        </div>
        
        <Button 
          className="tech-btn"
          onClick={() => setIsAddingCategory(true)}
        >
          <Plus size={16} className="mr-2" />
          Add Category
        </Button>
      </div>
      
      {isAddingCategory && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="glass border-white/10 border-2 border-tech-accent/30">
            <CardHeader>
              <CardTitle>Add New Skill Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input
                    id="categoryName"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="bg-background/50"
                    placeholder="e.g., Programming Languages"
                  />
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddingCategory(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="tech-btn"
                    onClick={handleAddCategory}
                    disabled={!newCategoryName.trim()}
                  >
                    Add Category
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6"
      >
        {categories.length === 0 ? (
          <Card className="glass border-white/10 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-muted-foreground mb-4">No skill categories added yet</p>
              <Button 
                className="tech-btn"
                onClick={() => setIsAddingCategory(true)}
              >
                <Plus size={16} className="mr-2" />
                Add Your First Category
              </Button>
            </CardContent>
          </Card>
        ) : (
          categories.map((category) => (
            <Card 
              key={category.id}
              className="glass border-white/10 hover:border-tech-accent/20 transition-colors"
            >
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                {editingCategoryId === category.id ? (
                  <div className="flex-1 flex gap-2">
                    <Input
                      value={editingCategoryName}
                      onChange={(e) => setEditingCategoryName(e.target.value)}
                      className="bg-background/50"
                    />
                    <Button 
                      className="tech-btn"
                      onClick={handleUpdateCategoryName}
                    >
                      Save
                    </Button>
                    <Button 
                      variant="ghost"
                      onClick={() => setEditingCategoryId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <CardTitle className="text-xl">{category.name}</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-destructive"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </>
                )}
              </CardHeader>
              
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {category.skills.map((skill, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-1 bg-tech-glass border border-tech-accent/20 px-2 py-1 rounded-md text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleDeleteSkill(category.id, index)}
                        className="ml-1 hover:text-destructive focus:outline-none"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  
                  {category.skills.length === 0 && (
                    <p className="text-sm text-muted-foreground">No skills added yet</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="bg-background/50"
                    placeholder="Add a new skill..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newSkill.trim()) {
                        e.preventDefault();
                        handleAddSkill(category.id);
                      }
                    }}
                  />
                  <Button 
                    className="tech-btn"
                    onClick={() => handleAddSkill(category.id)}
                    disabled={!newSkill.trim()}
                  >
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </motion.div>
    </div>
  );
}
