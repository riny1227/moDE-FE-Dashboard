import './RatioBar.css';
import { formatCount, formatRatioPercent } from '../../utils/format';

/**
 * 100% 가로 막대. 분자·분모를 legend에 함께 노출한다.
 * @param items [{ key, label, color, value }]
 * @param unit  값의 단위 ('개소' | '건')
 */
export default function RatioBar({ items, unit }) {
  const total = items.reduce((sum, item) => sum + (item.value ?? 0), 0);

  if (total === 0) {
    return <p className="analytics-chart-empty">집계된 데이터가 없습니다</p>;
  }

  return (
    <div className="ratio-bar-wrap">
      <div className="ratio-bar">
        {items.map((item) => {
          const value = item.value ?? 0;
          if (value === 0) return null;
          return (
            <div
              key={item.key}
              className="ratio-bar-fill"
              style={{
                width: `${(value / total) * 100}%`,
                background: item.color,
              }}
              title={`${item.label} ${formatCount(value, unit)} (${formatRatioPercent(value, total)})`}
            >
              <span className="ratio-bar-inline">
                {formatRatioPercent(value, total)}
              </span>
            </div>
          );
        })}
      </div>

      <ul className="ratio-legend">
        {items.map((item) => (
          <li key={item.key} className="ratio-legend-item">
            <span className="ratio-legend-dot" style={{ background: item.color }} />
            <span className="ratio-legend-label">{item.label}</span>
            <span className="ratio-legend-value">
              {formatCount(item.value ?? 0, unit)}
            </span>
            <span className="ratio-legend-pct">
              {formatRatioPercent(item.value ?? 0, total)}
            </span>
          </li>
        ))}
      </ul>
      <p className="ratio-total">합계 {formatCount(total, unit)}</p>
    </div>
  );
}
