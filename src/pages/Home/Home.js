import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Monitor, Sparkles, Edit3, Bot, Image, 
  BarChart3, Users, Link, PenTool, Send, Star, 
  Check, ChevronDown, Menu, X, PlayCircle, 
  Play, Loader2
} from 'lucide-react';
import './Home.css';
import Logo from "../../assets/img/Logo.png";
const Home = () => {

  const navigate = useNavigate();
  // State management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFAQIndex, setOpenFAQIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: null });
  const [toasts, setToasts] = useState([]);
  const [animatedElements, setAnimatedElements] = useState(new Set());

  // Refs for intersection observer
  const observerRef = useRef(null);

  // Data
  const features = [
    {
      icon: Edit3,
      title: 'Unified Composer',
      description: 'Single editor to craft posts for Instagram, Facebook, X, LinkedIn and Youtube. Platform previews, character counters, and platform-specific edits in one place.'
    },
    {
      icon: Calendar,
      title: 'Scheduling & Calendar',
      description: 'Month & Week Views, recurring posts, plan up to 1 year ahead. Drag & drop calendar, timezone aware scheduling.'
    },
    {
      icon: Bot,
      title: 'AI Suite',
      description: 'AI Content Generation, Hashtag Suggestions, Content Optimizer, and Mention Suggestions. Get trending hashtags ranked by discovery reach.'
    },
    {
      icon: Image,
      title: 'Media & Library',
      description: 'Centralized asset library with tagging and folders. Auto-resize & aspect presets for each platform. Video trimming + thumbnail selector.'
    },
    {
      icon: BarChart3,
      title: 'Analytics Snapshot',
      description: 'Engagement per post, best posting times, hashtag performance & growth trends.'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Invite teammates, role-based access, approval workflows. Perfect for agencies and growing teams managing multiple accounts.'
    }
  ];

  const steps = [
    {
      icon: Link,
      title: 'Connect your accounts',
      description: 'Secure OAuth connections to all major platforms. Set up once, schedule everywhere.',
      number: '01'
    },
    {
      icon: PenTool,
      title: 'Create content',
      description: 'AI captions, images/videos, hashtags, mentions. Create from scratch.',
      number: '02'
    },
    {
      icon: Send,
      title: 'Schedule & publish',
      description: 'Smart time suggestions or pick your own calendar slots. Auto-publish or get reminders.',
      number: '03'
    }
  ];

  const testimonials = [
    {
      quote: "Cut our posting time in half — and engagement is up 38%.",
      author: "Sarah Chen",
      role: "Social Manager, boutique agency",
      rating: 5
    },
    {
      quote: "Scheduling 6 months ahead used to be a nightmare. MGA made it simple.",
      author: "Marcus Rodriguez",
      role: "Founder, e-commerce brand",
      rating: 5
    },
    {
      quote: "AI hashtag suggestions are shockingly accurate.",
      author: "Jenny Kim",
      role: "Content Creator, 120K followers",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "1 account per platform",
        "50 scheduled posts/month",
        "Basic AI suggestions",
        "7-day scheduling",
        "Email support"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Pro",
      price: "$29",
      period: "per month",
      description: "For serious content creators",
      features: [
        "Unlimited accounts",
        "Unlimited scheduled posts",
        "Advanced AI suite",
        "1 year scheduling",
        "Bulk upload",
        "Team collaboration (3 seats)",
        "Priority support"
      ],
      cta: "Start Pro Trial",
      popular: true
    },
    {
      name: "Business",
      price: "$99",
      period: "per month",
      description: "For agencies and enterprises",
      features: [
        "Everything in Pro",
        "Unlimited team seats",
        "API integrations",
        "Custom branding",
        "Dedicated support",
        "Onboarding & training"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const faqs = [
    {
      question: "Which platforms are supported?",
      answer: "We support Instagram, Facebook, X (Twitter), LinkedIn, Youtube."
    },
    // {
    //   question: "Can I import posts in bulk?",
    //   answer: "Yes! Perfect for migrating from other tools or planning campaigns in spreadsheets."
    // },
    {
      question: "How accurate are AI suggestions?",
      answer: "Our AI uses platform-specific algorithms and real-time trends. We recommend reviewing suggestions before publishing, but most users find 85%+ accuracy."
    },
    {
      question: "Is there a free plan?",
      answer: "Yes! Our free tier includes 1 account per platform and 50 scheduled posts per month. Perfect for trying out all features."
    },
    {
      question: "Can teams collaborate?",
      answer: "Absolutely. Invite teammates, set role-based permissions, and use approval workflows. Great for agencies managing client accounts."
    },
    {
      question: "Is my data secure?",
      answer: "Yes. We use OAuth authentication (never store passwords), TLS encryption, and SOC 2 compliance. Your content and accounts are safe."
    }
  ];

  // Calendar data
  const calendarDaysWithPosts = [2, 4, 9, 11, 16, 18, 23, 25, 30];

  // Effects
  useEffect(() => {
    // Setup intersection observer for animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setAnimatedElements(prev => new Set([...prev, entry.target.dataset.animateId]));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    // Observe all animatable elements
    const elements = document.querySelectorAll('[data-animate-id]');
    elements.forEach(el => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  useEffect(() => {
    // Close mobile menu on resize
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Handle escape key for modal
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  // Handlers
  const handleGetStarted = () => {
    navigate('/auth');
    };

  const handlePricingAction = (plan, action) => {
    if (action === 'Contact Sales') {
      showContactModal();
    } else {
      handleGetStarted({ current: event.target });
    }
  };

  const handleWatchDemo = () => {
    setModalContent({
      title: 'Watch Demo',
      content: (
        <DemoModal onPlayDemo={playDemo} />
      )
    });
    setIsModalOpen(true);
  };

  const showContactModal = () => {
    setModalContent({
      title: 'Contact Sales',
      content: (
        <ContactForm onSubmit={handleContactSubmit} />
      )
    });
    setIsModalOpen(true);
  };

  const handleContactSubmit = async (formData) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    showToast('✅ Thanks! Our sales team will contact you within 24 hours.', 'success');
    closeModal();
  };

  const playDemo = () => {
    showToast('🎬 Demo video would start playing here!', 'info');
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent({ title: '', content: null });
  };

  const showToast = (message, type = 'info' , duration = 3000) => {
    const id = Date.now();
    const toast = { id, message, type };
    
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const toggleFAQ = (index) => {
    setOpenFAQIndex(openFAQIndex === index ? -1 : index);
  };

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  // Components
  const CalendarGrid = () => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const calendarItems = [];

    // Add day headers
    days.forEach((day, index) => {
      calendarItems.push(
        <div key={`header-${index}`} className="mga-calendar-day">
          {day}
        </div>
      );
    });

    // Add numbered days
    for (let i = 1; i <= 31; i++) {
      const hasPost = calendarDaysWithPosts.includes(i);
      calendarItems.push(
        <div
          key={`day-${i}`}
          className={`mga-calendar-day ${hasPost ? 'mga-has-post' : ''}`}
          data-day={i}
        >
          {i}
          {hasPost && <div className="mga-post-indicator mga-animate-pulse"></div>}
        </div>
      );
    }

    return <div className="mga-calendar-grid">{calendarItems}</div>;
  };

  const ContactForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      company: '',
      message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      await onSubmit(formData);
      setIsSubmitting(false);
      setFormData({ name: '', email: '', company: '', message: '' });
    };

    const handleChange = (e) => {
      setFormData(prev => ({
        ...prev,
        [e.target.name]: e.target.value
      }));
    };

    return (
      <form className="mga-contact-form" onSubmit={handleSubmit}>
        <div className="mga-form-group">
          <label htmlFor="name">Full Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mga-form-group">
          <label htmlFor="email">Work Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mga-form-group">
          <label htmlFor="company">Company *</label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mga-form-group">
          <label htmlFor="message">Tell us about your needs</label>
          <textarea
            id="message"
            name="message"
            rows="4"
            placeholder="How many social accounts do you manage? What's your current workflow?"
            value={formData.message}
            onChange={handleChange}
          />
        </div>
        <button
          type="submit"
          className="mga-btn mga-btn-primary mga-btn-large"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mga-spin" size={16} />
              Sending...
            </>
          ) : (
            'Send Message'
          )}
        </button>
      </form>
    );
  };

  const DemoModal = ({ onPlayDemo }) => (
    <div className="mga-demo-content">
      <div className="mga-video-placeholder">
        <PlayCircle size={64} />
        <p>60-second product demo</p>
        <p className="mga-text-muted">See how MGA Buzz Connect works</p>
      </div>
      <button
        className="mga-btn mga-btn-primary mga-btn-large"
        onClick={onPlayDemo}
      >
        <Play size={16} />
        Play Demo
      </button>
    </div>
  );

  const Toast = ({ toast }) => (
    <div className={`mga-toast mga-toast-${toast.type} mga-toast-show`}>
      {toast.message}
    </div>
  );

  return (
    <div className="mga-app">
      {/* Navigation */}
      <nav className="mga-navbar">
        <div className="mga-nav-container">
          <div className="mga-nav-brand">
          <img src={Logo} alt="BuzzConnect Logo" className='mga-nav-brand img' style={{ cursor: "pointer" }} />
          </div>
          {/* <div class="top-head">
            <h3>MGA Buzz Connect</h3>
          </div> */}
    
          <div className={`mga-nav-links ${isMobileMenuOpen ? 'mga-nav-open' : ''}`}>
            <a href="#mga-features" onClick={(e) => { e.preventDefault(); scrollToSection('mga-features'); }}>
              Features
            </a>
            <a href="#mga-pricing" onClick={(e) => { e.preventDefault(); scrollToSection('mga-pricing'); }}>
              Pricing
            </a>
            <a href="#mga-docs" onClick={(e) => { e.preventDefault(); scrollToSection('mga-docs'); }}>
              Docs
            </a>
            <button
              className="mga-btn mga-btn-primary"
              onClick={handleGetStarted}
            >
              Get Started
            </button>
          </div>
          <div
            className="mga-mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu />
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="mga-hero">
          <div className="mga-hero-container">
            <div className="mga-hero-content">
              <div className="mga-hero-text">
                <h1 className="mga-hero-headline">
                  Schedule once. <span className="mga-gradient-text">Be everywhere.</span>
                </h1>
                <p className="mga-hero-subheadline">
                  Manage, schedule, and optimize posts across all major platforms — plan up to 1 year in advance. 
                  Built-in AI helps you write, hashtag, and mention the right people so your content actually gets seen.
                </p>
                
                <div className="mga-hero-ctas">
                  <button
                    className="mga-btn mga-btn-primary mga-btn-large mga-cta-shimmer"
                    onClick={handleGetStarted}
                  >
                    Get Started — It's Free
                  </button>
                  <button
                    className="mga-btn mga-btn-ghost"
                    onClick={handleWatchDemo}
                  >
                    <PlayCircle size={16} />
                    Watch 60s Demo
                  </button>
                </div>
                
                <p className="mga-hero-microcopy">
                  No credit card required • Connect Instagram, Facebook, X, LinkedIn & Youtube
                </p>

                {/* Value Bullets */}
                <div className="mga-value-bullets">
                  <div className="mga-bullet-item">
                    <div className="mga-bullet-icon">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <strong>Save time at scale:</strong> Schedule posts for multiple platforms in a single workflow.
                    </div>
                  </div>
                  <div className="mga-bullet-item">
                    <div className="mga-bullet-icon">
                      <Monitor size={20} />
                    </div>
                    <div>
                      <strong>Plan with confidence:</strong> Plan and auto-schedule up to 1 year in advance with calendar and recurring templates.
                    </div>
                  </div>
                  <div className="mga-bullet-item">
                    <div className="mga-bullet-icon">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <strong>Smarter content fast:</strong> AI Content Generator, Hashtag Suggestion, Content Optimizer and Mention Finder boost visibility.
                    </div>
                  </div>
                </div>
              </div>

              <div className="mga-hero-visual">
                <div className="mga-mockup-container">
                  <div className="mga-desktop-mockup">
                    <div className="mga-mockup-header">
                      <div className="mga-mockup-dots">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                    <div className="mga-mockup-content">
                      <CalendarGrid />
                    </div>
                  </div>
                  <div className="mga-mobile-mockup">
                    <div className="mga-phone-frame">
                      <div className="mga-phone-content">
                        <div className="mga-post-preview">
                          <div className="mga-profile-row">
                            <div className="mga-profile-pic"></div>
                            <div className="mga-profile-info">
                              <div className="mga-username"></div>
                              <div className="mga-timestamp"></div>
                            </div>
                          </div>
                          <div className="mga-post-image"></div>
                          <div className="mga-post-actions">
                            <div className="mga-action-icon"></div>
                            <div className="mga-action-icon"></div>
                            <div className="mga-action-icon"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="mga-features" className="mga-features">
          <div className="mga-features-container">
            <div className="mga-section-header">
              <h2>Everything you need to dominate social media</h2>
              <p>Powerful features that work together to amplify your content reach</p>
            </div>

            <div className="mga-features-grid">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`mga-feature-card ${
                    animatedElements.has(`feature-${index}`) ? 'mga-animate-in' : ''
                  }`}
                  data-animate-id={`feature-${index}`}
                >
                  <div className="mga-feature-icon">
                    <feature.icon size={24} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mga-how-it-works">
          <div className="mga-how-it-works-container">
            <div className="mga-section-header">
              <h2>How It Works</h2>
              <p>Get up and running in minutes</p>
            </div>

            <div className="mga-steps-container">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`mga-step-card ${
                    animatedElements.has(`step-${index}`) ? 'mga-animate-in' : ''
                  }`}
                  data-animate-id={`step-${index}`}
                >
                  <div className="mga-step-number">{step.number}</div>
                  <div className="mga-step-icon">
                    <step.icon size={32} />
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>

            <div className="mga-cta-section">
              <button
                className="mga-btn mga-btn-primary mga-btn-large"
                onClick={handleGetStarted}
              >
                Start scheduling in minutes
              </button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="mga-testimonials">
          <div className="mga-testimonials-container">
            <div className="mga-section-header">
              <h2>Loved by creators and teams worldwide</h2>
            </div>

            <div className="mga-testimonials-grid">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`mga-testimonial-card ${
                    animatedElements.has(`testimonial-${index}`) ? 'mga-animate-in' : ''
                  }`}
                  data-animate-id={`testimonial-${index}`}
                >
                  <div className="mga-stars">
                    {Array.from({ length: testimonial.rating }, (_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <blockquote>"{testimonial.quote}"</blockquote>
                  <div className="mga-author">
                   
                    <div className="mga-author-info">
                      <div className="mga-author-name">{testimonial.author}</div>
                      <div className="mga-author-role">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        {/* <section id="mga-pricing" className="mga-pricing">
          <div className="mga-pricing-container">
            <div className="mga-section-header">
              <h2>Simple, transparent pricing</h2>
              <p>Choose the plan that fits your needs. Switch anytime.</p>
            </div>

            <div className="mga-pricing-grid">
              {pricingPlans.map((plan, index) => (
                <div
                  key={index}
                  className={`mga-pricing-card ${plan.popular ? 'mga-popular' : ''} ${
                    animatedElements.has(`pricing-${index}`) ? 'mga-animate-in' : ''
                  }`}
                  data-animate-id={`pricing-${index}`}
                  data-plan={plan.name.toLowerCase()}
                >
                  {plan.popular && <div className="mga-popular-badge">Most Popular</div>}
                  
                  <div className="mga-plan-header">
                    <h3>{plan.name}</h3>
                    <div className="mga-price">
                      <span className="mga-price-amount">{plan.price}</span>
                      <span className="mga-price-period">/{plan.period}</span>
                    </div>
                    <p>{plan.description}</p>
                  </div>

                  <ul className="mga-features-list">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex}>
                        <Check size={16} />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`mga-btn ${
                      plan.popular ? 'mga-btn-primary' : 'mga-btn-outline'
                    } mga-btn-large mga-pricing-btn`}
                    onClick={() => handlePricingAction(plan.name, plan.cta)}
                  >
                    {plan.cta}
                  </button>
                </div>
              ))}
            </div>

            <p className="mga-pricing-note">
              Transparent billing • Switch plans anytime • 30-day money-back guarantee
            </p>
          </div>
        </section> */}

        {/* FAQ Section */}
        <section className="mga-faq">
          <div className="mga-faq-container">
            <div className="mga-section-header">
              <h2>Frequently Asked Questions</h2>
              <p>Everything you need to know about MGA Buzz Connect</p>
            </div>

            <div className="mga-faq-list">
              {faqs.map((faq, index) => (
                <div key={index} className="mga-faq-item">
                  <button
                    className={`mga-faq-question ${
                      openFAQIndex === index ? 'mga-active' : ''
                    }`}
                    onClick={() => toggleFAQ(index)}
                  >
                    {faq.question}
                    <ChevronDown
                      size={20}
                      className={`mga-chevron ${
                        openFAQIndex === index ? 'mga-rotated' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`mga-faq-answer ${
                      openFAQIndex === index ? 'mga-open' : ''
                    }`}
                  >
                    <p>{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mga-footer">
        <div className="mga-footer-container">
          <div className="mga-footer-content">
            <div className="mga-footer-brand">
          <div className="mga-nav-brand">
          <img src={Logo} alt="BuzzConnect Logo" className='mga-nav-brand img' style={{ cursor: "pointer" }} />
          </div>
              {/* <h3>MGA Buzz Connect</h3> */}
              <p>Social media scheduling that's smart, fast, and human.</p>
            </div>

            <div className="mga-footer-links">
              <div className="mga-link-group">
                <h4>Product</h4>
                <a href="#mga-features" onClick={(e) => { e.preventDefault(); scrollToSection('mga-features'); }}>
                  Features
                </a>
                <a href="#mga-pricing" onClick={(e) => { e.preventDefault(); scrollToSection('mga-pricing'); }}>
                  Pricing
                </a>
                <a href="#mga-integrations">Integrations</a>
                <a href="#mga-changelog">Changelog</a>
              </div>
              
              <div className="mga-link-group">
                <h4>Resources</h4>
                <a href="#mga-docs">Documentation</a>
                <a href="#mga-blog">Blog</a>
                <a href="#mga-help">Help Center</a>
                <a href="#mga-api">API</a>
              </div>

              <div className="mga-link-group">
                <h4>Company</h4>
                <a href="#mga-about">About</a>
                <a href="#mga-contact">Contact</a>
                <a href="#mga-careers">Careers</a>
                <a href="#mga-press">Press</a>
              </div>

              <div className="mga-link-group">
                <h4>Legal</h4>
                <a href="/privacy-policy">Privacy Policy</a>
                <a href="/terms-of-service">Terms of Service</a>
                <a href="/testing-instructions">Testing Instructions</a>
                <a href="/data-deletion-policy">Data Deletion</a>
              </div>
            </div>
          </div>

          <div className="mga-footer-bottom">
            <p>&copy; 2025 MGA Buzz Connect — Built for creators and teams.</p>
          </div>
        </div>
      </footer>

      {/* Modal */}
      {isModalOpen && (
        <div className="mga-modal-overlay" onClick={closeModal}>
          <div className="mga-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mga-modal-header">
              <h3>{modalContent.title}</h3>
              <button className="mga-modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <div className="mga-modal-content">
              {modalContent.content}
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <div className="mga-toast-container">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </div>
    </div>
  );
};

export default Home;
