# /api/admin/analytics 응답 메모

"데이터" 페이지(`/data`)가 소비하는 5개 엔드포인트의 응답 정리.
**권위 있는 출처는 백엔드 OpenAPI(`/v3/api-docs`)이고**, 이 문서는 프론트가 주의해야 할 특이사항만 남긴다.
타입 정의는 `src/types/analytics.ts`.

검증 기준: 로컬 백엔드 실제 직렬화 결과 + `AdminAnalyticsServiceTest`.

## 공통

- 래퍼: `{ "success": true, "message": "success", "data": { ... } }` — 실제 데이터는 `data` 내부
- 필드명 `snake_case`, 날짜 `"yyyy-MM-dd"`, 시각 UTC `"yyyy-MM-dd'T'HH:mm:ss'Z'"`
- 집계는 모두 실사용자 기준(팀·테스트 계정 제외)

### 주의 1 — 비율은 0~100이다

`activation_rate: 100.0`, `suspect_rate: 75.0`, `blinded_rate: 12.5`, `rate: 50.0`.
0~1이 아니다. 화면은 이 필드를 쓰지 않고 **분자/분모로 직접 계산**한다
(`formatRatioPercent`). 표본이 작아 분자·분모를 항상 함께 노출해야 하기 때문이고,
덤으로 백엔드가 스케일을 바꿔도 화면이 틀어지지 않는다.

### 주의 2 — 집계 기준 시각 필드가 없다

5개 응답 어디에도 `generated_at`류 필드가 없다. 지표는 요청 시점에 계산되므로
페이지 상단 "기준 시각"은 **클라이언트가 응답을 받은 시각**(`useSectionData.fetchedAt`)을 쓴다.
서버가 집계 시각을 내려주게 되면 그 필드로 갈아타는 게 정확하다.

### 주의 3 — 라벨 체계가 섹션마다 다르다

| 위치 | 형태 | 처리 |
|---|---|---|
| `trust.moderation.by_category[].category` | 이미 한글 (`"광고"`, `"욕설"`) | 그대로 표시 |
| `coverage.categories[].category` | enum 코드 (`"CAFE"`) | `PLACE_CATEGORY_LABEL`로 매핑, 모르는 코드는 원문 표시 |
| `coverage.regions[].region_group` | 한글 문자열 (`"수도권(경기·인천)"`) | `REGION_BUCKETS`의 key와 **정확히** 일치해야 함 |

`region_group` 문자열이 백엔드에서 바뀌면 지역 비율이 전부 0이 된다
(`AdminAnalyticsService`의 `REGION_METRO` / `REGION_OUTSIDE` 상수).

---

## 1. `GET /api/admin/analytics/participation`

```json
{
  "total_users": 3, "writers": 3, "activation_rate": 100.0,
  "repeat_writers": 3, "repeat_rate": 100.0,
  "avg_reviews_per_writer": 2.7, "total_reviews": 8,
  "weekly_active": [{ "week_start": "2026-11-09", "active_users": 2 }]
}
```

- 활성 전환율 = `writers / total_users`, 재작성률 = `repeat_writers / writers`
- 1인당 평균의 분자·분모 = `total_reviews / writers`

## 2. `GET /api/admin/analytics/freshness`

```json
{
  "visible_reviews_now": 5, "median_age_hours_now": 20.0, "avg_age_hours_now": 25.4,
  "daily_visible": [{ "date": "2026-10-19", "visible_reviews": 0, "median_age_hours": null }],
  "max_exposure_hours": 72
}
```

- `daily_visible`은 **30개 고정**, 0건인 날의 `median_age_hours`는 `null` → 선 차트는 `connectNulls`
- 노출 0건이면 `median_age_hours_now` / `avg_age_hours_now`가 `null`
  → 화면은 숫자 대신 "현재 노출 중인 리뷰 없음"
- `max_exposure_hours`는 72시간 기준선으로 사용

## 3. `GET /api/admin/analytics/trust`

```json
{
  "moderation": { "checked_comments": 4, "suspect_comments": 3, "suspect_rate": 75.0,
                  "by_category": [{ "category": "광고", "count": 2 }] },
  "reports": { "reported_reviews": 1, "blinded_reviews": 1, "total_reviews": 8, "blinded_rate": 12.5 }
}
```

- **중첩 구조다** (`moderation` / `reports`). 평평한 응답이 아니다.
- 의심 비율 = `moderation.suspect_comments / moderation.checked_comments`
- 블라인드 비율 = `reports.blinded_reviews / reports.total_reviews`
- `reports.reported_reviews`는 신고 접수 건수 — 블라인드 카드의 보조 문구로 표시

## 4. `GET /api/admin/analytics/coverage`

```json
{
  "user_report_places": 5, "public_data_points": 3, "last_synced_at": "2026-11-17T10:00:00Z",
  "regions": [{ "region_group": "서울", "places": 2, "reviews": 5 }],
  "sigungu_top": [{ "sido": "서울특별시", "sigungu": "성동구", "places": 1, "reviews": 3 }],
  "categories": [{ "category": "CAFE", "places": 5, "reviews": 8 }]
}
```

- `regions`는 **건수**로 온다(백분율 아님) → 장소 수 / 리뷰 수 토글로 프론트가 비율 계산
- `places`와 `reviews`가 둘 다 있어야 토글이 동작한다
- `sigungu_top`은 리뷰 수 기준 정렬, 화면은 앞 10개만 사용
- `last_synced_at`은 동기화 기록이 없으면 `null` → "-" 표시

## 5. `GET /api/admin/analytics/patterns`

```json
{
  "review_heatmap": [{ "day_of_week": 1, "hour": 0, "reviews": 0 }],
  "congestion": [{ "congestion_level": "CROWDED", "reviews": 4,
                   "reviews_with_congestion": 8, "rate": 50.0 }]
}
```

- `review_heatmap`은 **168칸 고정**(7×24), 기록 없는 칸도 `reviews: 0`으로 채워져 온다
- `day_of_week`는 **ISO 기준 1=월 … 7=일** (`extract(isodow)`), `hour`는 **KST** 0~23.
  서버에서 KST로 변환한 뒤 집계하므로 프론트는 추가 변환하지 않는다.
  (MySQL `DAYOFWEEK`의 1=일요일 관례와 다르다 — 바뀌면 히트맵 행이 하루씩 밀린다)
- `congestion`은 **기록이 있는 단계만** 내려온다 → 없는 단계는 프론트가 0으로 채운다
- `reviews_with_congestion`은 모든 행에 같은 값(분모)이 들어온다. 전체 리뷰 수가 아니라
  **혼잡도가 기록된 리뷰 수**다 — 혼잡도를 적지 않은 리뷰는 집계에서 빠진다.
- `congestion_level`: `RELAXED` | `MODERATE` | `CROWDED` | `VERY_CROWDED` (`NORMAL`이 아니다)

---

## 에러 처리

섹션별 독립 요청이라 한 엔드포인트가 5xx여도 나머지 4개는 정상 렌더되고,
해당 섹션만 에러 상태 + "다시 시도"를 표시한다.
`401`은 기존 `client.ts` 인터셉터가 처리한다(토큰 삭제 → `/login`).
