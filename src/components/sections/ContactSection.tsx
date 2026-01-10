import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Github, Linkedin, Mail, Send, ExternalLink, MessageSquare, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from '@/components/ui/use-toast';
import { useAnalyticsContext } from '@/context/AnalyticsContext';
import { portfolioData } from '@/data/portfolioData';
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
  const [hasStartedForm, setHasStartedForm] = useState(false);
  const analytics = useAnalyticsContext();

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, {
    once: true,
    margin: '-100px',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Track form start on first interaction
    if (!hasStartedForm) {
      setHasStartedForm(true);
      analytics.trackContactFormStart();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Track form submission
    analytics.trackContactFormSubmit({
      hasName: !!formData.name.trim(),
      hasEmail: !!formData.email.trim(),
      hasMessage: !!formData.message.trim(),
    });

    try {
      // Submit to Netlify Forms
      const formBody = new URLSearchParams({
        'form-name': 'contact',
        name: formData.name,
        email: formData.email,
        message: formData.message,
      }).toString();

      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody,
      });

      if (response.ok) {
        toast({
          title: "Message sent successfully",
          description: "Thanks for reaching out! I'll get back to you soon.",
        });
        setFormData({ name: '', email: '', message: '' });
        setHasStartedForm(false);
      } else {
        console.error('Form submission failed:', response.status, response.statusText);
        throw new Error('Form submission failed');
      }
    } catch (error) {
      console.error('Form error:', error);
      toast({
        title: "Failed to send message",
        description: "Please try again or email me directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
    <section id="contact" className="relative py-8 sm:py-24 overflow-hidden" ref={sectionRef}>
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
          className="max-w-3xl mx-auto text-center mb-6 sm:mb-16"
        >
          <motion.h2 variants={sectionHeading} className="section-heading block">
            Get In Touch
          </motion.h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 max-w-6xl mx-auto">
          {/* Left Column - Contact Info */}
          <motion.div
            variants={fadeInLeft}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="space-y-4 sm:space-y-8"
          >
            {/* CTA Card */}
            <motion.div
              className="relative p-4 sm:p-8 rounded-2xl sm:rounded-3xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-tech-neon/20 via-tech-accent/10 to-tech-highlight/10 rounded-2xl sm:rounded-3xl" />
              <div className="absolute inset-0 backdrop-blur-xl rounded-2xl sm:rounded-3xl" />

              {/* Animated border */}
              <motion.div
                className="absolute inset-0 rounded-2xl sm:rounded-3xl"
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
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-tech-neon to-tech-accent flex items-center justify-center mb-4 sm:mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </motion.div>

                <h3 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-3">Let's Talk AI</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                  Whether you're looking to implement machine learning solutions,
                  fine-tune LLMs, or build intelligent systems - I'm here to help
                  turn your ideas into reality.
                </p>

                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {['LLM Fine-tuning', 'ML Systems', 'GenAI Apps', 'Data Pipelines'].map((tag, i) => (
                    <motion.span
                      key={tag}
                      className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs bg-tech-glass border border-tech-accent/30 text-tech-accent"
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
              className="space-y-3 sm:space-y-4"
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
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-tech-glass/50 border border-white/5 group hover:border-tech-accent/30 transition-all duration-300"
                  whileHover={{ x: 8, scale: 1.02 }}
                  onClick={() => analytics.trackSocialClick(item.label, item.href)}
                >
                  <motion.div
                    className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${item.color} group-hover:shadow-lg transition-shadow duration-300`}
                    whileHover={{ rotate: 10 }}
                  >
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs sm:text-sm text-muted-foreground">{item.label}</p>
                    <p className="text-sm sm:text-base text-foreground group-hover:text-tech-accent transition-colors truncate">{item.value}</p>
                  </div>
                  <motion.div
                    className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity"
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
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-tech-glass/50 border border-white/5 group hover:border-tech-accent/30 transition-all duration-300"
                whileHover={{ x: 8, scale: 1.02 }}
                onClick={() => analytics.trackSocialClick('Hugging Face', 'https://huggingface.co/abhinavsarkar')}
              >
                <motion.div
                  className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 group-hover:shadow-lg transition-shadow duration-300"
                  whileHover={{ rotate: 10 }}
                >
                  <span className="text-base sm:text-xl">🤗</span>
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs sm:text-sm text-muted-foreground">Hugging Face</p>
                  <p className="text-sm sm:text-base text-foreground group-hover:text-tech-accent transition-colors">abhinavsarkar</p>
                </div>
                <motion.div
                  className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5 text-tech-accent" />
                </motion.div>
              </motion.a>
            </motion.div>

            {/* Resume Card */}
            <motion.div
              className="p-4 sm:p-6 glass rounded-xl sm:rounded-2xl relative overflow-hidden group cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                analytics.trackResumeDownload();
                window.open(portfolioData.hero.resumeLink, "_blank");
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-tech-neon/10 via-tech-accent/10 to-tech-highlight/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-tech-glass border border-tech-accent/30">
                    <span className="text-xl sm:text-2xl">📄</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm sm:text-base">Download Resume</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">View my full experience & qualifications</p>
                  </div>
                </div>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-tech-accent" />
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
              className="glass-card relative overflow-hidden rounded-2xl sm:rounded-3xl"
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

              <div className="relative z-10 p-4 sm:p-8">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-8">
                  <motion.div
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-tech-neon to-tech-accent flex items-center justify-center"
                    whileHover={{ rotate: 10 }}
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-base sm:text-xl font-bold">Send a Message</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">I'll get back to you within 24 hours</p>
                  </div>
                </div>

                <form
                  name="contact"
                  method="POST"
                  data-netlify="true"
                  onSubmit={handleSubmit}
                  className="space-y-4 sm:space-y-6"
                >
                  <input type="hidden" name="form-name" value="contact" />
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
                      className="bg-tech-glass/50 border-white/10 focus:border-tech-accent h-10 sm:h-12 rounded-lg sm:rounded-xl transition-all duration-300 placeholder:text-muted-foreground/50 text-sm sm:text-base"
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
                      className="bg-tech-glass/50 border-white/10 focus:border-tech-accent h-10 sm:h-12 rounded-lg sm:rounded-xl transition-all duration-300 placeholder:text-muted-foreground/50 text-sm sm:text-base"
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
                      className="bg-tech-glass/50 border-white/10 focus:border-tech-accent min-h-[100px] sm:min-h-[140px] rounded-lg sm:rounded-xl transition-all duration-300 resize-none placeholder:text-muted-foreground/50 text-sm sm:text-base"
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
                        className="w-full tech-btn h-11 sm:h-14 text-sm sm:text-base font-semibold relative overflow-hidden group rounded-lg sm:rounded-xl"
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
                  className="mt-4 sm:mt-8 pt-4 sm:pt-6 border-t border-white/5 flex items-center justify-center gap-4 sm:gap-6 text-[10px] sm:text-xs text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ delay: 0.9 }}
                >
                  <span className="flex items-center gap-1 sm:gap-1.5">
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-green-500" />
                    Quick Response
                  </span>
                  <span className="flex items-center gap-1 sm:gap-1.5">
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-blue-500" />
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
