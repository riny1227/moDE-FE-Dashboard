import { AlertCircle, Inbox } from 'lucide-react';
import './Section.css';

/**
 * 분석 페이지의 섹션 셸.
 * 섹션별로 독립 요청하므로 로딩·에러·빈 데이터 상태를 섹션 안에서 처리한다.
 * 한 섹션이 실패해도 나머지 섹션은 그대로 보인다.
 */
export default function Section({
  index,
  title,
  description,
  loading,
  error,
  empty,
  emptyMessage = '표시할 데이터가 없습니다',
  onRetry,
  children,
}) {
  return (
    <section className="analytics-section">
      <header className="analytics-section-header">
        <h2 className="analytics-section-title">
          <span className="analytics-section-index">{index}</span>
          {title}
        </h2>
        <p className="analytics-section-desc">{description}</p>
      </header>

      {loading ? (
        <div className="analytics-state">
          <div className="analytics-skel-row">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="skel analytics-skel-card" />
            ))}
          </div>
          <div className="skel analytics-skel-chart" />
        </div>
      ) : error ? (
        <div className="analytics-state analytics-state--message">
          <AlertCircle size={20} color="#E24B4A" />
          <p className="analytics-state-text">{error}</p>
          {onRetry && (
            <button className="analytics-retry" onClick={onRetry}>
              다시 시도
            </button>
          )}
        </div>
      ) : empty ? (
        <div className="analytics-state analytics-state--message">
          <Inbox size={20} color="#B0B8C1" />
          <p className="analytics-state-text">{emptyMessage}</p>
        </div>
      ) : (
        children
      )}
    </section>
  );
}
