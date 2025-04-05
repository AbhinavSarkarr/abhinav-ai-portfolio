
import { motion } from 'framer-motion';
import { Briefcase, Calendar } from 'lucide-react';

type Experience = {
  title: string;
  company: string;
  period: string;
  current: boolean;
  description: string[];
};

const experiences: Experience[] = [
  {
    title: "Artificial Intelligence Engineer",
    company: "Jellyfish Technologies Pvt. Ltd.",
    period: "Apr 2024 – Present",
    current: true,
    description: [
      "Built SaaS platform for custom RAG-based chatbot creation using Qdrant and Llama3-70B",
      "Developed system to cross-verify services in insurance documents",
      "Created automated complaint registration system using Whisper v3 + fine-tuned GPT-4"
    ]
  },
  {
    title: "Deep Learning Intern",
    company: "Bhramaand Pvt. Ltd.",
    period: "Jun – Sep 2023",
    current: false,
    description: [
      "Designed zero-shot classification system with bart-large-mnli",
      "Built modules for real-time news story generation",
      "Developed financial forecasting models using XGBoost"
    ]
  }
];

export function ExperienceSection() {
  return (
    <section id="experience" className="relative py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="section-heading">Work Experience</h2>
          <p className="text-lg text-muted-foreground mt-6">
            My professional journey in AI and machine learning
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {experiences.map((exp, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative pl-8 pb-12 last:pb-0"
            >
              {/* Timeline line */}
              <div className="absolute left-0 top-0 bottom-0 w-px bg-tech-neon/30" />

              {/* Timeline dot */}
              <div className={`absolute left-0 top-1 w-5 h-5 rounded-full -translate-x-1/2 border-2 ${
                exp.current ? 'bg-tech-neon border-tech-neon animate-pulse-soft' : 'bg-background border-tech-neon/50'
              }`} />

              {/* Content */}
              <div className="glass-card">
                <div className="flex flex-wrap gap-4 items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{exp.title}</h3>
                    <p className="text-tech-accent">{exp.company}</p>
                  </div>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-tech-glass text-sm font-medium">
                    <Calendar size={14} />
                    {exp.period}
                    {exp.current && (
                      <span className="w-2 h-2 rounded-full bg-tech-accent animate-pulse-soft" />
                    )}
                  </span>
                </div>

                <ul className="space-y-2">
                  {exp.description.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Briefcase size={16} className="mt-1 flex-shrink-0 text-tech-accent" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
