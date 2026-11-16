import { useState } from 'react';
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
import RatioBar from './RatioBar';
import {
  CHART_COLORS,
  REGION_BUCKETS,
  PLACE_CATEGORY_LABEL,
} from '../../constants/analytics';
import {
  formatCount,
  formatRatioPercent,
  formatKst,
} from '../../utils/format';

const METRICS = [
  { key: 'places', label: '장소 수', unit: '개소' },
  { key: 'reviews', label: '리뷰 수', unit: '건' },
];

export default function CoverageBody({ data }) {
  const [metricKey, setMetricKey] = useState('places');
  const metric = METRICS.find((m) => m.key === metricKey);

  const regions = data.regions ?? [];
  const districts = data.sigungu_top ?? [];
  const categories = [...(data.categories ?? [])]
    .map((item) => ({
      ...item,
      label: PLACE_CATEGORY_LABEL[item.category] ?? item.category,
    }))
    .sort((a, b) => (b[metricKey] ?? 0) - (a[metricKey] ?? 0));

  const regionItems = REGION_BUCKETS.map((bucket) => ({
    key: bucket.key,
    label: bucket.label,
    color: bucket.color,
    value: regions.find((r) => r.region_group === bucket.key)?.[metricKey] ?? 0,
  }));

  const districtTotal = districts.reduce(
    (sum, row) => sum + (row[metricKey] ?? 0),
    0,
  );

  return (
    <>
      <div className="analytics-kpi-grid analytics-kpi-grid--2">
        <KpiCard
          label="이용자 제보가 있는 장소"
          value={formatCount(data.user_report_places, '개소')}
          note="리뷰가 1건 이상 등록된 장소"
        />
        <KpiCard
          label="서울시 실시간 도시데이터 지점"
          value={formatCount(data.public_data_points, '개소')}
          note={`마지막 동기화 ${formatKst(data.last_synced_at)}`}
        />
      </div>

      <div className="analytics-chart">
        <div className="analytics-chart-head">
          <h3 className="analytics-chart-title">지역 비율</h3>
          <div className="metric-toggle">
            {METRICS.map((m) => (
              <button
                key={m.key}
                className={`metric-toggle-btn ${metricKey === m.key ? 'active' : ''}`}
                onClick={() => setMetricKey(m.key)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <RatioBar items={regionItems} unit={metric.unit} />
      </div>

      <div className="analytics-grid-2">
        <div className="analytics-chart">
          <h3 className="analytics-chart-title">시군구 상위 10</h3>
          {districts.length === 0 ? (
            <p className="analytics-chart-empty">집계된 시군구가 없습니다</p>
          ) : (
            <div className="analytics-table-wrap">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th style={{ width: 36 }}>#</th>
                    <th>시군구</th>
                    <th style={{ width: 92 }}>장소 수</th>
                    <th style={{ width: 92 }}>리뷰 수</th>
                    <th style={{ width: 72 }}>비중</th>
                  </tr>
                </thead>
                <tbody>
                  {districts.slice(0, 10).map((row, index) => (
                    <tr key={`${row.sido}-${row.sigungu}`}>
                      <td className="analytics-td-rank">{index + 1}</td>
                      <td>
                        <span className="analytics-td-district">{row.sigungu}</span>
                        <span className="analytics-td-region">{row.sido}</span>
                      </td>
                      <td className="analytics-td-num">
                        {formatCount(row.places, '개소')}
                      </td>
                      <td className="analytics-td-num">
                        {formatCount(row.reviews)}
                      </td>
                      <td className="analytics-td-num analytics-td-muted">
                        {formatRatioPercent(row[metricKey], districtTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="analytics-table-note">
                비중은 상위 {Math.min(districts.length, 10)}개 합계(
                {formatCount(districtTotal, metric.unit)}) 기준 · {metric.label} 선택 중
              </p>
            </div>
          )}
        </div>

        <div className="analytics-chart">
          <h3 className="analytics-chart-title">카테고리별 {metric.label}</h3>
          {categories.length === 0 ? (
            <p className="analytics-chart-empty">집계된 카테고리가 없습니다</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(categories.length * 38, 180)}>
              <BarChart
                data={categories}
                layout="vertical"
                margin={{ top: 4, right: 64, bottom: 4, left: 8 }}
              >
                <CartesianGrid stroke={CHART_COLORS.grid} horizontal={false} />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
                  tickLine={false}
                  axisLine={{ stroke: CHART_COLORS.grid }}
                  label={{
                    value: metric.unit,
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
                  width={88}
                />
                <Tooltip
                  formatter={(value) => [formatCount(value, metric.unit), metric.label]}
                  cursor={{ fill: 'rgba(100, 137, 242, 0.06)' }}
                />
                <Bar
                  dataKey={metricKey}
                  fill={CHART_COLORS.primary}
                  radius={[0, 3, 3, 0]}
                  maxBarSize={20}
                  name={metric.label}
                >
                  <LabelList
                    dataKey={metricKey}
                    position="right"
                    formatter={(value) => formatCount(value, metric.unit)}
                    style={{ fontSize: 11, fill: '#63718C', fontWeight: 600 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </>
  );
}
