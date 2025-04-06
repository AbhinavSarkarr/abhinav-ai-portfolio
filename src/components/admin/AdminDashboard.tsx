
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FolderKanban, 
  MessageCircle, 
  Clock 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminData } from "@/contexts/AdminDataContext";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
};

export function AdminDashboard() {
  const navigate = useNavigate();
  const { data } = useAdminData();
  
  // Get current date for "Last Updated"
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  const statCards = [
    { 
      title: "Total Projects", 
      value: data.projects.length.toString(), 
      description: "Portfolio projects", 
      icon: FolderKanban,
      color: "text-blue-400" 
    },
    { 
      title: "Experience", 
      value: data.experiences.length.toString(), 
      description: "Work positions", 
      icon: Briefcase,
      color: "text-green-400" 
    },
    { 
      title: "Publications", 
      value: data.publications.length.toString(), 
      description: "Research papers", 
      icon: Users,
      color: "text-purple-400" 
    },
    { 
      title: "Last Updated", 
      value: currentDate, 
      description: "Portfolio content", 
      icon: Clock,
      color: "text-amber-400" 
    },
  ];
  
  const handleNavigate = (path: string) => {
    navigate(path);
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome, Admin</h1>
        <p className="text-muted-foreground">
          Manage your portfolio content from this dashboard
        </p>
      </div>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {statCards.map((card, index) => (
          <motion.div key={index} variants={itemVariants}>
            <Card className="glass border-white/10 overflow-hidden">
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{card.title}</CardTitle>
                  <card.icon className={`${card.color}`} size={20} />
                </div>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-3xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
      
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="lg:col-span-2" variants={itemVariants}>
          <Card className="glass border-white/10 h-full">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Frequently used content management actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Card 
                  className="glass border-white/10 cursor-pointer hover:bg-white/5 transition"
                  onClick={() => handleNavigate('/admin/hero')}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="bg-tech-accent/20 p-2 rounded-lg">
                      <LayoutDashboard size={18} className="text-tech-accent" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Hero Section</h3>
                      <p className="text-xs text-muted-foreground">Update intro text</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className="glass border-white/10 cursor-pointer hover:bg-white/5 transition"
                  onClick={() => handleNavigate('/admin/projects')}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="bg-tech-accent/20 p-2 rounded-lg">
                      <FolderKanban size={18} className="text-tech-accent" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Manage Projects</h3>
                      <p className="text-xs text-muted-foreground">Edit portfolio items</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className="glass border-white/10 cursor-pointer hover:bg-white/5 transition"
                  onClick={() => handleNavigate('/admin/experience')}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="bg-tech-accent/20 p-2 rounded-lg">
                      <Briefcase size={18} className="text-tech-accent" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Experience</h3>
                      <p className="text-xs text-muted-foreground">Update work history</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className="glass border-white/10 cursor-pointer hover:bg-white/5 transition"
                  onClick={() => handleNavigate('/admin/social')}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="bg-tech-accent/20 p-2 rounded-lg">
                      <MessageCircle size={18} className="text-tech-accent" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Social Links</h3>
                      <p className="text-xs text-muted-foreground">Update social profiles</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card className="glass border-white/10 h-full">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest changes to your portfolio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="size-2 rounded-full bg-green-500"></div>
                <p>Updated project descriptions</p>
                <span className="ml-auto text-xs text-muted-foreground">Just now</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="size-2 rounded-full bg-blue-500"></div>
                <p>Added new skill tags</p>
                <span className="ml-auto text-xs text-muted-foreground">Today</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="size-2 rounded-full bg-purple-500"></div>
                <p>Updated profile image</p>
                <span className="ml-auto text-xs text-muted-foreground">Yesterday</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="size-2 rounded-full bg-amber-500"></div>
                <p>Added new certification</p>
                <span className="ml-auto text-xs text-muted-foreground">3 days ago</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
