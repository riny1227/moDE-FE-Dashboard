import Section from '../components/analytics/Section';
import ParticipationBody from '../components/analytics/ParticipationBody';
import FreshnessBody from '../components/analytics/FreshnessBody';
import TrustBody from '../components/analytics/TrustBody';
import CoverageBody from '../components/analytics/CoverageBody';
import PatternsBody from '../components/analytics/PatternsBody';
import useSectionData from '../hooks/useSectionData';
import {
  getParticipationAnalytics,
  getFreshnessAnalytics,
  getTrustAnalytics,
  getCoverageAnalytics,
  getPatternsAnalytics,
} from '../api/analytics';
import { formatKst } from '../utils/format';
import './Data.css';

/**
 * SI 어워드 신청서·발표자료 캡처용 지표 페이지.
 * "문제 → 해결 → 임팩트" 순서로 읽히도록 위에서 아래로 5개 섹션을 배치한다.
 * 섹션별로 독립 요청하므로 한 섹션이 실패해도 나머지는 그대로 보인다.
 */
export default function Data() {
  const participation = useSectionData(
    getParticipationAnalytics,
    '참여 지표를 불러오지 못했습니다',
  );
  const freshness = useSectionData(
    getFreshnessAnalytics,
    '최신성 지표를 불러오지 못했습니다',
  );
  const trust = useSectionData(
    getTrustAnalytics,
    '신뢰 지표를 불러오지 못했습니다',
  );
  const coverage = useSectionData(
    getCoverageAnalytics,
    '정보 공백 지표를 불러오지 못했습니다',
  );
  const patterns = useSectionData(
    getPatternsAnalytics,
    '패턴 지표를 불러오지 못했습니다',
  );

  /*
   * 응답에 집계 기준 시각 필드가 없다. 지표는 요청 시점에 계산되므로
   * 가장 먼저 도착한 섹션의 수신 시각을 기준 시각으로 표시한다.
   */
  const asOf =
    participation.fetchedAt ??
    freshness.fetchedAt ??
    trust.fetchedAt ??
    coverage.fetchedAt ??
    patterns.fetchedAt ??
    null;

  const heatmapTotal = (patterns.data?.review_heatmap ?? []).reduce(
    (sum, cell) => sum + (cell.reviews ?? 0),
    0,
  );

  return (
    <div className="analytics-page">
      <header className="analytics-page-header">
        <h1 className="page-title">데이터</h1>
        <div className="analytics-meta">
          <span className="analytics-asof">
            기준 시각: {asOf ? formatKst(asOf) : '불러오는 중'}
          </span>
          <span className="analytics-meta-divider" />
          <span className="analytics-exclusion">팀·테스트 계정 제외</span>
        </div>
      </header>

      <Section
        index={1}
        title="참여"
        description="불편한 제약에도 실제로 기록하는가"
        loading={participation.loading}
        error={participation.error}
        empty={!!participation.data && participation.data.total_users === 0}
        emptyMessage="집계된 실사용자가 없습니다"
        onRetry={participation.reload}
      >
        {participation.data && <ParticipationBody data={participation.data} />}
      </Section>

      <Section
        index={2}
        title="정보 최신성"
        description="지금 보는 정보는 얼마나 최신인가"
        loading={freshness.loading}
        error={freshness.error}
        empty={!freshness.data}
        emptyMessage="최신성 집계 데이터가 없습니다"
        onRetry={freshness.reload}
      >
        {freshness.data && <FreshnessBody data={freshness.data} />}
      </Section>

      <Section
        index={3}
        title="신뢰"
        description="광고·허위 정보를 어떻게 걸러내는가"
        loading={trust.loading}
        error={trust.error}
        empty={
          !!trust.data &&
          (trust.data.moderation?.checked_comments ?? 0) === 0 &&
          (trust.data.reports?.total_reviews ?? 0) === 0
        }
        emptyMessage="검사한 댓글과 집계된 리뷰가 없습니다"
        onRetry={trust.reload}
      >
        {trust.data && <TrustBody data={trust.data} />}
      </Section>

      <Section
        index={4}
        title="정보 공백 보완"
        description="제보가 없는 곳은 어떻게 채우는가"
        loading={coverage.loading}
        error={coverage.error}
        empty={
          !!coverage.data &&
          coverage.data.user_report_places === 0 &&
          coverage.data.public_data_points === 0
        }
        emptyMessage="집계된 장소가 없습니다"
        onRetry={coverage.reload}
      >
        {coverage.data && <CoverageBody data={coverage.data} />}
      </Section>

      <Section
        index={5}
        title="패턴"
        description="혼잡 정보가 언제, 어떤 상태로 공유되는가"
        loading={patterns.loading}
        error={patterns.error}
        empty={
          !!patterns.data &&
          heatmapTotal === 0 &&
          (patterns.data.congestion ?? []).length === 0
        }
        emptyMessage="집계된 리뷰가 없습니다"
        onRetry={patterns.reload}
      >
        {patterns.data && <PatternsBody data={patterns.data} />}
      </Section>
    </div>
  );
}
