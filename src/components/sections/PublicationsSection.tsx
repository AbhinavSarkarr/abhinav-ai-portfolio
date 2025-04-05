
import { motion } from 'framer-motion';
import { BookOpen, ExternalLink, Clock } from 'lucide-react';

type Publication = {
  title: string;
  journal: string;
  date: string;
  description: string;
  url?: string;
};

const publications: Publication[] = [
  {
    title: "A Comprehensive Survey on Answer Generation Methods using NLP",
    journal: "NLP Journal (ScienceDirect)",
    date: "2023",
    description: "A detailed analysis of various natural language processing techniques for answer generation in question-answering systems.",
    url: "#"
  }
];

export function PublicationsSection() {
  return (
    <section id="publications" className="relative py-24">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute bottom-1/3 right-0 w-64 h-64 bg-tech-neon/10 rounded-full blur-[80px]" />
      </div>
      
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="section-heading">Publications</h2>
          <p className="text-lg text-muted-foreground mt-6">
            Research papers and academic contributions
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {publications.map((pub, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="glass-card relative overflow-hidden mb-6"
            >
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-tech-neon/50" />
              
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-tech-glass mt-1">
                  <BookOpen className="text-tech-accent" size={24} />
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-wrap justify-between gap-4 mb-2">
                    <h3 className="text-xl font-bold">{pub.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock size={14} />
                      <span>{pub.date}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-tech-accent mb-2">{pub.journal}</p>
                  <p className="text-muted-foreground mb-4">{pub.description}</p>
                  
                  {pub.url && (
                    <a 
                      href={pub.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-1.5 text-tech-accent hover:underline"
                    >
                      Read Publication
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
