import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { getUsers } from '../api/admin';
import './Users.css';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cursor, setCursor] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(
    async (loadMore = false) => {
      setLoading(true);
      setError('');
      try {
        const params = { limit: 20 };
        if (loadMore && cursor) params.cursor = cursor;

        const data = await getUsers(params);
        setUsers((prev) => (loadMore ? [...prev, ...data.users] : data.users));
        setNextCursor(data.next_cursor);
        setCursor(data.next_cursor);
      } catch {
        setError('사용자 목록을 불러오지 못했습니다');
      } finally {
        setLoading(false);
      }
    },
    [cursor],
  );

  useEffect(() => {
    fetchUsers(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h1 className="page-title">사용자 관리</h1>
      <p className="page-subtitle">등록된 사용자를 조회할 수 있습니다</p>

      {error && <p className="users-error">{error}</p>}

      <div className="users-search">
        <Search size={18} className="users-search-icon" />
        <input
          className="users-search-input"
          type="text"
          placeholder="닉네임 또는 이메일로 검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th style={{ width: 56 }}>프로필</th>
              <th style={{ width: 130 }}>닉네임</th>
              <th>이메일</th>
              <th style={{ width: 90 }}>리뷰 수</th>
              <th style={{ width: 140 }}>가입일</th>
            </tr>
          </thead>
          <tbody>
            {loading && users.length === 0
              ? [0, 1, 2, 3, 4].map((i) => (
                  <tr key={i}>
                    <td><div className="skel" style={{ width: 32, height: 32, borderRadius: '50%' }} /></td>
                    <td><div className="skel" style={{ width: 80, height: 14 }} /></td>
                    <td><div className="skel" style={{ width: '70%', height: 14 }} /></td>
                    <td><div className="skel" style={{ width: 40, height: 14 }} /></td>
                    <td><div className="skel" style={{ width: 100, height: 14 }} /></td>
                  </tr>
                ))
              : users
                .filter((u) => {
                  if (!searchQuery) return true;
                  const q = searchQuery.toLowerCase();
                  return u.nickname?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
                })
                .map((u) => (
                  <tr key={u.id}>
                    <td>
                      {u.profile_image_url ? (
                        <img
                          className="user-avatar"
                          src={u.profile_image_url}
                          alt={u.nickname}
                        />
                      ) : (
                        <div className="user-avatar user-avatar--initial">
                          {u.nickname?.charAt(0) || '?'}
                        </div>
                      )}
                    </td>
                    <td className="cell-nickname">{u.nickname}</td>
                    <td className="cell-email">{u.email}</td>
                    <td className="cell-review-count">{u.review_count}</td>
                    <td className="cell-date">
                      {new Date(u.created_at).toLocaleDateString('ko-KR')}
                    </td>
                  </tr>
                ))}
            {!loading && users.length === 0 && !searchQuery && (
              <tr>
                <td colSpan={5} className="empty-row">
                  등록된 사용자가 없습니다
                </td>
              </tr>
            )}
            {!loading && users.length > 0 && searchQuery && users.every((u) => {
              const q = searchQuery.toLowerCase();
              return !u.nickname?.toLowerCase().includes(q) && !u.email?.toLowerCase().includes(q);
            }) && (
              <tr>
                <td colSpan={5} className="empty-row">
                  검색 결과가 없습니다
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
            onClick={() => fetchUsers(true)}
            disabled={loading}
          >
            더보기
          </button>
        </div>
      )}
    </div>
  );
}
