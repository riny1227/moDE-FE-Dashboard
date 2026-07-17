import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import { login } from '../api/admin';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { access_token, admin } = await login(email, password);
      localStorage.setItem('admin_token', access_token);
      localStorage.setItem('admin_user', JSON.stringify(admin));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || '이메일 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-logo">
          <div className="login-logo-icon">
            <LayoutDashboard size={20} color="#fff" />
          </div>
          <span>Admin</span>
        </div>

        {error && <div className="login-error">{error}</div>}

        <label className="login-label">
          이메일
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@admin.com"
            required
          />
        </label>

        <label className="login-label">
          비밀번호
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </label>

        <button type="submit" className="login-button" disabled={loading}>
          {loading && <span className="login-spinner" />}
          로그인
        </button>
      </form>
    </div>
  );
}
