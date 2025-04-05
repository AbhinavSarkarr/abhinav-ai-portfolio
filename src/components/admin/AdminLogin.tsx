
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock } from "lucide-react";

const fadeInUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: custom * 0.1,
      ease: "easeOut"
    }
  })
};

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check if already authenticated when component mounts
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError("");
    
    try {
      // This would be replaced with an actual API call
      // For demo purposes, we're using hardcoded credentials
      if (email === "admin@abhinav.ai" && password === "admin123") {
        localStorage.setItem("adminToken", "mock-jwt-token");
        toast({
          title: "Login successful",
          description: "Welcome to the admin panel.",
        });
        console.log("Login successful, navigating to /admin");
        // Force navigation to admin panel
        setTimeout(() => {
          navigate("/admin", { replace: true });
        }, 500);
      } else {
        setError("Invalid email or password.");
      }
    } catch (err) {
      setError("An error occurred during login.");
      console.error(err);
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <motion.div 
          className="mb-8 text-center"
          variants={fadeInUpVariants}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          <motion.div 
            className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full glass border border-tech-accent/30 shadow-lg shadow-tech-neon/20"
          >
            <Lock className="w-8 h-8 text-tech-accent" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-tech bg-clip-text text-transparent">
            Admin Access
          </h1>
          <p className="text-muted-foreground">
            Login to manage your portfolio content
          </p>
        </motion.div>
        
        <motion.div 
          className="glass border border-white/10 rounded-xl p-6 shadow-lg"
          variants={fadeInUpVariants}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <motion.div 
              className="space-y-2"
              variants={fadeInUpVariants}
              initial="hidden"
              animate="visible"
              custom={2}
            >
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@abhinav.ai"
                required
                className="bg-background/50"
              />
            </motion.div>
            
            <motion.div 
              className="space-y-2"
              variants={fadeInUpVariants}
              initial="hidden"
              animate="visible"
              custom={3}
            >
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Button variant="link" className="p-0 h-auto text-xs">
                  Forgot password?
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-background/50"
              />
            </motion.div>
            
            <motion.div
              variants={fadeInUpVariants}
              initial="hidden"
              animate="visible"
              custom={4}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                className="tech-btn w-full"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </motion.div>
          </form>
        </motion.div>
        
        <motion.div 
          className="mt-8 text-center text-sm text-muted-foreground"
          variants={fadeInUpVariants}
          initial="hidden"
          animate="visible"
          custom={5}
        >
          <p>
            Not an admin?{" "}
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => navigate("/")}
            >
              Return to website
            </Button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
