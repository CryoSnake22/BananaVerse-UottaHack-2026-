import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&display=swap');
        
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          border-bottom: 1px solid rgba(229, 231, 235, 0.5);
        }
        .navbar-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 1rem 1.5rem;
        }
        .navbar-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .team-name-container {
          display: flex;
          align-items: center;
        }
        .team-name {
          font-size: 2rem;
          font-weight: 500;
          font-family: 'Playfair Display', serif;
          letter-spacing: -0.02em;
          color: #111827;
          margin: 0;
        }
        .nav-buttons {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .nav-button {
          position: relative;
          padding: 0.5rem 1.25rem;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          color: #374151;
          font-weight: 500;
          border-radius: 0.5rem;
          border: 1px solid rgba(229, 231, 235, 0.6);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .nav-button:hover {
          background: rgba(255, 255, 255, 0.8);
          border-color: rgba(209, 213, 219, 0.6);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
        }
        .button-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .button-icon {
          width: 1.25rem;
          height: 1.25rem;
        }
      `}</style>

      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-content">
            <div className="team-name-container">
              <h1 className="team-name">BananaScape</h1>
            </div>

            <div className="nav-buttons">
              {/* Home */}
              <Link to="/" className="nav-button">
                <span className="button-content">
                  <svg
                    className="button-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Home
                </span>
              </Link>

              {/* Survey */}
              <Link to="/prototypeSurvey" className="nav-button">
                <span className="button-content">
                  <svg
                    className="button-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17v-6h6v6m2 4H7a1 1 0 01-1-1V5a1 1 0 011-1h10a1 1 0 011 1v15a1 1 0 01-1 1z"
                    />
                  </svg>
                  Survey
                </span>
              </Link>

              {/* Create Survey */}
              <Link to="/createSurvey" className="nav-button">
                <span className="button-content">
                  <svg
                    className="button-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create Survey
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
