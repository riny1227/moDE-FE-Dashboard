import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import KpiCard from './KpiCard';
import { CHART_COLORS } from '../../constants/analytics';
import {
  formatCount,
  formatRatioPercent,
  formatFraction,
  formatDateTick,
} from '../../utils/format';

export default function ParticipationBody({ data }) {
  const weekly = data.weekly_active ?? [];

  return (
    <>
      <div className="analytics-kpi-grid">
        <KpiCard
          label="실사용자 수"
          value={formatCount(data.total_users, '명')}
          note="팀·테스트 계정 제외"
        />
        <KpiCard
          label="활성 전환율"
          value={formatRatioPercent(data.writers, data.total_users)}
          fraction={formatFraction(data.writers, data.total_users, '명')}
          note="리뷰를 1건 이상 작성한 사용자"
        />
        <KpiCard
          label="재작성률"
          value={formatRatioPercent(data.repeat_writers, data.writers)}
          fraction={formatFraction(data.repeat_writers, data.writers, '명')}
          note="작성자 중 2건 이상 작성한 사용자"
        />
        <KpiCard
          label="작성자 1인당 평균 리뷰 수"
          value={`${(data.avg_reviews_per_writer ?? 0).toFixed(1)}건`}
          fraction={`${formatCount(data.total_reviews)} / ${formatCount(data.writers, '명')}`}
          note="전체 리뷰 ÷ 작성자"
        />
      </div>

      <div className="analytics-chart">
        <h3 className="analytics-chart-title">주간 활동 사용자</h3>
        {weekly.length === 0 ? (
          <p className="analytics-chart-empty">주간 활동 기록이 없습니다</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weekly} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
              <XAxis
                dataKey="week_start"
                tickFormatter={formatDateTick}
                tick={{ fontSize: 12, fill: CHART_COLORS.axis }}
                tickLine={false}
                axisLine={{ stroke: CHART_COLORS.grid }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: CHART_COLORS.axis }}
                tickLine={false}
                axisLine={false}
                width={44}
                label={{
                  value: '명',
                  position: 'insideTopLeft',
                  fontSize: 11,
                  fill: CHART_COLORS.axis,
                }}
              />
              <Tooltip
                labelFormatter={(value) => `${value} 주`}
                formatter={(value) => [formatCount(value, '명'), '활동 사용자']}
              />
              <Line
                type="monotone"
                dataKey="active_users"
                stroke={CHART_COLORS.primary}
                strokeWidth={2}
                dot={{ r: 3, fill: CHART_COLORS.primary }}
                activeDot={{ r: 5 }}
                name="활동 사용자"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  );
}
