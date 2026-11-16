const numberFormat = new Intl.NumberFormat('ko-KR');

/** 1234 → "1,234" (단위 없는 원시 숫자. 화면에는 formatCount를 쓸 것) */
export function formatNumber(value) {
  if (value == null || Number.isNaN(value)) return '-';
  return numberFormat.format(value);
}

/** 1234 → "1,234건". 단위 없는 숫자를 화면에 내보내지 않기 위한 기본 포맷터 */
export function formatCount(value, unit = '건') {
  if (value == null || Number.isNaN(value)) return '-';
  return `${numberFormat.format(value)}${unit}`;
}

/**
 * 분자·분모에서 비율을 직접 계산한다.
 *
 * 백엔드의 *_rate는 0~100으로 내려오지만, 표본이 작아 분자·분모를 항상 함께 노출해야 하므로
 * 화면의 모든 비율은 이 함수로 계산한다. (0~1을 가정하는 포맷터는 두지 않는다 — 오용 방지)
 */
export function formatRatioPercent(numerator, denominator) {
  if (numerator == null || !denominator) return '-';
  return `${((numerator / denominator) * 100).toFixed(1)}%`;
}

/** 12, 97 → "12 / 97명". 표본이 작으므로 비율 옆에 항상 함께 노출한다 */
export function formatFraction(numerator, denominator, unit = '건') {
  if (numerator == null || denominator == null) return '-';
  return `${numberFormat.format(numerator)} / ${numberFormat.format(denominator)}${unit}`;
}

/** 12.37 → "12.4시간" */
export function formatHours(value) {
  if (value == null || Number.isNaN(value)) return '-';
  return `${value.toFixed(1)}시간`;
}

/** "2026-11-17T00:30:00Z" → "2026.11.17 00:30 (KST)" */
export function formatKst(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  const parts = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
    .formatToParts(date)
    .reduce((acc, part) => ({ ...acc, [part.type]: part.value }), {});
  return `${parts.year}.${parts.month}.${parts.day} ${parts.hour}:${parts.minute} (KST)`;
}

/** "2026-11-17" → "11.17" (차트 축 라벨) */
export function formatDateTick(value) {
  if (!value) return '';
  const [, month, day] = String(value).split('-');
  if (!month || !day) return String(value);
  return `${Number(month)}.${Number(day)}`;
}
