/**
 * 혼잡도 단계. key는 백엔드 congestion_level 값과 일치한다.
 * 색은 서울 실시간 도시데이터 혼잡도 관례를 따른다.
 */
export const CONGESTION_LEVELS = [
  { key: 'RELAXED', label: '여유', color: '#1D9E75' },
  { key: 'MODERATE', label: '보통', color: '#F5C73A' },
  { key: 'CROWDED', label: '혼잡', color: '#FF9F43' },
  { key: 'VERY_CROWDED', label: '매우 혼잡', color: '#E24B4A' },
];

/**
 * 권역 표시 순서와 색.
 * key는 백엔드 region_group 문자열과 정확히 일치해야 한다
 * (AdminAnalyticsService의 REGION_METRO / REGION_OUTSIDE 상수).
 */
export const REGION_BUCKETS = [
  { key: '서울', label: '서울', color: '#265189' },
  { key: '수도권(경기·인천)', label: '수도권', color: '#6489F2' },
  { key: '비수도권', label: '비수도권', color: '#C3D2F8' },
];

/**
 * 장소 카테고리 라벨. 백엔드 categories[].category는 PlaceCategory enum 코드로 온다.
 * 모르는 코드는 원문을 그대로 표시한다.
 */
export const PLACE_CATEGORY_LABEL = {
  RESTAURANT: '음식점',
  FOOD: '음식점',
  CAFE: '카페',
  POPUP: '팝업스토어',
  PERFORMANCE: '공연장',
  ETC: '기타',
};

/** 노출 정책 상한 기본값 — 응답의 max_exposure_hours가 우선한다 */
export const MAX_EXPOSURE_HOURS = 72;

/** 차트 공통 색 */
export const CHART_COLORS = {
  primary: '#6489F2',
  primaryDark: '#265189',
  line: '#F08C1E',
  grid: '#EEF1F5',
  axis: '#8B95A1',
  reference: '#E24B4A',
};

/** 히트맵 행 순서. 백엔드 day_of_week는 ISO 기준 1=월 … 7=일 */
export const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];
