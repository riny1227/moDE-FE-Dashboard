/**
 * /api/admin/analytics 응답 타입.
 * 로컬 백엔드의 실제 직렬화 결과와 OpenAPI 스키마(AdminXxxResponse)에 1:1로 맞춰져 있다.
 *
 * 공통 주의사항
 * - 모든 필드는 snake_case
 * - **비율(*_rate)은 0~100 실수다** (0~1이 아니다). 화면에서는 분자/분모로 직접 계산하므로
 *   표시에는 쓰지 않는다.
 * - 집계 기준 시각을 내려주는 필드는 없다 → 페이지의 "기준 시각"은 클라이언트 수신 시각을 쓴다.
 * - 날짜는 "yyyy-MM-dd", 시각은 UTC "yyyy-MM-dd'T'HH:mm:ss'Z'"
 * - 집계는 모두 실사용자 기준(팀·테스트 계정 제외)
 */

/* ── 1. 참여 ─────────────────────────────────────────── */

export interface WeeklyActive {
  /** 해당 주 월요일 (예: "2026-11-09") */
  week_start: string;
  active_users: number;
}

export interface ParticipationAnalytics {
  /** 실사용자 수 — 활성 전환율의 분모 */
  total_users: number;
  /** 리뷰를 1건 이상 쓴 사용자 — 활성 전환율의 분자, 재작성률·1인당 평균의 분모 */
  writers: number;
  /** writers / total_users × 100 */
  activation_rate: number;
  /** 2회 이상 쓴 사용자 — 재작성률의 분자 */
  repeat_writers: number;
  /** repeat_writers / writers × 100 */
  repeat_rate: number;
  avg_reviews_per_writer: number;
  /** 전체 리뷰 수 — 1인당 평균의 분자 */
  total_reviews: number;
  weekly_active: WeeklyActive[];
}

/* ── 2. 정보 최신성 ──────────────────────────────────── */

export interface DailyVisible {
  /** "2026-11-17" (KST) */
  date: string;
  visible_reviews: number;
  /** 그 시점 노출 중이던 리뷰의 경과 시간 중앙값. 0건이면 null */
  median_age_hours: number | null;
}

export interface FreshnessAnalytics {
  /** 지금 노출 중인 리뷰 수 */
  visible_reviews_now: number;
  /** 노출 중 리뷰의 경과 시간 중앙값. 노출 0건이면 null */
  median_age_hours_now: number | null;
  /** 노출 중 리뷰의 경과 시간 평균. 노출 0건이면 null */
  avg_age_hours_now: number | null;
  /** 30개 고정 (최근 30일) */
  daily_visible: DailyVisible[];
  /** 노출 정책 상한. 현재 72 */
  max_exposure_hours: number;
}

/* ── 3. 신뢰 ─────────────────────────────────────────── */

export interface CategoryCount {
  /** 이미 한글 라벨로 내려온다 (예: "광고", "욕설") */
  category: string;
  count: number;
}

export interface Moderation {
  /** AI 검사한 댓글 수 — 의심 비율의 분모 */
  checked_comments: number;
  suspect_comments: number;
  /** 0~100 */
  suspect_rate: number;
  by_category: CategoryCount[];
}

export interface Reports {
  reported_reviews: number;
  blinded_reviews: number;
  /** 블라인드 비율의 분모 */
  total_reviews: number;
  /** 0~100 */
  blinded_rate: number;
}

export interface TrustAnalytics {
  moderation: Moderation;
  reports: Reports;
}

/* ── 4. 정보 공백 보완 ──────────────────────────────── */

export interface Region {
  /** "서울" | "수도권(경기·인천)" | "비수도권" */
  region_group: string;
  places: number;
  reviews: number;
}

export interface Sigungu {
  /** "서울특별시" */
  sido: string;
  /** "성동구" */
  sigungu: string;
  places: number;
  reviews: number;
}

export interface Category {
  /** PlaceCategory enum 코드 (예: "CAFE") */
  category: string;
  places: number;
  reviews: number;
}

export interface CoverageAnalytics {
  /** 실사용자 리뷰가 1건 이상 있는 장소 수 */
  user_report_places: number;
  /** 서울시 실시간 도시데이터 지점 수 */
  public_data_points: number;
  /** UTC. 동기화 기록이 없으면 null */
  last_synced_at: string | null;
  regions: Region[];
  sigungu_top: Sigungu[];
  categories: Category[];
}

/* ── 5. 패턴 ─────────────────────────────────────────── */

export type CongestionLevel = 'RELAXED' | 'MODERATE' | 'CROWDED' | 'VERY_CROWDED';

export interface HeatmapCell {
  /** ISO 요일. 1=월 … 7=일 (KST 기준, 서버에서 변환됨) */
  day_of_week: number;
  /** 0~23 (KST) */
  hour: number;
  reviews: number;
}

export interface Congestion {
  congestion_level: CongestionLevel;
  reviews: number;
  /** 혼잡도가 기록된 전체 리뷰 수 — 각 행에 같은 값이 들어온다(분모) */
  reviews_with_congestion: number;
  /** 0~100 */
  rate: number;
}

export interface PatternsAnalytics {
  /** 168칸 고정 (7요일 × 24시간), 기록 없는 칸도 0으로 채워져 온다 */
  review_heatmap: HeatmapCell[];
  /** 기록이 있는 단계만 내려온다 — 없는 단계는 0으로 표시 */
  congestion: Congestion[];
}
