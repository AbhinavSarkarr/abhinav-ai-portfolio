import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ExternalLink, Github } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRecommender } from '@/context/RecommenderContext';
import { useAnalyticsContext } from '@/context/AnalyticsContext';

export const ProjectRecommendation = () => {
  const { recommendation, dismissRecommendation, markFromRecommendation } = useRecommender();
  const { show, project, sourceProject, type } = recommendation;
  const navigate = useNavigate();
  const analytics = useAnalyticsContext();

  // Track which recommendation has been shown (to avoid duplicate tracking)
  const lastTrackedRecommendationRef = useRef<string | null>(null);

  // Track when recommendation is shown
  useEffect(() => {
    if (show && project && sourceProject) {
      const recommendationKey = `${sourceProject.id}-${project.id}`;
      if (lastTrackedRecommendationRef.current !== recommendationKey) {
        lastTrackedRecommendationRef.current = recommendationKey;
        analytics.trackRecommendationShown(
          project.id,
          project.title,
          sourceProject.id,
          1 // position (single recommendation)
        );
      }
    }
  }, [show, project, sourceProject, analytics]);

  if (!project) return null;

  const handleProjectClick = () => {
    // Track recommendation click
    if (project && sourceProject) {
      analytics.trackRecommendationClick(
        project.id,
        project.title,
        sourceProject.id,
        1 // position
      );
    }
    // Mark that user is navigating from a recommendation (40s timer next time)
    markFromRecommendation();
    dismissRecommendation();
    // Navigate to the recommended project's case study
    navigate(`/project/${project.id}`);
  };

  // Generate contextual message based on trigger type
  const getMessage = () => {
    if ((type === 'hover' || type === 'long-press') && sourceProject) {
      return (
        <>
          Since you're interested in <span className="font-semibold text-cyan-400">{sourceProject.title}</span>, you might also like:
        </>
      );
    }
    if (type === 'case-study' && sourceProject) {
      return (
        <>
          Enjoying <span className="font-semibold text-cyan-400">{sourceProject.title}</span>? Check out this similar project:
        </>
      );
    }
    return 'You might be interested in:';
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 max-w-sm mx-auto sm:mx-0"
        >
          <div className="relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-500/20 overflow-hidden">
            {/* Animated gradient border */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20 animate-pulse" />

            {/* Content */}
            <div className="relative p-5">
              {/* Close button */}
              <button
                onClick={dismissRecommendation}
                className="absolute top-3 right-3 p-2 sm:p-1.5 rounded-full bg-gray-700/50 hover:bg-gray-600/50 active:bg-gray-500/50 transition-colors touch-manipulation"
                aria-label="Dismiss recommendation"
              >
                <X className="w-5 h-5 sm:w-4 sm:h-4 text-gray-400" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-xs font-medium text-purple-400 uppercase tracking-wider">
                  AI Recommendation
                </span>
              </div>

              {/* Contextual message */}
              <p className="text-sm text-gray-300 mb-4">
                {getMessage()}
              </p>

              {/* Project card */}
              <div
                onClick={handleProjectClick}
                className="group cursor-pointer bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-purple-500/50 active:border-purple-500/70 transition-all duration-300 touch-manipulation"
              >
                {/* Project image */}
                <div className="relative h-32 rounded-lg overflow-hidden mb-3">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />

                  {/* Category badge */}
                  <span className="absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full bg-purple-500/80 text-white">
                    {project.category.toUpperCase()}
                  </span>
                </div>

                {/* Project info */}
                <h4 className="font-semibold text-white group-hover:text-purple-400 transition-colors mb-2">
                  {project.title}
                </h4>
                <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                  {project.description}
                </p>

                {/* Tech tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {project.technologies.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 text-xs rounded-full bg-gray-700/50 text-gray-300"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 4 && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-gray-700/50 text-gray-400">
                      +{project.technologies.length - 4}
                    </span>
                  )}
                </div>

                {/* Action links */}
                <div className="flex items-center gap-3">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      <Github className="w-3.5 h-3.5" />
                      GitHub
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-cyan-400 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Live Demo
                    </a>
                  )}
                </div>
              </div>

              {/* View project button */}
              <button
                onClick={handleProjectClick}
                className="mt-4 w-full py-3 sm:py-2.5 rounded-lg bg-gradient-to-r from-purple-500/20 to-cyan-500/20 hover:from-purple-500/30 hover:to-cyan-500/30 active:from-purple-500/40 active:to-cyan-500/40 border border-purple-500/30 text-sm font-medium text-white transition-all duration-300 touch-manipulation"
              >
                View Project Details →
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
