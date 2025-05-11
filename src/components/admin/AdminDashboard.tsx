
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Rocket, Brain, Microchip, CircuitBoard, Database, Code, Layers, Network, Bot } from "lucide-react";
import { useAdminData } from "@/contexts/AdminDataContext";

export function AdminDashboard() {
  const navigate = useNavigate();
  const { saveToServer } = useAdminData();

  const sections = [
    { name: "Hero Section", path: "/admin/hero", icon: <Brain className="text-tech-accent" size={24} /> },
    { name: "Experience", path: "/admin/experience", icon: <CircuitBoard className="text-tech-accent" size={24} /> },
    { name: "Projects", path: "/admin/projects", icon: <Code className="text-tech-matrix" size={24} /> },
    { name: "Skills", path: "/admin/skills", icon: <Microchip className="text-tech-accent" size={24} /> },
    { name: "Publications", path: "/admin/publications", icon: <Database className="text-tech-matrix" size={24} /> },
    { name: "Certifications", path: "/admin/certifications", icon: <Layers className="text-tech-accent" size={24} /> },
    { name: "Social Links", path: "/admin/social", icon: <Network className="text-tech-matrix" size={24} /> },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Bot className="text-tech-neon h-8 w-8" />
          <h1 className="text-3xl font-bold animated-gradient-text">Admin Dashboard</h1>
        </div>
        <Button 
          onClick={saveToServer} 
          variant="default" 
          className="cyber-btn"
        >
          <Rocket className="mr-2 h-4 w-4" /> Deploy Changes
        </Button>
      </div>

      <p className="text-muted-foreground mb-8">
        Manage your portfolio content by selecting a section below. Remember to deploy your changes when you're ready for them to be visible to all visitors.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section, index) => (
          <motion.div
            key={section.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.03 }}
            className={`${index % 2 === 0 ? 'glass' : 'neural-card'} rounded-lg p-6 cursor-pointer transition-all duration-300`}
            onClick={() => navigate(section.path)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {section.icon}
                <h2 className="text-xl font-semibold ml-3">{section.name}</h2>
              </div>
              <ArrowRight size={18} className="text-tech-neon" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 p-6 border border-orange-500/30 bg-orange-500/10 rounded-lg glass">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <span className="text-orange-500">⚠️</span> Important Note
        </h2>
        <p className="text-muted-foreground">
          After making changes in any section, remember to click the "Deploy Changes" button above
          to make your updates visible to all visitors of your portfolio.
        </p>
      </div>
    </div>
  );
}
