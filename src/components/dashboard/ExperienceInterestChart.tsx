import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import { ExperienceRanking } from '@/hooks/useDashboardData';
import { chartTheme, tooltipStyle, axisStyle, gridStyle, chartColorPalette } from '@/lib/chartTheme';
import { Briefcase, Trophy, Medal, Award } from 'lucide-react';

type ExperienceInterestChartProps = {
  data: ExperienceRanking[];
  height?: number;
};

const RANK_ICONS = [Trophy, Medal, Award];

export function ExperienceInterestChart({ data, height = 280 }: ExperienceInterestChartProps) {
  const enrichedData = data.map((exp, index) => ({
    ...exp,
    color: chartColorPalette[index % chartColorPalette.length],
    displayName: `${exp.role_title} @ ${exp.company_name}`,
    shortName: exp.company_name,
  }));

  const maxScore = Math.max(...data.map(d => d.interest_score));

  return (
    <div className="space-y-6">
      {/* Bar Chart */}
      <div>
        <h4 className="text-sm font-medium text-black dark:text-white mb-3">
          Experience Interest Ranking
        </h4>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={enrichedData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid {...gridStyle} horizontal={false} />
            <XAxis
              type="number"
              tick={axisStyle.tick}
              axisLine={axisStyle.axisLine}
              tickLine={axisStyle.tickLine}
              domain={[0, Math.ceil(maxScore * 1.1)]}
            />
            <YAxis
              type="category"
              dataKey="shortName"
              tick={axisStyle.tick}
              axisLine={false}
              tickLine={false}
              width={80}
            />
            <Tooltip
              contentStyle={tooltipStyle.contentStyle}
              labelStyle={tooltipStyle.labelStyle}
              content={({ payload }) => {
                if (!payload?.[0]?.payload) return null;
                const exp = payload[0].payload as typeof enrichedData[0];
                return (
                  <div className="p-3 rounded-xl bg-[rgba(10,4,38,0.95)] border border-white/20">
                    <p className="font-semibold text-black dark:text-white">{exp.role_title}</p>
                    <p className="text-sm text-muted-foreground mb-2">@ {exp.company_name}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <span>
                        <span className="text-muted-foreground">Rank:</span>{' '}
                        <span className="text-black dark:text-white font-semibold">#{exp.interest_rank}</span>
                      </span>
                      <span>
                        <span className="text-muted-foreground">Score:</span>{' '}
                        <span className="text-tech-neon font-semibold">{exp.interest_score}</span>
                      </span>
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="interest_score" radius={[0, 6, 6, 0]} maxBarSize={30}>
              {enrichedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  style={{ filter: `drop-shadow(0 0 6px ${entry.color}50)` }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Experience Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {enrichedData.map((exp, index) => {
          const RankIcon = RANK_ICONS[index] || Briefcase;
          const isTopRank = index < 3;

          return (
            <motion.div
              key={`${exp.role_title}-${exp.company_name}`}
              className={`p-4 rounded-xl border transition-all ${
                isTopRank
                  ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/20'
                  : 'bg-white/5 border-white/10'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: `${exp.color}20`,
                    boxShadow: isTopRank ? `0 0 20px ${exp.color}30` : 'none',
                  }}
                >
                  <RankIcon
                    size={22}
                    style={{
                      color: isTopRank
                        ? index === 0
                          ? '#FFD700'
                          : index === 1
                          ? '#C0C0C0'
                          : '#CD7F32'
                        : exp.color,
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${exp.color}20`, color: exp.color }}
                    >
                      #{exp.interest_rank}
                    </span>
                  </div>
                  <p className="font-semibold text-black dark:text-white truncate">{exp.role_title}</p>
                  <p className="text-sm text-muted-foreground truncate">@ {exp.company_name}</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Interest Score</span>
                  <span className="font-semibold" style={{ color: exp.color }}>
                    {exp.interest_score}
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: exp.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(exp.interest_score / maxScore) * 100}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
