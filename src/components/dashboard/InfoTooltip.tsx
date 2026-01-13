import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Info } from 'lucide-react';

interface InfoTooltipProps {
  term: string;
  definition: string;
  children?: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  variant?: 'icon' | 'inline' | 'underline';
}

// Common analytics terms dictionary for non-technical stakeholders
export const analyticsDictionary: Record<string, string> = {
  'session': 'A single visit to your website. If someone leaves and comes back later, that counts as a new session.',
  'bounce_rate': 'Percentage of visitors who leave after viewing only one page without taking any action.',
  'engagement_rate': 'Percentage of visitors who interacted with the site (clicked, scrolled, or spent meaningful time).',
  'conversion': 'When a visitor takes a desired action like downloading your resume or submitting a contact form.',
  'traffic_source': 'Where your visitors came from - could be search engines, social media, direct links, or other websites.',
  'cta': 'Call-to-Action - buttons or links that encourage visitors to take action like "Contact Me" or "View Resume".',
  'funnel': 'The journey visitors take from first seeing something to completing an action. Shows where people drop off.',
  'unique_visitors': 'Individual people who visited your site. One person visiting 5 times still counts as 1 unique visitor.',
  'page_views': 'Total number of pages viewed. One person can view multiple pages.',
  'avg_session_duration': 'Average time visitors spend on your site during a single visit.',
  'pages_per_session': 'Average number of pages a visitor views during one visit.',
  'referral': 'Visitors who came to your site by clicking a link on another website.',
  'organic': 'Visitors who found your site through search engines like Google without paid advertising.',
  'direct': 'Visitors who typed your website address directly or used a bookmark.',
  'social': 'Visitors who came from social media platforms like LinkedIn, Twitter, or Facebook.',
  'device_category': 'Whether visitors used a desktop computer, mobile phone, or tablet.',
  'health_score': 'An overall grade (0-100) measuring how well your portfolio is performing based on multiple factors.',
  'engagement_score': 'A calculated score showing how engaged visitors are with your content.',
  'high_intent': 'Visitors showing strong interest, like downloading your resume or viewing multiple projects.',
  'converters': 'Visitors who completed a key action like submitting a contact form.',
};

export function InfoTooltip({
  term,
  definition,
  children,
  position = 'top',
  variant = 'icon',
}: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-800 dark:border-t-gray-700 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 dark:border-b-gray-700 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-800 dark:border-l-gray-700 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-800 dark:border-r-gray-700 border-t-transparent border-b-transparent border-l-transparent',
  };

  const renderTrigger = () => {
    switch (variant) {
      case 'icon':
        return (
          <button
            className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-muted/50 hover:bg-muted transition-colors"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            onClick={() => setIsOpen(!isOpen)}
          >
            <HelpCircle size={10} className="text-muted-foreground" />
          </button>
        );
      case 'inline':
        return (
          <span
            className="inline-flex items-center gap-1 cursor-help"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            {children || term}
            <Info size={12} className="text-muted-foreground" />
          </span>
        );
      case 'underline':
        return (
          <span
            className="border-b border-dashed border-muted-foreground/50 cursor-help"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            {children || term}
          </span>
        );
      default:
        return children;
    }
  };

  return (
    <span className="relative inline-flex items-center">
      {renderTrigger()}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`absolute z-50 ${positionClasses[position]}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <div className="relative bg-gray-800 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 max-w-[240px] shadow-xl">
              <div className="font-semibold text-tech-accent mb-1">{term}</div>
              <div className="leading-relaxed text-gray-200">{definition}</div>
              {/* Arrow */}
              <div className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

// Helper component for common metrics with tooltips
interface MetricWithInfoProps {
  label: string;
  value: string | number;
  termKey?: keyof typeof analyticsDictionary;
  customDefinition?: string;
  className?: string;
}

export function MetricWithInfo({
  label,
  value,
  termKey,
  customDefinition,
  className = '',
}: MetricWithInfoProps) {
  const definition = customDefinition || (termKey && analyticsDictionary[termKey]) || '';

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-muted-foreground">{label}</span>
        {definition && (
          <InfoTooltip term={label} definition={definition} variant="icon" />
        )}
      </div>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}
