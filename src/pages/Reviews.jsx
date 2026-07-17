import { useState, useEffect, useCallback } from 'react';
import { ImageOff, X, CheckCircle2 } from 'lucide-react';
import { getReviews, blindReview } from '../api/admin';
import './Reviews.css';

const FILTER_TABS = [
  { value: '', label: '전체' },
  { value: 'ACTIVE', label: '노출중' },
  { value: 'ARCHIVED', label: '아카이브' },
  { value: 'BLINDED', label: '블라인드' },
];

const STATUS_BADGE = {
  ACTIVE: { label: '노출중', className: 'badge-active' },
  ARCHIVED: { label: '아카이브', className: 'badge-archived' },
  BLINDED: { label: '블라인드', className: 'badge-blinded' },
};

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [cursor, setCursor] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [imageModal, setImageModal] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const fetchReviews = useCallback(
    async (loadMore = false) => {
      setLoading(true);
      setError('');
      try {
        const params = { limit: 20 };
        if (statusFilter) params.status = statusFilter;
        if (loadMore && cursor) params.cursor = cursor;

        const data = await getReviews(params);
        setReviews((prev) => (loadMore ? [...prev, ...data.reviews] : data.reviews));
        setNextCursor(data.next_cursor);
        setCursor(data.next_cursor);
      } catch {
        setError('리뷰 목록을 불러오지 못했습니다');
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, cursor],
  );

  useEffect(() => {
    setCursor(null);
    setNextCursor(null);
    fetchReviews(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleBlind = async (id) => {
    setConfirm(null);
    setProcessing(id);
    try {
      await blindReview(id, 'BLINDED');
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'BLINDED' } : r)),
      );
      showToast('리뷰를 블라인드 처리했습니다');
    } catch (err) {
      alert(err.message || '처리에 실패했습니다');
    } finally {
      setProcessing(null);
    }
  };

  const handleUnblind = async (id) => {
    setProcessing(id);
    try {
      await blindReview(id, 'ACTIVE');
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'ACTIVE' } : r)),
      );
      showToast('블라인드를 해제했습니다');
    } catch (err) {
      alert(err.message || '처리에 실패했습니다');
    } finally {
      setProcessing(null);
    }
  };

  const counts = {};
  counts[''] = reviews.length;
  FILTER_TABS.forEach(({ value }) => {
    if (value) counts[value] = reviews.filter((r) => r.status === value).length;
  });

  return (
    <div>
      <h1 className="page-title">리뷰 관리</h1>
      <p className="page-subtitle">리뷰를 검토하고 블라인드 처리할 수 있습니다</p>

      {error && <p className="reviews-error">{error}</p>}

      <div className="filter-tabs">
        {FILTER_TABS.map(({ value, label }) => (
          <button
            key={value}
            className={`filter-tab ${statusFilter === value ? 'active' : ''}`}
            onClick={() => setStatusFilter(value)}
          >
            <span>{label}</span>
            <span
              className={`filter-tab-count ${statusFilter === value ? 'active' : ''}`}
            >
              {counts[value] ?? 0}
            </span>
          </button>
        ))}
      </div>

      <div className="reviews-table-wrapper">
        <table className="reviews-table">
          <thead>
            <tr>
              <th style={{ width: 72 }}>사진</th>
              <th style={{ width: 130 }}>장소명</th>
              <th style={{ width: 80 }}>혼잡도</th>
              <th>코멘트</th>
              <th style={{ width: 96 }}>작성자</th>
              <th style={{ width: 84 }}>상태</th>
              <th style={{ width: 140 }}>작성일</th>
              <th style={{ width: 110 }}>처리</th>
            </tr>
          </thead>
          <tbody>
            {loading && reviews.length === 0
              ? [0, 1, 2, 3, 4].map((i) => (
                  <tr key={i}>
                    <td><div className="skel" style={{ width: 48, height: 48, borderRadius: 8 }} /></td>
                    <td><div className="skel" style={{ width: 90, height: 14 }} /></td>
                    <td><div className="skel" style={{ width: 50, height: 14 }} /></td>
                    <td><div className="skel" style={{ width: '80%', height: 12 }} /></td>
                    <td><div className="skel" style={{ width: 56, height: 12 }} /></td>
                    <td><div className="skel" style={{ width: 50, height: 22, borderRadius: 11 }} /></td>
                    <td><div className="skel" style={{ width: 100, height: 12 }} /></td>
                    <td><div className="skel" style={{ width: 70, height: 32, borderRadius: 8 }} /></td>
                  </tr>
                ))
              : reviews.map((r) => {
                  const badge = STATUS_BADGE[r.status];
                  const isBusy = processing === r.id;
                  return (
                    <tr key={r.id}>
                      <td>
                        {r.image_url ? (
                          <div
                            className="review-thumb clickable"
                            style={{ backgroundImage: `url(${r.image_url})` }}
                            onClick={() => setImageModal({ url: r.image_url })}
                          />
                        ) : (
                          <div className="review-thumb review-thumb--empty">
                            <ImageOff size={18} color="#B0B8C1" />
                          </div>
                        )}
                      </td>
                      <td className="cell-place">
                        {r.place_name ?? <span className="text-muted">(삭제된 장소)</span>}
                      </td>
                      <td className="cell-congestion">{r.congestion_level}</td>
                      <td>
                        <div className="cell-comment">{r.comment}</div>
                      </td>
                      <td className="cell-author">{r.author_nickname}</td>
                      <td>
                        <span className={`badge ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="cell-date">
                        {new Date(r.created_at).toLocaleString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td>
                        {r.status !== 'BLINDED' ? (
                          <button
                            className="btn-blind"
                            disabled={isBusy}
                            onClick={() => setConfirm(r.id)}
                          >
                            {isBusy ? <span className="btn-spinner" /> : '블라인드'}
                          </button>
                        ) : (
                          <button
                            className="btn-unblind"
                            disabled={isBusy}
                            onClick={() => handleUnblind(r.id)}
                          >
                            {isBusy ? <span className="btn-spinner btn-spinner--gray" /> : '해제'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
            {!loading && reviews.length === 0 && (
              <tr>
                <td colSpan={8} className="empty-row">
                  리뷰가 없습니다
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
            onClick={() => fetchReviews(true)}
            disabled={loading}
          >
            더보기
          </button>
        </div>
      )}

      {/* Confirm modal */}
      {confirm && (
        <div className="modal-overlay" onClick={() => setConfirm(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>블라인드 처리</h3>
            <p>
              이 리뷰를 블라인드 처리하면 다른 사용자에게 노출되지 않습니다.
            </p>
            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setConfirm(null)}>
                취소
              </button>
              <button
                className="modal-btn-confirm"
                onClick={() => handleBlind(confirm)}
              >
                블라인드
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image modal */}
      {imageModal && (
        <div className="modal-overlay" onClick={() => setImageModal(null)}>
          <div className="image-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="image-modal-close"
              onClick={() => setImageModal(null)}
            >
              <X size={20} color="#fff" />
            </button>
            <img
              className="image-modal-img"
              src={imageModal.url}
              alt="리뷰 이미지"
            />
          </div>
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
