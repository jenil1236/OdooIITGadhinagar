import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const features = [
    {
      icon: "📸",
      title: "AI Receipt Scanning",
      description:
        "Upload receipts and automatically extract amounts, dates, and vendor information using advanced OCR technology.",
    },
    {
      icon: "💰",
      title: "Expense Tracking",
      description:
        "Track all your business expenses in one place with real-time currency conversion and categorization.",
    },
    {
      icon: "⚡",
      title: "Quick Approvals",
      description:
        "Streamlined approval workflow for managers with instant notifications and status tracking.",
    },
    {
      icon: "📊",
      title: "Smart Analytics",
      description:
        "Get insights into your spending patterns with detailed reports and visual analytics.",
    },
  ];

  const stats = [
    { number: "10K+", label: "Receipts Processed" },
    { number: "95%", label: "OCR Accuracy" },
    { number: "50+", label: "Currencies Supported" },
    { number: "24/7", label: "Available" },
  ];

  return (
    <div className="homepage">
      {/* Header */}
      <header className="home-header">
        <div className="header-content">
          <div className="logo">
            <i className="fas fa-receipt"></i>
            <span>ExpenseManager</span>
          </div>
          <nav className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#testimonials">Testimonials</a>
            {user ? (
              <div className="user-section">
                <span>Welcome, {user.name}</span>
                <button
                  onClick={() =>
                    navigate(user.role === "manager" ? "/manager" : "/employee")
                  }
                  className="btn-primary"
                >
                  Go to Dashboard
                </button>
                <button onClick={logout} className="btn-secondary">
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="btn-primary"
              >
                Get Started
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Smart Expense Management Made Simple</h1>
            <p>
              Automate your expense tracking with AI-powered receipt scanning.
              Save time, reduce errors, and focus on what matters most.
            </p>
            <div className="hero-buttons">
              {user ? (
                <button
                  onClick={() =>
                    navigate(user.role === "manager" ? "/manager" : "/employee")
                  }
                  className="btn-primary large"
                >
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/login")}
                    className="btn-primary large"
                  >
                    Start Free Trial
                  </button>
                  <button className="btn-secondary large">Watch Demo</button>
                </>
              )}
            </div>
            <div className="hero-stats">
              {stats.map((stat, index) => (
                <div key={index} className="stat">
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-visual">
            <div className="dashboard-preview">
              <div className="preview-header">
                <div className="preview-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div className="preview-content">
                <div className="preview-card">
                  <div className="card-header">
                    <span>Recent Expenses</span>
                    <button className="btn-small">View All</button>
                  </div>
                  <div className="expense-list">
                    {[
                      "Business Lunch",
                      "Software Subscription",
                      "Travel Expenses",
                      "Office Supplies",
                    ].map((item, idx) => (
                      <div key={idx} className="expense-item">
                        <div className="expense-info">
                          <span className="expense-title">{item}</span>
                          <span className="expense-amount">
                            ${(150 + idx * 50).toLocaleString()}
                          </span>
                        </div>
                        <span className="status approved">Approved</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <h2>Powerful Features for Modern Teams</h2>
            <p>
              Everything you need to streamline your expense management process
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Simple steps to manage your expenses efficiently</p>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Upload Receipt</h3>
                <p>
                  Take a photo or upload your receipt using our mobile app or
                  web portal
                </p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>AI Processing</h3>
                <p>
                  Our advanced OCR technology automatically extracts all
                  relevant information
                </p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Review & Submit</h3>
                <p>
                  Verify the extracted data and submit for approval with one
                  click
                </p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Get Approved</h3>
                <p>
                  Managers review and approve expenses in real-time with full
                  transparency
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2>Trusted by Teams Worldwide</h2>
            <p>See what our users have to say about their experience</p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-content">
                "ExpenseManager reduced our expense processing time by 80%. The
                AI receipt scanning is incredibly accurate!"
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">SD</div>
                <div className="author-info">
                  <strong>Sarah Davis</strong>
                  <span>Finance Manager, TechCorp</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-content">
                "As a salesperson constantly on the road, the mobile receipt
                capture has been a game-changer for me."
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">MJ</div>
                <div className="author-info">
                  <strong>Mike Johnson</strong>
                  <span>Sales Executive, Global Solutions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Expense Management?</h2>
            <p>Join thousands of companies already using ExpenseManager</p>
            {user ? (
              <button
                onClick={() =>
                  navigate(user.role === "manager" ? "/manager" : "/employee")
                }
                className="btn-primary large"
              >
                Go to Dashboard
              </button>
            ) : (
              <div className="cta-buttons">
                <button
                  onClick={() => navigate("/login")}
                  className="btn-primary large"
                >
                  Start Free Trial
                </button>
                <button className="btn-secondary large">Schedule Demo</button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">
                <i className="fas fa-receipt"></i>
                <span>ExpenseManager</span>
              </div>
              <p>Smart expense tracking for modern businesses</p>
            </div>
            <div className="footer-section">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#pricing">Pricing</a>
            </div>
            <div className="footer-section">
              <h4>Company</h4>
              <a href="#about">About</a>
              <a href="#careers">Careers</a>
              <a href="#contact">Contact</a>
            </div>
            <div className="footer-section">
              <h4>Legal</h4>
              <a href="#privacy">Privacy</a>
              <a href="#terms">Terms</a>
              <a href="#security">Security</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 ExpenseManager. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
