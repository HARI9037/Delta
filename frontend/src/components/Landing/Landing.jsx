import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="hero-bg">
      {/* Navbar */}
      <nav className="d-flex align-items-center justify-content-between px-4 py-3">
        <h5 className="text-white fw-bold mb-0">
          DEL<span style={{ color: 'var(--accent)' }}>TA</span>
        </h5>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-light btn-sm" onClick={() => navigate('/login')}>
            Sign In
          </button>
          <button
            className="btn btn-sm"
            style={{ background: 'var(--accent)', color: '#fff', border: 'none' }}
            onClick={() => navigate('/register')}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="flex-grow-1 d-flex align-items-center">
        <div className="container py-5">
          <div className="row align-items-center g-5">
            {/* Left text */}
            <div className="col-lg-6">
              <span
                className="badge rounded-pill px-3 py-2 mb-3"
                style={{ background: 'rgba(238,12,3,0.2)', color: '#ff9f9c', fontSize: '0.8rem' }}
              >
                <i className="bi bi-stars me-1"></i> Smart DELTA Management
              </span>

              <h1 className="text-white fw-bold mb-4" style={{ fontSize: '2.8rem', lineHeight: 1.2 }}>
                Connect Students<br />
                with the Best<br />
                <span style={{ color: 'var(--accent)' }}>Tutors</span>
              </h1>

              <p className="mb-4" style={{ color: 'rgba(255,255,255,0.7)', maxWidth: 460 }}>
                Book sessions, manage your schedule, and track payments — all from one professional platform.
              </p>

              <div className="d-flex gap-3 flex-wrap">
                <button
                  className="btn btn-lg px-4 fw-semibold"
                  style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8 }}
                  onClick={() => navigate('/register')}
                >
                  Get Started Free
                </button>
                <button
                  className="btn btn-lg btn-outline-light px-4"
                  style={{ borderRadius: 8 }}
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </button>
              </div>

              {/* Quick stats */}
              <div className="row g-3 mt-4">
                {[
                  { icon: 'bi-people-fill',  val: '500+', label: 'Students'   },
                  { icon: 'bi-person-badge', val: '50+',  label: 'Tutors'     },
                  { icon: 'bi-book-half',    val: '20+',  label: 'Subjects'   },
                ].map((s) => (
                  <div className="col-4" key={s.label}>
                    <div
                      className="text-center p-3 rounded-3"
                      style={{ background: 'rgba(255,255,255,0.07)' }}
                    >
                      <i className={`bi ${s.icon} fs-4`} style={{ color: 'var(--accent)' }}></i>
                      <div className="text-white fw-bold">{s.val}</div>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem' }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right card (decorative) */}
            <div className="col-lg-6 d-none d-lg-block">
              <div
                className="rounded-4 p-4"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <p className="text-white fw-semibold mb-3">
                  <i className="bi bi-calendar-check me-2" style={{ color: 'var(--accent)' }}></i>
                  Today's Schedule
                </p>
                {[
                  { time: '09:00', subject: 'Mathematics', teacher: 'Dr. Sharma',  mode: 'Online'  },
                  { time: '11:30', subject: 'Physics',     teacher: 'Ms. Patel',   mode: 'Offline' },
                  { time: '14:00', subject: 'Chemistry',   teacher: 'Mr. Khan',    mode: 'Online'  },
                ].map((c) => (
                  <div
                    key={c.time}
                    className="d-flex align-items-center gap-3 rounded-3 p-2 mb-2"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  >
                    <span
                      className="badge px-2 py-1"
                      style={{ background: 'var(--accent)', fontSize: '0.75rem', minWidth: 48 }}
                    >
                      {c.time}
                    </span>
                    <div className="flex-grow-1">
                      <div className="text-white small fw-semibold">{c.subject}</div>
                      <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.75rem' }}>{c.teacher}</div>
                    </div>
                    <span
                      className="badge"
                      style={{
                        background: c.mode === 'Online' ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)',
                        color: c.mode === 'Online' ? '#22c55e' : '#f59e0b',
                        fontSize: '0.72rem',
                      }}
                    >
                      {c.mode}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center py-3 mb-0" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
        © 2025 DELTA. All rights reserved.
      </p>
    </div>
  )
}
