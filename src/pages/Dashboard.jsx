import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Star, Siren, MapPin, ImageOff, MessageSquare } from 'lucide-react';
import { getStats, getReports, getReviews } from '../api/admin';
import './Dashboard.css';

const STAT_CARDS = [
  { key: 'total_users', label: '전체 사용자', icon: Users, link: '/users' },
  { key: 'today_reviews', label: '오늘 리뷰', icon: Star, link: '/reviews' },
  { key: 'pending_reports', label: '대기 중 신고', icon: Siren, pending: true, link: '/reports' },
  { key: 'active_places', label: '활성 장소', icon: MapPin, link: '/places' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      getStats(),
      getReports({ status: 'PENDING', limit: 5 }),
      getReviews({ limit: 5 }),
    ])
      .then(([statsData, reportsData, reviewsData]) => {
        setStats(statsData);
        setRecentReports(reportsData.reports);
        setRecentReviews(reviewsData.reviews);
      })
      .catch(() => setError('데이터를 불러오지 못했습니다'))
      .finally(() => setLoading(false));
  }, []);

  const pendingCount = stats?.pending_reports ?? 0;

  return (
    <div>
      <h1 className="page-title">대시보드</h1>
      <p className="page-subtitle">서비스 현황을 한눈에 확인하세요</p>

      {error && <p className="dashboard-error">{error}</p>}

      <div className="stats-grid">
        {STAT_CARDS.map(({ key, label, icon: Icon, pending, link }) => {
          const isHot = pending && pendingCount > 0;
          return (
            <div
              key={key}
              className={`stat-card ${isHot ? 'stat-card--hot' : ''}`}
              onClick={() => navigate(link)}
            >
              <div className={`stat-chip ${isHot ? 'stat-chip--hot' : ''}`}>
                <Icon size={24} color={isHot ? '#F08C1E' : '#6489F2'} />
              </div>
              {loading ? (
                <div className="skel skel-value" />
              ) : (
                <div className={`stat-value ${isHot ? 'stat-value--hot' : ''}`}>
                  {stats ? stats[key].toLocaleString() : '-'}
                </div>
              )}
              <div className="stat-label">{label}</div>
            </div>
          );
        })}
      </div>

      <div className="recent-reports">
        <div className="recent-reports-header">
          <h2>최근 신고</h2>
          <a onClick={() => navigate('/reports')} className="recent-reports-link">
            전체 보기
          </a>
        </div>
        {loading ? (
          [0, 1, 2].map((i) => (
            <div key={i} className="recent-row">
              <div className="skel skel-thumb" />
              <div style={{ flex: 1 }}>
                <div className="skel skel-text" style={{ width: 140 }} />
                <div className="skel skel-text-sm" style={{ width: 70 }} />
              </div>
              <div className="skel skel-text-sm" style={{ width: 100 }} />
            </div>
          ))
        ) : recentReports.length === 0 ? (
          <div className="recent-empty">미처리 신고가 없습니다</div>
        ) : (
          recentReports.map((r) => (
            <div key={r.id} className="recent-row">
              {r.review_image_url ? (
                <div
                  className="recent-thumb"
                  style={{ backgroundImage: `url(${r.review_image_url})` }}
                />
              ) : (
                <div className="recent-thumb recent-thumb--empty">
                  <ImageOff size={18} color="#B0B8C1" />
                </div>
              )}
              <div className="recent-info">
                <div className="recent-reason">{r.reason}</div>
                <div className="recent-reporter">{r.reporter_nickname}</div>
              </div>
              <div className="recent-date">
                {new Date(r.created_at).toLocaleDateString('ko-KR')}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="recent-reviews">
        <div className="recent-reports-header">
          <h2>최근 리뷰</h2>
          <a onClick={() => navigate('/reviews')} className="recent-reports-link">
            전체 보기
          </a>
        </div>
        {loading ? (
          [0, 1, 2].map((i) => (
            <div key={i} className="recent-row">
              <div className="skel skel-thumb" />
              <div style={{ flex: 1 }}>
                <div className="skel skel-text" style={{ width: 140 }} />
                <div className="skel skel-text-sm" style={{ width: 70 }} />
              </div>
              <div className="skel skel-text-sm" style={{ width: 100 }} />
            </div>
          ))
        ) : recentReviews.length === 0 ? (
          <div className="recent-empty">최근 리뷰가 없습니다</div>
        ) : (
          recentReviews.map((r) => (
            <div key={r.id} className="recent-row">
              {r.image_url ? (
                <div
                  className="recent-thumb"
                  style={{ backgroundImage: `url(${r.image_url})` }}
                />
              ) : (
                <div className="recent-thumb recent-thumb--empty">
                  <MessageSquare size={18} color="#B0B8C1" />
                </div>
              )}
              <div className="recent-info">
                <div className="recent-reason">
                  {r.place_name ?? '(삭제된 장소)'}
                </div>
                <div className="recent-reporter">{r.author_nickname}</div>
              </div>
              <div className="recent-date">
                {new Date(r.created_at).toLocaleDateString('ko-KR')}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
