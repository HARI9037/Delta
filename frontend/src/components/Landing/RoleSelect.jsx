import { useNavigate, Link } from 'react-router-dom'

export default function RoleSelect() {
  const navigate = useNavigate()

  return (
    <div className="auth-wrapper" style={{ flexDirection: 'column' }}>
      <div
        className="flex-grow-1 d-flex flex-column align-items-center justify-content-center p-4"
        style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--dark-bg) 100%)' }}
      >
        <div className="text-center mb-5">
          <h2 className="text-white fw-bold mb-2">
            DEL<span style={{ color: 'var(--accent)' }}>TA</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>Choose your role to continue</p>
        </div>

        <div className="row g-4 justify-content-center w-100" style={{ maxWidth: 640 }}>
          <div className="col-sm-6">
            <div
              className="card h-100 text-center p-4"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
              onClick={() => navigate('/login?role=student')}
            >
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: 72, height: 72, background: 'rgba(238,12,3,0.15)', color: 'var(--accent)', fontSize: '2rem' }}
              >
                <i className="bi bi-mortarboard-fill"></i>
              </div>
              <h5 className="text-white fw-semibold mb-2">I'm a Student</h5>
              <p className="small mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Find tutors, book sessions, and track learning progress.
              </p>
              <button className="btn btn-sm w-100" style={{ background: 'var(--accent)', color: '#fff' }}>
                Student Login <i className="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
          </div>

          <div className="col-sm-6">
            <div
              className="card h-100 text-center p-4"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
              onClick={() => navigate('/login?role=teacher')}
            >
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: 72, height: 72, background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '2rem' }}
              >
                <i className="bi bi-person-video3"></i>
              </div>
              <h5 className="text-white fw-semibold mb-2">I'm a Teacher</h5>
              <p className="small mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Manage schedule, view students, and set availability.
              </p>
              <button className="btn btn-sm w-100 btn-light">
                Teacher Login <i className="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 text-center">
          <Link to="/" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.9rem' }}>
            <i className="bi bi-arrow-left me-1"></i>Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
