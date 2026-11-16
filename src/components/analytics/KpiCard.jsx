import './KpiCard.css';

/**
 * KPI 카드.
 * - value: 단위까지 포함된 문자열 (단위 없는 숫자는 노출하지 않는다)
 * - fraction: 비율 카드의 분자·분모 ("12 / 97명"). 표본이 작으므로 비율에는 항상 붙인다.
 * - note: 보조 문구 (예: 마지막 동기화 시각, 정책 상한)
 * - size: 'lg'면 큰 숫자 카드
 */
export default function KpiCard({ label, value, fraction, note, size }) {
  return (
    <div className={`kpi-card ${size === 'lg' ? 'kpi-card--lg' : ''}`}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {fraction && <div className="kpi-fraction">{fraction}</div>}
      {note && <div className="kpi-note">{note}</div>}
    </div>
  );
}
