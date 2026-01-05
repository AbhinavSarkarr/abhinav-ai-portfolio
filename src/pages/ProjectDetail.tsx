import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Github, Globe, ExternalLink, CheckCircle2, Lightbulb, Target, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { portfolioData } from '@/data/portfolioData';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useRecommender } from '@/context/RecommenderContext';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { trackCaseStudyView, trackCaseStudyLeave } = useRecommender();

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Track case study view - triggers recommendation after 6 seconds
  useEffect(() => {
    if (id) {
      trackCaseStudyView(id);
    }

    return () => {
      trackCaseStudyLeave();
    };
  }, [id, trackCaseStudyView, trackCaseStudyLeave]);

  const project = portfolioData.projects.find(p => p.id === id);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project not found</h1>
          <Button onClick={() => navigate('/')}>Go back home</Button>
        </div>
      </div>
    );
  }

  const categoryColors = {
    llm: 'from-purple-500 to-pink-500',
    ml: 'from-blue-500 to-cyan-500',
    genai: 'from-green-500 to-emerald-500',
    fullstack: 'from-orange-500 to-yellow-500',
  };

  const categoryLabels = {
    llm: 'Large Language Models',
    ml: 'Machine Learning',
    genai: 'Generative AI',
    fullstack: 'Full Stack',
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
                  document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
            >
              <ArrowLeft size={18} className="mr-2" />
              Back to Projects
            </Button>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Project Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Category Badge */}
              <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r ${categoryColors[project.category]} text-white mb-4`}>
                {categoryLabels[project.category]}
              </span>

              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {project.title}
              </h1>

              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                {project.description}
              </p>

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-2 mb-8">
                {project.technologies.map((tech, i) => (
                  <motion.span
                    key={tech}
                    className="px-3 py-1.5 rounded-full bg-tech-glass border border-tech-accent/30 text-sm"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {tech}
                  </motion.span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                {project.github && (
                  <motion.a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button className="bg-tech-glass border border-tech-accent/30 hover:bg-tech-accent/20">
                      <Github size={18} className="mr-2" />
                      View Code
                    </Button>
                  </motion.a>
                )}
                {project.liveUrl && (
                  <motion.a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button className="tech-btn">
                      <Globe size={18} className="mr-2" />
                      Live Demo
                    </Button>
                  </motion.a>
                )}
              </div>
            </motion.div>

            {/* Project Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden border border-tech-accent/20 shadow-2xl shadow-tech-neon/10">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-64 md:h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              </div>

              {/* Decorative elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-24 h-24 border-2 border-tech-accent/30 rounded-2xl"
                animate={{ rotate: [0, 10, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
              />
              <motion.div
                className="absolute -bottom-4 -left-4 w-16 h-16 bg-tech-neon/20 rounded-full blur-xl"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </motion.div>
          </div>
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
              <div className="glass-card">
                <p className="text-muted-foreground leading-relaxed">
                  {project.caseStudy.problemStatement}
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
              <div className="glass-card">
                <p className="text-muted-foreground leading-relaxed">
                  {project.caseStudy.solution}
                </p>
              </div>
            </motion.div>

            {/* Key Features */}
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
                <h2 className="text-2xl font-bold">Key Features</h2>
              </div>
              <div className="glass-card">
                <ul className="space-y-3">
                  {project.caseStudy.keyFeatures.map((feature, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle2 className="text-tech-accent mt-0.5 flex-shrink-0" size={18} />
                      <span className="text-muted-foreground">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <CheckCircle2 className="text-yellow-400" size={24} />
                </div>
                <h2 className="text-2xl font-bold">Achievements</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {project.caseStudy.achievements.map((achievement, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card flex items-center gap-3"
                  >
                    <div className="w-2 h-2 rounded-full bg-tech-accent flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{achievement}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Technical Details */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <ExternalLink className="text-purple-400" size={24} />
                </div>
                <h2 className="text-2xl font-bold">Technical Details</h2>
              </div>
              <div className="glass-card border-l-4 border-tech-accent">
                <p className="text-muted-foreground leading-relaxed font-mono text-sm">
                  {project.caseStudy.techDetails}
                </p>
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
            <h3 className="text-2xl font-bold mb-4">Interested in this project?</h3>
            <p className="text-muted-foreground mb-6">
              Check out the code or get in touch to discuss more.
            </p>
            <div className="flex justify-center gap-4">
              {project.github && (
                <Button
                  variant="outline"
                  className="border-tech-accent/30"
                  onClick={() => window.open(project.github, '_blank')}
                >
                  <Github size={18} className="mr-2" />
                  View Repository
                </Button>
              )}
              <Button
                className="tech-btn"
                onClick={() => navigate('/#contact')}
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
