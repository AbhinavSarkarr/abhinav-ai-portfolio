import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Github, Linkedin, Mail, Send, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from '@/components/ui/use-toast';
import {
  staggerContainer,
  staggerItem,
  fadeInLeft,
  fadeInRight,
  sectionHeading,
  sectionSubheading,
  buttonHover,
  buttonTap,
} from '@/lib/animations';

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, {
    once: true,
    margin: '-100px',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      toast({
        title: "Message sent successfully",
        description: "Thanks for reaching out! I'll get back to you soon.",
      });
      setFormData({ name: '', email: '', message: '' });
      setIsSubmitting(false);
    }, 1500);
  };

  const contactItems = [
    {
      icon: Mail,
      label: 'Email',
      value: 'abhinavsarkar53@gmail.com',
      href: 'mailto:abhinavsarkar53@gmail.com',
      isExternal: false,
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      value: 'abhinavsarkarrr',
      href: 'https://www.linkedin.com/in/abhinavsarkarrr/',
      isExternal: true,
    },
    {
      icon: Github,
      label: 'GitHub',
      value: 'AbhinavSarkarr',
      href: 'https://github.com/AbhinavSarkarr',
      isExternal: true,
    },
  ];

  return (
    <section id="contact" className="relative py-24" ref={sectionRef}>
      {/* Animated background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          className="absolute top-1/3 left-0 w-72 h-72 bg-tech-neon/10 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-tech-accent/5 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
      </div>

      <div className="container relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <motion.h2 variants={sectionHeading} className="section-heading">
            Get In Touch
          </motion.h2>
          <motion.p variants={sectionSubheading} className="text-lg text-muted-foreground mt-6">
            Have a question or want to work together? Feel free to reach out!
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <motion.div
            variants={fadeInLeft}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="lg:col-span-2 space-y-8"
          >
            <div>
              <motion.h3
                className="text-2xl font-bold mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Contact Information
              </motion.h3>
              <motion.p
                className="text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                I'm open to discussing AI projects, research collaborations, or job opportunities.
                Feel free to reach out through any of these channels.
              </motion.p>
            </div>

            <motion.div
              className="space-y-4"
              variants={staggerContainer}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
            >
              {contactItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  variants={staggerItem}
                  className="flex items-center gap-4 group"
                  whileHover={{ x: 8, transition: { duration: 0.2 } }}
                >
                  <motion.div
                    className="p-3 rounded-full bg-tech-glass group-hover:bg-tech-accent/20 transition-colors duration-300"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    <item.icon className="text-tech-accent" size={20} />
                  </motion.div>
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <a
                      href={item.href}
                      target={item.isExternal ? '_blank' : undefined}
                      rel={item.isExternal ? 'noopener noreferrer' : undefined}
                      className="flex items-center gap-1.5 text-muted-foreground hover:text-tech-accent transition-colors duration-300"
                    >
                      {item.value}
                      {item.isExternal && <ExternalLink size={14} />}
                    </a>
                  </div>
                </motion.div>
              ))}

              {/* Hugging Face */}
              <motion.div
                variants={staggerItem}
                className="flex items-center gap-4 group"
                whileHover={{ x: 8, transition: { duration: 0.2 } }}
              >
                <motion.div
                  className="p-3 rounded-full bg-tech-glass group-hover:bg-tech-accent/20 transition-colors duration-300"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                >
                  <span className="text-xl text-tech-accent flex items-center justify-center w-5 h-5" role="img" aria-label="Hugging Face">🤗</span>
                </motion.div>
                <div>
                  <p className="font-medium">Hugging Face</p>
                  <a
                    href="https://huggingface.co/abhinavsarkar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-tech-accent transition-colors duration-300"
                  >
                    abhinavsarkar
                    <ExternalLink size={14} />
                  </a>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              className="p-4 glass rounded-xl relative overflow-hidden group"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-tech-neon/10 to-tech-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                initial={false}
              />
              <div className="relative z-10">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Looking for my resume?</span> Download it from the link below to learn more about my experience and qualifications.
                </p>
                <motion.a
                  href="https://drive.google.com/file/d/1kvz-xyhbenuvSjtZr98EC8WMhYjv4pIc/view"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 mt-2 text-tech-accent hover:text-tech-neon transition-colors duration-300"
                  whileHover={{ x: 5 }}
                >
                  Download Resume
                  <motion.span
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <ExternalLink size={14} />
                  </motion.span>
                </motion.a>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            variants={fadeInRight}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="lg:col-span-3"
          >
            <motion.div
              className="glass-card relative overflow-hidden"
              whileHover={{ scale: 1.01, transition: { duration: 0.3 } }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-tech-neon/5 to-tech-accent/5 opacity-0 hover:opacity-100 transition-opacity duration-500"
                initial={false}
              />

              <div className="relative z-10">
                <motion.h3
                  className="text-2xl font-bold mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  Send a Message
                </motion.h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    <label htmlFor="name" className="text-sm font-medium">
                      Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your name"
                      className="bg-tech-glass border-tech-neon/20 focus:border-tech-accent transition-all duration-300"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </motion.div>

                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                  >
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your.email@example.com"
                      className="bg-tech-glass border-tech-neon/20 focus:border-tech-accent transition-all duration-300"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </motion.div>

                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                  >
                    <label htmlFor="message" className="text-sm font-medium">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Your message here..."
                      className="bg-tech-glass border-tech-neon/20 focus:border-tech-accent min-h-[120px] transition-all duration-300"
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    transition={{ duration: 0.4, delay: 0.7 }}
                    whileHover={buttonHover}
                    whileTap={buttonTap}
                  >
                    <Button
                      type="submit"
                      className="tech-btn w-full flex items-center justify-center gap-2 relative overflow-hidden group"
                      disabled={isSubmitting}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {isSubmitting ? (
                          <>
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                              ⏳
                            </motion.span>
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Message
                            <motion.span
                              animate={{ x: [0, 3, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                            >
                              <Send size={16} />
                            </motion.span>
                          </>
                        )}
                      </span>
                    </Button>
                  </motion.div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
