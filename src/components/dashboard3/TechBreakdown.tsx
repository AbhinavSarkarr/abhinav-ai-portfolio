import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Treemap } from 'recharts';
import { Chrome, Apple, Monitor, Smartphone, Tablet } from 'lucide-react';

interface BrowserData {
  browser: string;
  sessions: number;
  unique_visitors: number;
}

interface OSData {
  operating_system: string;
  sessions: number;
  unique_visitors: number;
}

interface TechBreakdownProps {
  browsers: BrowserData[];
  operatingSystems: OSData[];
}

const browserColors: Record<string, string> = {
  'chrome': '#4285F4',
  'safari': '#FF9500',  // Safari orange (more visible)
  'firefox': '#FF7139',
  'edge': '#0078D7',
  'opera': '#FF1B2D',
  'samsung internet': '#1428A0',
  'samsung browser': '#1428A0',  // Alternative name
  'android webview': '#3DDC84',
  'other': '#6B7280',
};

const osColors: Record<string, string> = {
  'windows': '#00A4EF',
  'macos': '#A855F7',      // Purple (more visible than grey)
  'macintosh': '#A855F7',  // Alternative name for macOS
  'ios': '#FF9500',        // iOS orange (more visible than black)
  'android': '#3DDC84',
  'linux': '#FCC624',
  'chrome os': '#4285F4',
  'unknown': '#6B7280',    // Grey for unknown
  'other': '#6B7280',
};

function getBrowserColor(browser: string): string {
  const key = browser.toLowerCase();
  return browserColors[key] || browserColors['other'];
}

function getOSColor(os: string): string {
  const key = os.toLowerCase();
  return osColors[key] || osColors['other'];
}

