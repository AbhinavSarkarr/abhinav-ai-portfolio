
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, Send, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from '@/components/ui/use-toast';

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message sent successfully",
        description: "Thanks for reaching out! I'll get back to you soon.",
      });
      setFormData({ name: '', email: '', message: '' });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <section id="contact" className="relative py-24">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/3 left-0 w-72 h-72 bg-tech-neon/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-tech-accent/5 rounded-full blur-[120px]" />
      </div>
      
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="section-heading">Get In Touch</h2>
          <p className="text-lg text-muted-foreground mt-6">
            Have a question or want to work together? Feel free to reach out!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold mb-4">Contact Information</h3>
              <p className="text-muted-foreground">
                I'm open to discussing AI projects, research collaborations, or job opportunities. 
                Feel free to reach out through any of these channels.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-tech-glass">
                  <Mail className="text-tech-accent" size={20} />
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <a href="mailto:abhinavsarkar53@gmail.com" className="text-muted-foreground hover:text-tech-accent">
                    abhinavsarkar53@gmail.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-tech-glass">
                  <Linkedin className="text-tech-accent" size={20} />
                </div>
                <div>
                  <p className="font-medium">LinkedIn</p>
                  <a 
                    href="https://www.linkedin.com/in/abhinavsarkarrr/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-tech-accent"
                  >
                    abhinavsarkarrr
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-tech-glass">
                  <Github className="text-tech-accent" size={20} />
                </div>
                <div>
                  <p className="font-medium">GitHub</p>
                  <a 
                    href="https://github.com/AbhinavSarkarr" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-tech-accent"
                  >
                    AbhinavSarkarr
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-tech-glass">
                  <span className="text-xl text-tech-accent flex items-center justify-center w-5 h-5" role="img" aria-label="Hugging Face">🤗</span>
                </div>
                <div>
                  <p className="font-medium">Hugging Face</p>
                  <a 
                    href="https://huggingface.co/abhinavsarkar" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-tech-accent"
                  >
                    abhinavsarkar
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
            
            <div className="p-4 glass rounded-xl">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Looking for my resume?</span> Download it from the link below to learn more about my experience and qualifications.
              </p>
              <a 
                href="#" 
                className="flex items-center gap-1.5 mt-2 text-tech-accent hover:underline"
              >
                Download Resume
                <ExternalLink size={14} />
              </a>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <div className="glass-card">
              <h3 className="text-2xl font-bold mb-6">Send a Message</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Your name"
                    className="bg-tech-glass border-tech-neon/20 focus:border-tech-accent"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    className="bg-tech-glass border-tech-neon/20 focus:border-tech-accent"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Your message here..."
                    className="bg-tech-glass border-tech-neon/20 focus:border-tech-accent min-h-[120px]"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="tech-btn w-full flex items-center justify-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>Sending...</>
                  ) : (
                    <>
                      Send Message
                      <Send size={16} />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
