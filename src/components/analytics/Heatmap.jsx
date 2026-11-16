import './Heatmap.css';
import { WEEKDAY_LABELS } from '../../constants/analytics';
import { formatCount } from '../../utils/format';

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

/**
 * 요일(행) × 시간(열) 히트맵. 값이 클수록 진하다.
 * 백엔드는 168칸을 모두 채워 보내지만, 누락되어도 깨지지 않도록 격자를 만들어 조회한다.
 * @param cells [{ day_of_week: 1~7(ISO, 월~일), hour: 0~23(KST), reviews }]
 */
export default function Heatmap({ cells }) {
  const grid = new Map();
  let max = 0;

  (cells ?? []).forEach((cell) => {
    grid.set(`${cell.day_of_week}-${cell.hour}`, cell.reviews);
    if (cell.reviews > max) max = cell.reviews;
  });

  return (
    <div className="heatmap">
      <div className="heatmap-grid">
        <div className="heatmap-corner" />
        {HOURS.map((hour) => (
          <div key={hour} className="heatmap-hour">
            {hour % 3 === 0 ? hour : ''}
          </div>
        ))}

        {WEEKDAY_LABELS.map((label, rowIndex) => {
          const dayOfWeek = rowIndex + 1;
          return [
            <div key={`label-${dayOfWeek}`} className="heatmap-day">
              {label}
            </div>,
            ...HOURS.map((hour) => {
              const count = grid.get(`${dayOfWeek}-${hour}`) ?? 0;
              const intensity = max > 0 ? count / max : 0;
              return (
                <div
                  key={`${dayOfWeek}-${hour}`}
                  className={`heatmap-cell ${count === 0 ? 'heatmap-cell--zero' : ''}`}
                  style={
                    count === 0
                      ? undefined
                      : { background: `rgba(38, 81, 137, ${0.12 + intensity * 0.88})` }
                  }
                >
                  <span className="heatmap-tip">
                    {label} {hour}시 · {formatCount(count)}
                  </span>
                </div>
              );
            }),
          ];
        })}
      </div>

      <div className="heatmap-scale">
        <span className="heatmap-scale-label">적음 0건</span>
        <span className="heatmap-scale-bar" />
        <span className="heatmap-scale-label">많음 {formatCount(max)}</span>
      </div>
    </div>
  );
}