// Combined donut chart showing both browser and OS
export function TechBreakdown({ browsers, operatingSystems }: TechBreakdownProps) {
  const hasBrowsers = browsers && browsers.length > 0;
  const hasOS = operatingSystems && operatingSystems.length > 0;

  if (!hasBrowsers && !hasOS) {
    return (
      <div className="text-center text-muted-foreground py-6">
        <p className="text-sm">No tech data available</p>
      </div>
    );
  }

  // Prepare browser data
  const browserData = (browsers || []).slice(0, 5).map(b => ({
    name: b.browser,
    value: b.sessions,
    color: getBrowserColor(b.browser),
  }));

  // Prepare OS data
  const osData = (operatingSystems || []).slice(0, 5).map(os => ({
    name: os.operating_system,
    value: os.sessions,
    color: getOSColor(os.operating_system),
  }));

  const totalBrowserSessions = browserData.reduce((s, b) => s + b.value, 0);
  const totalOSSessions = osData.reduce((s, o) => s + o.value, 0);

  return (
    <div className="flex items-start gap-3 sm:gap-4">
      {/* Nested Donut Chart - Compact */}
      <div className="flex-shrink-0 w-[90px] h-[90px] sm:w-[120px] sm:h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            {/* Outer ring - Browsers */}
            <Pie
              data={browserData}
              cx="50%"
              cy="50%"
              innerRadius={25}
              outerRadius={40}
              dataKey="value"
              stroke="none"
            >
              {browserData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            {/* Inner ring - OS */}
            <Pie
              data={osData}
              cx="50%"
              cy="50%"
              innerRadius={10}
              outerRadius={22}
              dataKey="value"
              stroke="none"
            >
              {osData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(17, 17, 27, 0.95)',
                border: '1px solid rgba(123, 66, 246, 0.3)',
                borderRadius: '8px',
                fontSize: '11px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend - Side by side */}
      <div className="flex-1 grid grid-cols-2 gap-2 sm:gap-4">
        {/* Browsers */}
        <div>
          <h4 className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-1.5 sm:mb-2">Browsers</h4>
          <div className="space-y-1 sm:space-y-1.5">
            {browserData.slice(0, 3).map((browser) => (
              <div key={browser.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: browser.color }} />
                  <span className="text-[11px] sm:text-sm text-foreground truncate">{browser.name}</span>
                </div>
                <span className="text-[11px] sm:text-sm font-medium text-muted-foreground ml-1">
                  {((browser.value / totalBrowserSessions) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* OS */}
        <div>
          <h4 className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-1.5 sm:mb-2">OS</h4>
          <div className="space-y-1 sm:space-y-1.5">
            {osData.slice(0, 3).map((os) => (
              <div key={os.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: os.color }} />
                  <span className="text-[11px] sm:text-sm text-foreground truncate">{os.name}</span>
                </div>
                <span className="text-[11px] sm:text-sm font-medium text-muted-foreground ml-1">
                  {((os.value / totalOSSessions) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact inline version
export function TechBreakdownCompact({ browsers, operatingSystems }: TechBreakdownProps) {
  const topBrowser = browsers?.[0];
  const topOS = operatingSystems?.[0];

  if (!topBrowser && !topOS) return null;

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      {topBrowser && (
        <div className="flex items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-lg bg-white/5">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0" style={{ backgroundColor: getBrowserColor(topBrowser.browser) }} />
          <span className="text-xs sm:text-sm text-foreground">{topBrowser.browser}</span>
          <span className="text-xs sm:text-sm font-bold text-muted-foreground">{topBrowser.sessions}</span>
        </div>
      )}
      {topOS && (
        <div className="flex items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-lg bg-white/5">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0" style={{ backgroundColor: getOSColor(topOS.operating_system) }} />
          <span className="text-xs sm:text-sm text-foreground">{topOS.operating_system}</span>
          <span className="text-xs sm:text-sm font-bold text-muted-foreground">{topOS.sessions}</span>
        </div>
      )}
    </div>
  );
}

// Stacked bar showing both together
export function TechStackedBar({ browsers, operatingSystems }: TechBreakdownProps) {
  const hasBrowsers = browsers && browsers.length > 0;
  const hasOS = operatingSystems && operatingSystems.length > 0;

  if (!hasBrowsers && !hasOS) return null;

  const browserTotal = browsers?.reduce((s, b) => s + b.sessions, 0) || 0;
  const osTotal = operatingSystems?.reduce((s, o) => s + o.sessions, 0) || 0;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Browser bar */}
      {hasBrowsers && (
        <div>
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-xs sm:text-sm text-muted-foreground">Browsers</span>
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">{browserTotal} sessions</span>
          </div>
          <div className="h-5 sm:h-6 rounded-lg overflow-hidden flex">
            {browsers.slice(0, 5).map((browser, index) => {
              const width = (browser.sessions / browserTotal) * 100;
              return (
                <motion.div
                  key={browser.browser}
                  className="h-full relative group"
                  style={{ width: `${width}%`, backgroundColor: getBrowserColor(browser.browser) }}
                  initial={{ width: 0 }}
                  animate={{ width: `${width}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  title={`${browser.browser}: ${browser.sessions}`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* OS bar */}
      {hasOS && (
        <div>
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-xs sm:text-sm text-muted-foreground">Operating Systems</span>
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">{osTotal} sessions</span>
          </div>
          <div className="h-5 sm:h-6 rounded-lg overflow-hidden flex">
            {operatingSystems.slice(0, 5).map((os, index) => {
              const width = (os.sessions / osTotal) * 100;
              return (
                <motion.div
                  key={os.operating_system}
                  className="h-full relative"
                  style={{ width: `${width}%`, backgroundColor: getOSColor(os.operating_system) }}
                  initial={{ width: 0 }}
                  animate={{ width: `${width}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  title={`${os.operating_system}: ${os.sessions}`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Separate legends for clarity */}
      <div className="space-y-1.5 sm:space-y-2 pt-2">
        {/* Browser legend */}
        {hasBrowsers && (
          <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-4 gap-y-1">
            <span className="text-[10px] sm:text-xs text-muted-foreground/70 w-14 sm:w-16">Browsers:</span>
            {browsers?.slice(0, 5).map(b => (
              <div key={b.browser} className="flex items-center gap-1 sm:gap-1.5">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: getBrowserColor(b.browser) }} />
                <span className="text-[10px] sm:text-xs text-muted-foreground">{b.browser}</span>
              </div>
            ))}
          </div>
        )}
        {/* OS legend */}
        {hasOS && (
          <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-4 gap-y-1">
            <span className="text-[10px] sm:text-xs text-muted-foreground/70 w-14 sm:w-16">OS:</span>
            {operatingSystems?.slice(0, 5).map(os => (
              <div key={os.operating_system} className="flex items-center gap-1 sm:gap-1.5">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: getOSColor(os.operating_system) }} />
                <span className="text-[10px] sm:text-xs text-muted-foreground">{os.operating_system}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
