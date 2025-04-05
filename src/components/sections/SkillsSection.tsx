
import { motion } from 'framer-motion';

type SkillCategory = {
  category: string;
  skills: string[];
};

const skillCategories: SkillCategory[] = [
  {
    category: "Libraries",
    skills: ["Keras", "NLTK", "spaCy", "OpenCV", "Transformers", "XGBoost"]
  },
  {
    category: "Frameworks",
    skills: ["Pandas", "Numpy", "TensorFlow", "Langchain", "Scikit-learn", "FastAPI", "PyTorch"]
  },
  {
    category: "Databases",
    skills: ["MySQL", "Redis", "ChromaDB", "Qdrant", "Pinecone"]
  },
  {
    category: "Tools",
    skills: ["Docker", "RabbitMQ", "GitHub", "CI/CD"]
  }
];

export function SkillsSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section id="skills" className="relative py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="section-heading">Technical Skills</h2>
          <p className="text-lg text-muted-foreground mt-6">
            My technical toolkit for building AI and ML solutions
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {skillCategories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass-card"
            >
              <h3 className="text-xl font-bold mb-4">{category.category}</h3>
              
              <motion.div 
                className="grid grid-cols-2 gap-2"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {category.skills.map((skill, idx) => (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    className="flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-tech-accent" />
                    <span className="text-sm">{skill}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 p-8 glass rounded-2xl max-w-3xl mx-auto text-center"
        >
          <h3 className="text-2xl font-bold mb-3">
            <span className="bg-gradient-tech bg-clip-text text-transparent">
              Looking to collaborate?
            </span>
          </h3>
          <p className="text-muted-foreground mb-6">
            I'm always interested in challenging AI projects and opportunities to expand my skills.
          </p>
          <a 
            href="#contact" 
            className="tech-btn inline-block"
          >
            Get in touch
          </a>
        </motion.div>
      </div>
    </section>
  );
}
