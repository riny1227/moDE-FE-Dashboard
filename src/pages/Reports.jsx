import { useState, useEffect, useCallback } from 'react';
import { ImageOff, CheckCircle2, X } from 'lucide-react';
import { getReports, processReport } from '../api/admin';
import './Reports.css';

const FILTER_TABS = [
  { value: '', label: '전체' },
  { value: 'PENDING', label: '미처리' },
  { value: 'RESOLVED', label: '승인' },
  { value: 'REJECTED', label: '거절' },
];

const STATUS_BADGE = {
  PENDING: { label: '미처리', className: 'badge-pending' },
  RESOLVED: { label: '승인', className: 'badge-resolved' },
  REJECTED: { label: '거절', className: 'badge-rejected' },
};

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [cursor, setCursor] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(null);
  const [processingType, setProcessingType] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [imageModal, setImageModal] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const fetchReports = useCallback(
    async (loadMore = false) => {
      setLoading(true);
      setError('');
      try {
        const params = { limit: 20 };
        if (statusFilter) params.status = statusFilter;
        if (loadMore && cursor) params.cursor = cursor;

        const data = await getReports(params);
        setReports((prev) => (loadMore ? [...prev, ...data.reports] : data.reports));
        setNextCursor(data.next_cursor);
        setCursor(data.next_cursor);
      } catch {
        setError('신고 목록을 불러오지 못했습니다');
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, cursor],
  );

  useEffect(() => {
    setCursor(null);
    setNextCursor(null);
    fetchReports(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleApprove = async (id) => {
    setConfirm(null);
    setProcessing(id);
    setProcessingType('approve');
    try {
      await processReport(id, 'RESOLVED');
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'RESOLVED' } : r)),
      );
      showToast('신고를 승인했습니다');
    } catch (err) {
      alert(err.message || '처리에 실패했습니다');
    } finally {
      setProcessing(null);
      setProcessingType(null);
    }
  };

  const handleReject = async (id) => {
    setProcessing(id);
    setProcessingType('reject');
    try {
      await processReport(id, 'REJECTED');
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'REJECTED' } : r)),
      );
      showToast('신고를 거절했습니다');
    } catch (err) {
      alert(err.message || '처리에 실패했습니다');
    } finally {
      setProcessing(null);
      setProcessingType(null);
    }
  };

  const counts = {};
  counts[''] = reports.length;
  FILTER_TABS.forEach(({ value }) => {
    if (value) counts[value] = reports.filter((r) => r.status === value).length;
  });

  return (
    <div>
      <h1 className="page-title">신고 관리</h1>
      <p className="page-subtitle">신고된 리뷰를 검토하고 처리하세요</p>

      {error && <p className="reports-error">{error}</p>}

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

      <div className="reports-table-wrapper">
        <table className="reports-table">
          <thead>
            <tr>
              <th style={{ width: 72 }}>사진</th>
              <th style={{ width: 130 }}>신고사유</th>
              <th>상세내용</th>
              <th style={{ width: 96 }}>신고자</th>
              <th style={{ width: 140 }}>신고일시</th>
              <th style={{ width: 84 }}>상태</th>
              <th style={{ width: 150 }}>처리</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? [0, 1, 2, 3, 4].map((i) => (
                  <tr key={i}>
                    <td><div className="skel" style={{ width: 48, height: 48, borderRadius: 8 }} /></td>
                    <td><div className="skel" style={{ width: 80, height: 14 }} /></td>
                    <td><div className="skel" style={{ width: '90%', height: 12, marginBottom: 6 }} /><div className="skel" style={{ width: '60%', height: 12 }} /></td>
                    <td><div className="skel" style={{ width: 56, height: 12 }} /></td>
                    <td><div className="skel" style={{ width: 100, height: 12 }} /></td>
                    <td><div className="skel" style={{ width: 50, height: 22, borderRadius: 11 }} /></td>
                    <td><div className="skel" style={{ width: 110, height: 32, borderRadius: 8 }} /></td>
                  </tr>
                ))
              : reports.map((r) => {
                  const badge = STATUS_BADGE[r.status];
                  const isBusy = processing === r.id;
                  return (
                    <tr key={r.id}>
                      <td>
                        {r.review_image_url ? (
                          <div
                            className="report-thumb clickable"
                            style={{ backgroundImage: `url(${r.review_image_url})` }}
                            onClick={() => setImageModal({ url: r.review_image_url })}
                          />
                        ) : (
                          <div
                            className="report-thumb report-thumb--empty clickable"
                            onClick={() => setImageModal({ deleted: true })}
                          >
                            삭제됨
                          </div>
                        )}
                      </td>
                      <td className="cell-reason">{r.reason}</td>
                      <td>
                        <div className="cell-detail">{r.detail}</div>
                      </td>
                      <td className="cell-reporter">{r.reporter_nickname}</td>
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
                        <span className={`badge ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td>
                        {r.status === 'PENDING' ? (
                          <div className="action-buttons">
                            <button
                              className="btn-approve"
                              disabled={isBusy}
                              onClick={() => setConfirm(r.id)}
                            >
                              {isBusy && processingType === 'approve' ? (
                                <span className="btn-spinner" />
                              ) : (
                                '승인'
                              )}
                            </button>
                            <button
                              className="btn-reject"
                              disabled={isBusy}
                              onClick={() => handleReject(r.id)}
                            >
                              {isBusy && processingType === 'reject' ? (
                                <span className="btn-spinner btn-spinner--gray" />
                              ) : (
                                '거절'
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="cell-processed">처리됨</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            {!loading && reports.length === 0 && (
              <tr>
                <td colSpan={7} className="empty-row">
                  신고 내역이 없습니다
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
            onClick={() => fetchReports(true)}
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
            <h3>신고 승인</h3>
            <p>
              이 신고를 승인하면 해당 리뷰가 블라인드 처리됩니다.
            </p>
            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setConfirm(null)}>
                취소
              </button>
              <button
                className="modal-btn-confirm"
                onClick={() => handleApprove(confirm)}
              >
                승인
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
            {imageModal.deleted ? (
              <div className="image-modal-deleted">
                <ImageOff size={44} color="#8B95A1" style={{ opacity: 0.7 }} />
                <span>삭제된 이미지입니다</span>
              </div>
            ) : (
              <img
                className="image-modal-img"
                src={imageModal.url}
                alt="리뷰 이미지"
              />
            )}
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
