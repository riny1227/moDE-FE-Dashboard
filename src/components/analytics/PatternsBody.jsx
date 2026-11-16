import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from 'recharts';
import Heatmap from './Heatmap';
import { CHART_COLORS, CONGESTION_LEVELS } from '../../constants/analytics';
import { formatCount, formatRatioPercent } from '../../utils/format';

export default function PatternsBody({ data }) {
  const distribution = data.congestion ?? [];

  /* reviews_with_congestion은 모든 행에 같은 분모가 들어온다 */
  const total = distribution[0]?.reviews_with_congestion ?? 0;

  /* 기록이 없는 단계는 응답에서 빠지므로 앱 버블 색 순서대로 0을 채운다 */
  const bars = CONGESTION_LEVELS.map((level) => ({
    label: level.label,
    color: level.color,
    reviews:
      distribution.find((item) => item.congestion_level === level.key)?.reviews ?? 0,
  }));

  return (
    <>
      <div className="analytics-chart">
        <h3 className="analytics-chart-title">요일 × 시간대 리뷰 분포</h3>
        <Heatmap cells={data.review_heatmap} />
      </div>

      <div className="analytics-chart">
        <h3 className="analytics-chart-title">
          혼잡도 분포 · 혼잡도가 기록된 리뷰 {formatCount(total)}
        </h3>
        {total === 0 ? (
          <p className="analytics-chart-empty">혼잡도가 기록된 리뷰가 없습니다</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={bars}
              layout="vertical"
              margin={{ top: 4, right: 104, bottom: 4, left: 8 }}
            >
              <CartesianGrid stroke={CHART_COLORS.grid} horizontal={false} />
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
                tickLine={false}
                axisLine={{ stroke: CHART_COLORS.grid }}
                label={{
                  value: '건',
                  position: 'insideBottomRight',
                  fontSize: 11,
                  fill: CHART_COLORS.axis,
                }}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fontSize: 12, fill: '#63718C' }}
                tickLine={false}
                axisLine={false}
                width={72}
              />
              <Tooltip
                formatter={(value) => [
                  `${formatCount(value)} (${formatRatioPercent(value, total)})`,
                  '리뷰',
                ]}
                cursor={{ fill: 'rgba(100, 137, 242, 0.06)' }}
              />
              <Bar
                dataKey="reviews"
                radius={[0, 3, 3, 0]}
                maxBarSize={26}
                name="리뷰"
              >
                {bars.map((bar) => (
                  <Cell key={bar.label} fill={bar.color} />
                ))}
                <LabelList
                  dataKey="reviews"
                  position="right"
                  formatter={(value) =>
                    `${formatCount(value)} (${formatRatioPercent(value, total)})`
                  }
                  style={{ fontSize: 11, fill: '#63718C', fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  );
}
