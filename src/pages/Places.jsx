import { useState, useEffect, useCallback } from 'react';
import { Search, CheckCircle2, ArrowDownAZ } from 'lucide-react';
import { getPlaces, updatePlace } from '../api/admin';
import './Places.css';

const CATEGORIES = [
  { value: 'CAFE', label: '카페' },
  { value: 'RESTAURANT', label: '음식점' },
  { value: 'FOOD', label: '푸드' },
  { value: 'POPUP', label: '팝업' },
  { value: 'PERFORMANCE', label: '공연' },
  { value: 'ETC', label: '기타' },
];

export default function Places() {
  const [places, setPlaces] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [cursor, setCursor] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortByName, setSortByName] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  // Debounce keyword
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword), 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  const fetchPlaces = useCallback(
    async (loadMore = false) => {
      setLoading(true);
      setError('');
      try {
        const params = { limit: 20 };
        if (debouncedKeyword) params.keyword = debouncedKeyword;
        if (loadMore && cursor) params.cursor = cursor;

        const data = await getPlaces(params);
        setPlaces((prev) => (loadMore ? [...prev, ...data.places] : data.places));
        setNextCursor(data.next_cursor);
        setCursor(data.next_cursor);
      } catch {
        setError('장소 목록을 불러오지 못했습니다');
      } finally {
        setLoading(false);
      }
    },
    [debouncedKeyword, cursor],
  );

  useEffect(() => {
    setCursor(null);
    setNextCursor(null);
    fetchPlaces(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKeyword]);

  const handleToggleActive = async (place) => {
    setProcessing(place.id);
    try {
      await updatePlace(place.id, { is_active: !place.is_active });
      setPlaces((prev) =>
        prev.map((p) =>
          p.id === place.id ? { ...p, is_active: !p.is_active } : p,
        ),
      );
      showToast(place.is_active ? '장소를 비활성화했습니다' : '장소를 활성화했습니다');
    } catch (err) {
      alert(err.message || '처리에 실패했습니다');
    } finally {
      setProcessing(null);
    }
  };

  const handleCategoryChange = async (place, newCategory) => {
    setEditingCategory(null);
    if (!newCategory || newCategory === place.category) return;
    setProcessing(place.id);
    try {
      await updatePlace(place.id, { category: newCategory });
      setPlaces((prev) =>
        prev.map((p) =>
          p.id === place.id ? { ...p, category: newCategory } : p,
        ),
      );
      showToast('카테고리를 수정했습니다');
    } catch (err) {
      alert(err.message || '처리에 실패했습니다');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div>
      <h1 className="page-title">장소 관리</h1>
      <p className="page-subtitle">등록된 장소를 검색하고 관리할 수 있습니다</p>

      {error && <p className="places-error">{error}</p>}

      <div className="filter-tabs">
        <button
          className={`filter-tab ${categoryFilter === '' ? 'active' : ''}`}
          onClick={() => setCategoryFilter('')}
        >
          <span>전체</span>
        </button>
        {CATEGORIES.map(({ value, label }) => (
          <button
            key={value}
            className={`filter-tab ${categoryFilter === value ? 'active' : ''}`}
            onClick={() => setCategoryFilter(value)}
          >
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="places-toolbar">
        <div className="places-search">
          <Search size={18} className="places-search-icon" />
          <input
            className="places-search-input"
            type="text"
            placeholder="장소명 또는 주소로 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
        <button
          className={`places-sort-btn ${sortByName ? 'active' : ''}`}
          onClick={() => setSortByName((v) => !v)}
        >
          <ArrowDownAZ size={16} />
          이름순
        </button>
      </div>

      <div className="places-table-wrapper">
        <table className="places-table">
          <thead>
            <tr>
              <th style={{ width: 160 }}>장소명</th>
              <th>주소</th>
              <th style={{ width: 120 }}>카테고리</th>
              <th style={{ width: 80 }}>리뷰 수</th>
              <th style={{ width: 72 }}>활성</th>
              <th style={{ width: 120 }}>등록일</th>
            </tr>
          </thead>
          <tbody>
            {loading && places.length === 0
              ? [0, 1, 2, 3, 4].map((i) => (
                  <tr key={i}>
                    <td><div className="skel" style={{ width: 120, height: 14 }} /></td>
                    <td><div className="skel" style={{ width: '80%', height: 14 }} /></td>
                    <td><div className="skel" style={{ width: 70, height: 14 }} /></td>
                    <td><div className="skel" style={{ width: 40, height: 14 }} /></td>
                    <td><div className="skel" style={{ width: 40, height: 20, borderRadius: 10 }} /></td>
                    <td><div className="skel" style={{ width: 90, height: 14 }} /></td>
                  </tr>
                ))
              : (sortByName
                  ? [...places].sort((a, b) => a.name.localeCompare(b.name, 'ko'))
                  : places
                )
                .filter((p) => !categoryFilter || p.category === categoryFilter)
                .map((p) => (
                  <tr key={p.id}>
                    <td className="cell-place-name">{p.name}</td>
                    <td className="cell-address">{p.address}</td>
                    <td className="cell-category">
                      {editingCategory === p.id ? (
                        <select
                          className="category-select"
                          defaultValue={p.category || ''}
                          onChange={(e) => handleCategoryChange(p, e.target.value)}
                          onBlur={() => setEditingCategory(null)}
                          autoFocus
                          disabled={processing === p.id}
                        >
                          <option value="" disabled>선택</option>
                          {CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className="category-cell-text"
                          onClick={() => setEditingCategory(p.id)}
                        >
                          {CATEGORIES.find((c) => c.value === p.category)?.label || p.category || '-'}
                        </span>
                      )}
                    </td>
                    <td className="cell-review-count">{p.review_count}</td>
                    <td>
                      <button
                        className={`toggle-switch ${p.is_active ? 'active' : ''}`}
                        onClick={() => handleToggleActive(p)}
                        disabled={processing === p.id}
                      >
                        <span className="toggle-knob" />
                      </button>
                    </td>
                    <td className="cell-date">
                      {new Date(p.created_at).toLocaleDateString('ko-KR')}
                    </td>
                  </tr>
                ))}
            {!loading && places.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-row">
                  {debouncedKeyword || categoryFilter ? '검색 결과가 없습니다' : '등록된 장소가 없습니다'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {nextCursor && (
        <div className="load-more-wrapper">
          <button
            className="load-more"
            onClick={() => fetchPlaces(true)}
            disabled={loading}
          >
            더보기
          </button>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="toast">
          <CheckCircle2 size={18} color="#22C55E" />
          {toast}
        </div>
      )}
    </div>
  );
}
