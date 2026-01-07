import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Target, Lightbulb, Wrench, CheckCircle2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { portfolioData, ClientProject } from '@/data/portfolioData';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAnalyticsContext } from '@/context/AnalyticsContext';

export default function ClientDetail() {
  const { experienceId, clientId } = useParams<{ experienceId: string; clientId: string }>();
  const navigate = useNavigate();
  const analytics = useAnalyticsContext();
  const startTime = useRef<number>(Date.now());
  const maxScrollDepth = useRef<number>(0);

  // Find the experience and client
  const experience = portfolioData.experiences.find(exp => exp.id === experienceId);
  const client = experience?.clients?.find(c => c.id === clientId);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [clientId]);

  // Track client case study view and engagement
  useEffect(() => {
    if (client && experience) {
      // Track case study open
      analytics.trackClientCaseStudyOpen(
        client.id,
        client.name,
        client.domain,
        experience.title
      );

      // Track domain interest
      analytics.trackDomainInterest(client.domain, client.id, client.name);

      // Track experience level interest
      analytics.trackExperienceLevelInterest(experience.id, experience.title, experience.company);

      startTime.current = Date.now();
    }

    // Track scroll depth
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollDepth = (window.scrollY / scrollHeight) * 100;
      maxScrollDepth.current = Math.max(maxScrollDepth.current, scrollDepth);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);

      // Track engagement on leave
      if (client) {
        const timeSpent = (Date.now() - startTime.current) / 1000;
        analytics.trackClientCaseStudyEngagement(
          client.id,
          client.name,
          client.domain,
          timeSpent,
          maxScrollDepth.current
        );
      }
    };
  }, [client, experience, analytics]);

  if (!experience || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Client project not found</h1>
          <Button onClick={() => navigate('/')}>Go back home</Button>
        </div>
      </div>
    );
  }

  // Parse solution text to render markdown-style bold text
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="text-foreground">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 z-0">
          <motion.div
            className="absolute top-20 left-1/4 w-96 h-96 bg-tech-neon/10 rounded-full blur-[120px]"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-80 h-80 bg-tech-accent/10 rounded-full blur-[100px]"
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          />
        </div>

        <div className="container relative z-10">
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              variant="ghost"
              className="mb-8 hover:bg-tech-glass"
              onClick={() => {
                navigate('/');
                setTimeout(() => {
                  document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
            >
              <ArrowLeft size={18} className="mr-2" />
              Back to Experience
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            {/* Company & Domain Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-tech-neon/20 to-tech-accent/20 border border-tech-accent/30">
                <Building2 size={14} />
                {experience.company}
              </span>
              <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-tech-accent/10 text-tech-accent border border-tech-accent/20">
                {client.domain}
              </span>
              <span className="text-muted-foreground text-sm">
                {experience.period}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {client.name}
            </h1>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {client.shortDescription}
            </p>

            {/* Tech Stack */}
            <div className="flex flex-wrap gap-2">
              {client.techStack.map((tech, i) => (
                <motion.span
                  key={tech}
                  className="px-3 py-1.5 rounded-full bg-tech-glass border border-tech-accent/30 text-sm cursor-pointer hover:border-tech-accent/60 hover:bg-tech-accent/10 transition-all"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => analytics.trackClientTechStackClick(tech, client.id, client.name, client.domain)}
                >
                  {tech}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Case Study Section */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {/* Problem Statement */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <Target className="text-red-400" size={24} />
                </div>
                <h2 className="text-2xl font-bold">Problem Statement</h2>
              </div>
              <div className="glass-card overflow-visible">
                <p className="text-muted-foreground leading-relaxed whitespace-normal break-words">
                  {client.problemStatement}
                </p>
              </div>
            </motion.div>

            {/* Solution */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Lightbulb className="text-green-400" size={24} />
                </div>
                <h2 className="text-2xl font-bold">Solution</h2>
              </div>
              <div className="glass-card overflow-visible">
                <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {renderFormattedText(client.solution)}
                </div>
              </div>
            </motion.div>

            {/* My Contributions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Wrench className="text-blue-400" size={24} />
                </div>
                <h2 className="text-2xl font-bold">My Contributions</h2>
              </div>
              <div className="glass-card">
                <ul className="space-y-4">
                  {client.contributions.map((contribution, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle2 className="text-tech-accent mt-1 flex-shrink-0" size={18} />
                      <span className="text-muted-foreground leading-relaxed">{contribution}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Tech Stack Detail */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Wrench className="text-purple-400" size={24} />
                </div>
                <h2 className="text-2xl font-bold">Technologies Used</h2>
              </div>
              <div className="glass-card">
                <div className="flex flex-wrap gap-3">
                  {client.techStack.map((tech, i) => (
                    <motion.span
                      key={tech}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="px-4 py-2 rounded-lg bg-tech-glass border border-tech-accent/30 text-sm font-medium cursor-pointer hover:border-tech-accent/60 hover:bg-tech-accent/10 transition-all"
                      onClick={() => analytics.trackClientTechStackClick(tech, client.id, client.name, client.domain)}
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 border-t border-tech-accent/10">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h3 className="text-2xl font-bold mb-4">Interested in similar solutions?</h3>
            <p className="text-muted-foreground mb-6">
              Let's discuss how I can help with your AI/ML challenges.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                className="border-tech-accent/30"
                onClick={() => {
                  navigate('/');
                  setTimeout(() => {
                    document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
              >
                View More Work
              </Button>
              <Button
                className="tech-btn"
                onClick={() => {
                  navigate('/');
                  setTimeout(() => {
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
              >
                Get in Touch
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
