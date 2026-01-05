import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Github, Linkedin, Mail, Send, ExternalLink, MessageSquare, ArrowRight, Sparkles } from 'lucide-react';
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
      color: 'from-red-500 to-orange-500',
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      value: 'abhinavsarkarrr',
      href: 'https://www.linkedin.com/in/abhinavsarkarrr/',
      isExternal: true,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Github,
      label: 'GitHub',
      value: 'AbhinavSarkarr',
      href: 'https://github.com/AbhinavSarkarr',
      isExternal: true,
      color: 'from-gray-500 to-gray-700',
    },
  ];

  return (
    <section id="contact" className="relative py-24 overflow-hidden" ref={sectionRef}>
      {/* Animated background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute top-1/4 left-0 w-96 h-96 bg-tech-neon/10 rounded-full blur-[150px]"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-tech-accent/8 rounded-full blur-[180px]"
          animate={{
            scale: [1, 1.2, 1],
            y: [0, -40, 0],
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
        {/* Section Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <motion.h2 variants={sectionHeading} className="section-heading block">
            Get In Touch
          </motion.h2>

          <div className="mt-8 flex justify-center">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tech-glass border border-tech-accent/30"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Sparkles className="text-tech-accent" size={18} />
              </motion.span>
              <span className="text-sm font-medium">Let's build something amazing</span>
            </motion.div>
          </div>

          <motion.p variants={sectionSubheading} className="text-lg text-muted-foreground mt-6 max-w-2xl mx-auto">
            Have a project in mind or want to discuss AI opportunities?
            I'm always excited to explore new challenges and collaborations.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Left Column - Contact Info */}
          <motion.div
            variants={fadeInLeft}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="space-y-8"
          >
            {/* CTA Card */}
            <motion.div
              className="relative p-8 rounded-3xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-tech-neon/20 via-tech-accent/10 to-tech-highlight/10 rounded-3xl" />
              <div className="absolute inset-0 backdrop-blur-xl rounded-3xl" />

              {/* Animated border */}
              <motion.div
                className="absolute inset-0 rounded-3xl"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(0, 224, 255, 0.3), transparent)',
                  backgroundSize: '200% 100%',
                }}
                animate={{
                  backgroundPosition: ['200% 0', '-200% 0'],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />

              <div className="relative z-10">
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-tech-neon to-tech-accent flex items-center justify-center mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <MessageSquare className="w-8 h-8 text-white" />
                </motion.div>

                <h3 className="text-2xl font-bold mb-3">Let's Talk AI</h3>
                <p className="text-muted-foreground mb-6">
                  Whether you're looking to implement machine learning solutions,
                  fine-tune LLMs, or build intelligent systems - I'm here to help
                  turn your ideas into reality.
                </p>

                <div className="flex flex-wrap gap-3">
                  {['LLM Fine-tuning', 'ML Systems', 'GenAI Apps', 'Data Pipelines'].map((tag, i) => (
                    <motion.span
                      key={tag}
                      className="px-3 py-1 rounded-full text-xs bg-tech-glass border border-tech-accent/30 text-tech-accent"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: 0.4 + i * 0.1 }}
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Contact Links */}
            <motion.div
              className="space-y-4"
              variants={staggerContainer}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
            >
              {contactItems.map((item, index) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  target={item.isExternal ? '_blank' : undefined}
                  rel={item.isExternal ? 'noopener noreferrer' : undefined}
                  variants={staggerItem}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-tech-glass/50 border border-white/5 group hover:border-tech-accent/30 transition-all duration-300"
                  whileHover={{ x: 8, scale: 1.02 }}
                >
                  <motion.div
                    className={`p-3 rounded-xl bg-gradient-to-br ${item.color} group-hover:shadow-lg transition-shadow duration-300`}
                    whileHover={{ rotate: 10 }}
                  >
                    <item.icon className="w-5 h-5 text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-muted-foreground">{item.label}</p>
                    <p className="text-foreground group-hover:text-tech-accent transition-colors">{item.value}</p>
                  </div>
                  <motion.div
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5 text-tech-accent" />
                  </motion.div>
                </motion.a>
              ))}

              {/* Hugging Face */}
              <motion.a
                href="https://huggingface.co/abhinavsarkar"
                target="_blank"
                rel="noopener noreferrer"
                variants={staggerItem}
                className="flex items-center gap-4 p-4 rounded-2xl bg-tech-glass/50 border border-white/5 group hover:border-tech-accent/30 transition-all duration-300"
                whileHover={{ x: 8, scale: 1.02 }}
              >
                <motion.div
                  className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 group-hover:shadow-lg transition-shadow duration-300"
                  whileHover={{ rotate: 10 }}
                >
                  <span className="text-xl">🤗</span>
                </motion.div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-muted-foreground">Hugging Face</p>
                  <p className="text-foreground group-hover:text-tech-accent transition-colors">abhinavsarkar</p>
                </div>
                <motion.div
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5 text-tech-accent" />
                </motion.div>
              </motion.a>
            </motion.div>

            {/* Resume Card */}
            <motion.div
              className="p-6 glass rounded-2xl relative overflow-hidden group cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => window.open("https://drive.google.com/file/d/1kvz-xyhbenuvSjtZr98EC8WMhYjv4pIc/view", "_blank")}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-tech-neon/10 via-tech-accent/10 to-tech-highlight/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-tech-glass border border-tech-accent/30">
                    <span className="text-2xl">📄</span>
                  </div>
                  <div>
                    <p className="font-semibold">Download Resume</p>
                    <p className="text-sm text-muted-foreground">View my full experience & qualifications</p>
                  </div>
                </div>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ExternalLink className="w-5 h-5 text-tech-accent" />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Contact Form */}
          <motion.div
            variants={fadeInRight}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <motion.div
              className="glass-card relative overflow-hidden rounded-3xl"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              {/* Animated background effect */}
              <motion.div
                className="absolute inset-0 opacity-50"
                style={{
                  background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0, 224, 255, 0.1), transparent 50%)',
                }}
              />

              <div className="relative z-10 p-8">
                <div className="flex items-center gap-3 mb-8">
                  <motion.div
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-tech-neon to-tech-accent flex items-center justify-center"
                    whileHover={{ rotate: 10 }}
                  >
                    <Send className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold">Send a Message</h3>
                    <p className="text-sm text-muted-foreground">I'll get back to you within 24 hours</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    <label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-tech-accent" />
                      Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your name"
                      className="bg-tech-glass/50 border-white/10 focus:border-tech-accent h-12 rounded-xl transition-all duration-300 placeholder:text-muted-foreground/50"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </motion.div>

                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.5 }}
                  >
                    <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-tech-accent" />
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your.email@example.com"
                      className="bg-tech-glass/50 border-white/10 focus:border-tech-accent h-12 rounded-xl transition-all duration-300 placeholder:text-muted-foreground/50"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </motion.div>

                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.6 }}
                  >
                    <label htmlFor="message" className="text-sm font-medium flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-tech-accent" />
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell me about your project or idea..."
                      className="bg-tech-glass/50 border-white/10 focus:border-tech-accent min-h-[140px] rounded-xl transition-all duration-300 resize-none placeholder:text-muted-foreground/50"
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.7 }}
                  >
                    <motion.div whileHover={buttonHover} whileTap={buttonTap}>
                      <Button
                        type="submit"
                        className="w-full tech-btn h-14 text-base font-semibold relative overflow-hidden group rounded-xl"
                        disabled={isSubmitting}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-3">
                          {isSubmitting ? (
                            <>
                              <motion.div
                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              />
                              Sending...
                            </>
                          ) : (
                            <>
                              Send Message
                              <motion.div
                                animate={{ x: [0, 5, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              >
                                <Send className="w-5 h-5" />
                              </motion.div>
                            </>
                          )}
                        </span>
                      </Button>
                    </motion.div>
                  </motion.div>
                </form>

                {/* Trust indicators */}
                <motion.div
                  className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-6 text-xs text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ delay: 0.9 }}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Quick Response
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Secure & Private
                  </span>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
