import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from 'recharts';
import KpiCard from './KpiCard';
import { CHART_COLORS } from '../../constants/analytics';
import {
  formatCount,
  formatRatioPercent,
  formatFraction,
} from '../../utils/format';

export default function TrustBody({ data }) {
  const moderation = data.moderation ?? {};
  const reports = data.reports ?? {};

  /* by_category의 category는 이미 한글 라벨로 내려온다 */
  const categories = [...(moderation.by_category ?? [])].sort(
    (a, b) => b.count - a.count,
  );

  return (
    <>
      <div className="analytics-kpi-grid analytics-kpi-grid--3">
        <KpiCard
          label="AI 검사한 댓글"
          value={formatCount(moderation.checked_comments)}
          note="등록 시 자동 검사"
        />
        <KpiCard
          label="의심 판정"
          value={formatRatioPercent(
            moderation.suspect_comments,
            moderation.checked_comments,
          )}
          fraction={formatFraction(
            moderation.suspect_comments,
            moderation.checked_comments,
          )}
          note="검사한 댓글 중 의심으로 분류된 비율"
        />
        <KpiCard
          label="블라인드된 리뷰"
          value={formatRatioPercent(reports.blinded_reviews, reports.total_reviews)}
          fraction={formatFraction(reports.blinded_reviews, reports.total_reviews)}
          note={`신고 접수된 리뷰 ${formatCount(reports.reported_reviews)}`}
        />
      </div>

      <div className="analytics-chart">
        <h3 className="analytics-chart-title">의심 댓글 분류</h3>
        {categories.length === 0 ? (
          <p className="analytics-chart-empty">의심으로 분류된 댓글이 없습니다</p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(categories.length * 46, 160)}>
            <BarChart
              data={categories}
              layout="vertical"
              margin={{ top: 4, right: 56, bottom: 4, left: 8 }}
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
                dataKey="category"
                tick={{ fontSize: 12, fill: '#63718C' }}
                tickLine={false}
                axisLine={false}
                width={72}
              />
              <Tooltip
                formatter={(value) => [formatCount(value), '의심 댓글']}
                cursor={{ fill: 'rgba(100, 137, 242, 0.06)' }}
              />
              <Bar
                dataKey="count"
                fill={CHART_COLORS.primary}
                radius={[0, 3, 3, 0]}
                maxBarSize={24}
                name="의심 댓글"
              >
                <LabelList
                  dataKey="count"
                  position="right"
                  formatter={(value) => formatCount(value)}
                  style={{ fontSize: 12, fill: '#63718C', fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  );
}
