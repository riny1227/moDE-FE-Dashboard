import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import KpiCard from './KpiCard';
import { CHART_COLORS, MAX_EXPOSURE_HOURS } from '../../constants/analytics';
import { formatCount, formatHours, formatDateTick } from '../../utils/format';

export default function FreshnessBody({ data }) {
  const daily = data.daily_visible ?? [];
  const maxHours = data.max_exposure_hours ?? MAX_EXPOSURE_HOURS;
  const hasVisible = data.visible_reviews_now > 0;

  return (
    <>
      <div className="analytics-kpi-grid analytics-kpi-grid--3">
        <KpiCard
          label="지금 노출 중인 리뷰"
          value={
            hasVisible ? (
              formatCount(data.visible_reviews_now)
            ) : (
              <span className="kpi-value--text">현재 노출 중인 리뷰 없음</span>
            )
          }
          size="lg"
        />
        <KpiCard
          label="노출 중 리뷰의 경과 시간 중앙값"
          value={
            data.median_age_hours_now != null ? (
              formatHours(data.median_age_hours_now)
            ) : (
              <span className="kpi-value--text">현재 노출 중인 리뷰 없음</span>
            )
          }
          size="lg"
          note={
            data.avg_age_hours_now != null
              ? `평균 ${formatHours(data.avg_age_hours_now)}`
              : undefined
          }
        />
        <KpiCard
          label="노출 정책 상한"
          value={`최대 노출 ${maxHours}시간`}
          size="lg"
          note="상한을 넘긴 리뷰는 자동으로 내려갑니다"
        />
      </div>

      <div className="analytics-chart">
        <h3 className="analytics-chart-title">
          최근 30일 일별 노출 리뷰 수와 경과 시간 중앙값
        </h3>
        {daily.length === 0 ? (
          <p className="analytics-chart-empty">최근 30일 노출 기록이 없습니다</p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={daily} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
              <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDateTick}
                tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
                tickLine={false}
                axisLine={{ stroke: CHART_COLORS.grid }}
                interval="preserveStartEnd"
                minTickGap={16}
              />
              <YAxis
                yAxisId="count"
                allowDecimals={false}
                tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
                tickLine={false}
                axisLine={false}
                width={46}
                label={{
                  value: '건',
                  position: 'insideTopLeft',
                  fontSize: 11,
                  fill: CHART_COLORS.axis,
                }}
              />
              <YAxis
                yAxisId="hours"
                orientation="right"
                domain={[0, Math.max(maxHours, 1)]}
                tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
                tickLine={false}
                axisLine={false}
                width={52}
                label={{
                  value: '시간',
                  position: 'insideTopRight',
                  fontSize: 11,
                  fill: CHART_COLORS.axis,
                }}
              />
              <Tooltip
                formatter={(value, name) =>
                  name === '경과 시간 중앙값'
                    ? [value == null ? '-' : formatHours(value), name]
                    : [formatCount(value), name]
                }
              />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                iconType="plainline"
              />
              <ReferenceLine
                yAxisId="hours"
                y={maxHours}
                stroke={CHART_COLORS.reference}
                strokeDasharray="4 4"
                label={{
                  value: `최대 노출 ${maxHours}시간`,
                  position: 'insideTopRight',
                  fontSize: 11,
                  fill: CHART_COLORS.reference,
                }}
              />
              <Bar
                yAxisId="count"
                dataKey="visible_reviews"
                name="노출 리뷰 수"
                fill={CHART_COLORS.primary}
                radius={[3, 3, 0, 0]}
                maxBarSize={22}
              />
              <Line
                yAxisId="hours"
                type="monotone"
                dataKey="median_age_hours"
                name="경과 시간 중앙값"
                stroke={CHART_COLORS.line}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  );
}
