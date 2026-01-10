import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Menu, X } from 'lucide-react';
import { portfolioData } from '@/data/portfolioData';

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Pipeline", href: "#data-pipeline" },
  { name: "Experience", href: "#experience" },
  { name: "Projects", href: "#projects" },
  { name: "Skills", href: "#skills" },
  { name: "Publications", href: "#publications" },
  { name: "Contact", href: "#contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const { scrollY } = useScroll();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark') ||
                !document.documentElement.classList.contains('light'));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const navbarBackground = useTransform(
    scrollY,
    [0, 100],
    isDark
      ? ['rgba(10, 10, 20, 0)', 'rgba(10, 10, 20, 0.85)']
      : ['rgba(248, 250, 252, 0)', 'rgba(248, 250, 252, 0.9)']
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Update active section based on scroll position
      const sections = navLinks.map(link => link.href.substring(1));
      for (const section of sections.reverse()) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      // Offset for fixed navbar height
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
    setMobileMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ backgroundColor: navbarBackground }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? `backdrop-blur-xl shadow-lg py-3 border-b ${isDark ? 'shadow-tech-neon/5 border-white/5' : 'shadow-purple-500/10 border-gray-200/50'}`
          : 'py-5'
      }`}
    >
      <div className="container flex items-center justify-between">
        <motion.a
          href="#home"
          onClick={(e) => handleNavClick(e, '#home')}
          className="text-2xl font-bold bg-gradient-tech bg-clip-text text-transparent"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          Abhinav Sarkar
        </motion.a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link, index) => (
            <motion.a
              key={link.name}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05, duration: 0.4 }}
              className={`relative px-4 py-2 font-medium text-sm transition-colors duration-300 rounded-lg
                ${activeSection === link.href.substring(1)
                  ? 'text-tech-accent'
                  : `text-muted-foreground ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`
                }`}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {link.name}
              {activeSection === link.href.substring(1) && (
                <motion.div
                  layoutId="activeSection"
                  className="absolute inset-0 bg-tech-accent/10 rounded-lg border border-tech-accent/20"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </motion.a>
          ))}
          <motion.a
            href={portfolioData.hero.resumeLink}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="ml-2"
          >
            <Button className="tech-btn">Resume</Button>
          </motion.a>
        </nav>

        {/* Mobile Menu Button */}
        <motion.button
          className={`md:hidden p-2 text-tech-accent rounded-lg transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
        >
          <AnimatePresence mode="wait">
            {mobileMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X size={24} />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu size={24} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`md:hidden overflow-hidden backdrop-blur-xl mx-4 mt-2 rounded-2xl border ${isDark ? 'bg-background/80 border-white/10' : 'bg-white/90 border-gray-200/50'}`}
          >
            <motion.div
              className="flex flex-col p-4 gap-1"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                visible: {
                  transition: { staggerChildren: 0.05, delayChildren: 0.1 }
                },
                hidden: {
                  transition: { staggerChildren: 0.03, staggerDirection: -1 }
                }
              }}
            >
              {navLinks.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    activeSection === link.href.substring(1)
                      ? 'bg-tech-accent/10 text-tech-accent border border-tech-accent/20'
                      : isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'
                  }`}
                  variants={{
                    visible: { opacity: 1, x: 0, scale: 1 },
                    hidden: { opacity: 0, x: -20, scale: 0.95 }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {link.name}
                </motion.a>
              ))}
              <motion.a
                href={portfolioData.hero.resumeLink}
                target="_blank"
                rel="noopener noreferrer"
                variants={{
                  visible: { opacity: 1, x: 0, scale: 1 },
                  hidden: { opacity: 0, x: -20, scale: 0.95 }
                }}
              >
                <Button className="mt-2 tech-btn w-full">Resume</Button>
              </motion.a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
