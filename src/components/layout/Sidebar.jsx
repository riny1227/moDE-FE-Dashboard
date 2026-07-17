import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Flag, Users, MessageSquare, MapPin, LogOut } from 'lucide-react';
import './Sidebar.css';

const menuItems = [
  { path: '/', label: '대시보드', icon: LayoutDashboard },
  { path: '/reports', label: '신고관리', icon: Flag },
  { path: '/users', label: '사용자관리', icon: Users },
  { path: '/reviews', label: '리뷰관리', icon: MessageSquare },
  { path: '/places', label: '장소관리', icon: MapPin },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const admin = (() => {
    try {
      return JSON.parse(localStorage.getItem('admin_user'));
    } catch {
      return null;
    }
  })();
  const name = admin?.name || '관리자';

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <LayoutDashboard size={20} color="#fff" />
        </div>
        <span>Admin</span>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          if (item.locked) {
            return (
              <div key={item.path} className="sidebar-link disabled">
                <Icon size={20} />
                <span className="sidebar-link-label">{item.label}</span>
                <span className="sidebar-badge-locked">준비중</span>
              </div>
            );
          }
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={20} />
              <span className="sidebar-link-label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-avatar">{name.charAt(0)}</div>
        <div className="sidebar-user">
          <div className="sidebar-user-name">{name}</div>
          <div className="sidebar-user-role">관리자</div>
        </div>
        <button className="sidebar-logout" onClick={handleLogout} title="로그아웃">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
