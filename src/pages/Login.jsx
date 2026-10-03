import { useState } from "react";
import { LockKeyhole, Mail, ArrowRight, LoaderCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function Login() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("mtayyab0413@gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email.trim(), password);

      const destination = location.state?.from?.pathname || "/";
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <span>MT</span>
        </div>

        <div className="login-heading">
          <span>MT LUXOR</span>
          <h1>Admin Panel</h1>
          <p>Sign in to manage your store.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Email
            <div className="input-wrap">
              <Mail size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Admin email"
                required
              />
            </div>
          </label>

          <label>
            Password
            <div className="input-wrap">
              <LockKeyhole size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
              />
            </div>
          </label>

          {error && <div className="form-error">{error}</div>}

          <button className="login-btn" disabled={loading}>
            {loading ? (
              <>
                <LoaderCircle className="spin" size={18} />
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          Authorized administration only
        </div>
      </div>
    </main>
  );
}
