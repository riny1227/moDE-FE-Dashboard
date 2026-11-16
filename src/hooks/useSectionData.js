import { useState, useEffect, useCallback } from 'react';

/**
 * 섹션 하나의 데이터를 독립적으로 가져온다.
 * 섹션별로 상태를 따로 들고 있으므로 한 섹션이 실패해도 나머지 섹션은 그대로 렌더된다.
 *
 * @param {() => Promise<unknown>} fetcher 섹션용 API 호출
 * @param {string} errorMessage 실패 시 섹션에 표시할 문구
 */
export default function useSectionData(fetcher, errorMessage) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  /**
   * 응답을 받은 시각. 백엔드가 집계 기준 시각을 내려주지 않으므로
   * 페이지 상단 "기준 시각"은 이 값을 쓴다(지표는 요청 시점에 계산된다).
   */
  const [fetchedAt, setFetchedAt] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await fetcher());
      setFetchedAt(new Date().toISOString());
    } catch {
      setData(null);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
    // fetcher는 모듈 스코프 함수를 그대로 넘기는 용도이므로 의존성에서 제외한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorMessage]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, fetchedAt, reload: load };
}
