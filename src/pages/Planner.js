import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  Grid,
  List,
  Clock,
  Instagram,
  Twitter,
  Facebook,
  Check,
  X,
  AlertCircle,
  CheckCircle,
  Sidebar,
  GripVertical,
  MoreHorizontal,
  Image,
  Globe
} from 'lucide-react';
import CreatePost from '../components/CreatePost';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants';
import { useDashboardData } from '../hooks/useApi';
import apiClient from '../utils/api';
import './Planner.css';
import PostDetailModal from "../components/PostDetailModal";


const Planner = () => {
  const filterRef = useRef(null); // 👈 reference for dropdown
  const filterBtnRef = useRef(null);
  const filterDropdownRef = useRef(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [notification, setNotification] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week'
  const [selectedDate, setSelectedDate] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    platforms: [],
    statuses: []
  });
  const [calendarPosts, setCalendarPosts] = useState([]);
  const [draftPosts, setDraftPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostDetail, setShowPostDetail] = useState(false);

  const {
    posts,
    createPost: apiCreatePost,
    refetch: refetchDashboard
  } = useDashboardData();

  // Fetch posts for calendar view
  const fetchCalendarPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.request('/api/posts', {
        params: {
          limit: 100
        }
      });

      const postsData = response?.data?.posts || response?.data || [];
      console.log('Fetched posts:', postsData);
      
      setCalendarPosts(postsData);
    } catch (error) {
      console.error('Failed to fetch calendar posts:', error);
      setNotification({ type: 'error', message: 'Failed to load calendar posts' });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch draft posts for sidebar
  const fetchDraftPosts = useCallback(async () => {
    try {
      const response = await apiClient.request('/api/posts', {
        params: { 
          status: 'draft',
          limit: 50
        }
      });

      const draftsData = response?.data?.posts || response?.data || [];
      setDraftPosts(draftsData);
    } catch (error) {
      console.error('Failed to fetch draft posts:', error);
    }
  }, []);

  useEffect(() => {
    fetchCalendarPosts();
    fetchDraftPosts();
  }, [fetchCalendarPosts, fetchDraftPosts]);

  const handleCreatePost = async (postData) => {
    try {
      const response = await apiCreatePost(postData);
      setNotification({ type: 'success', message: SUCCESS_MESSAGES.POST_CREATED });
      setShowCreatePost(false);

      await Promise.all([fetchCalendarPosts(), fetchDraftPosts()]);

      return response;
    } catch (error) {
      setNotification({ type: 'error', message: error.message || ERROR_MESSAGES.SERVER_ERROR });
      throw error;
    }
  };

   useEffect(() => {
    if (!showFilters) return;

    const onPointerDown = (e) => {
      const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
      const btnEl = filterBtnRef.current;
      const dropEl = filterDropdownRef.current;

      const clickedInsideBtn =
        btnEl && (btnEl.contains(e.target) || path.includes(btnEl));
      const clickedInsideDrop =
        dropEl && (dropEl.contains(e.target) || path.includes(dropEl));

      if (!clickedInsideBtn && !clickedInsideDrop) {
        setShowFilters(false);
      }
    };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setShowFilters(false);
    };

    // Capture phase helps avoid races with React onClick
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [showFilters]);

  // Navigation functions
  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(currentDate.getMonth() + direction);
    } else if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + (direction * 7));
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getDateRangeText = () => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    if (viewMode === 'month') {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else {
      const start = getCalendarStartDate();
      const end = getCalendarEndDate();

      if (start.getMonth() === end.getMonth()) {
        return `${monthNames[start.getMonth()]} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`;
      } else {
        return `${monthNames[start.getMonth()]} ${start.getDate()} - ${monthNames[end.getMonth()]} ${end.getDate()}, ${start.getFullYear()}`;
      }
    }
  };

  const getCalendarStartDate = () => {
    if (viewMode === 'month') {
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const dayOfWeek = start.getDay();
      start.setDate(start.getDate() - dayOfWeek);
      return start;
    } else {
      const start = new Date(currentDate);
      const dayOfWeek = start.getDay();
      start.setDate(start.getDate() - dayOfWeek);
      return start;
    }
  };

  const getCalendarEndDate = () => {
    if (viewMode === 'month') {
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      const dayOfWeek = end.getDay();
      end.setDate(end.getDate() + (6 - dayOfWeek));
      return end;
    } else {
      const end = new Date(currentDate);
      const dayOfWeek = end.getDay();
      end.setDate(end.getDate() + (6 - dayOfWeek));
      return end;
    }
  };

  const togglePlatformFilter = (platform) => {
    setFilters(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const toggleStatusFilter = (status) => {
    setFilters(prev => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter(s => s !== status)
        : [...prev.statuses, status]
    }));
  };

  return (
    <div className="planner-page">
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)}>×</button>
        </div>
      )}

      {/* Header / Control Bar */}
      <div className="planner-header">
        <div className="header-left">

          {/* <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <Sidebar size={20} />
          </button> */}

          <h1>Content Planner</h1>
        </div>

        <div className="header-center">
          <div className="view-toggles">
            <button
              className={`view-toggle ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              Month
            </button>
            <button
              className={`view-toggle ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
          </div>

          <div className="date-navigator">
            <button className="nav-btn" onClick={() => navigateDate(-1)}>
              <ChevronLeft size={20} />
            </button>
            <span className="date-range">{getDateRangeText()}</span>
            <button className="nav-btn" onClick={() => navigateDate(1)}>
              <ChevronRight size={20} />
            </button>
            <button className="today-btn" onClick={goToToday}>
              Today
            </button>
          </div>
        </div>

        <div className="header-right">
          <div className="filters-section" ref={filterRef}>
            <button
            ref={filterBtnRef}
              className={`filter-btn ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
              Filters
            </button>

            {showFilters && (
              <div className="filters-dropdown"
               ref={filterDropdownRef}
              >
                <div className="filter-group">
                  <label>Status</label>
                  <div className="filter-options">
                    <button
                      className={`filter-option ${filters.statuses.includes('scheduled') ? 'active' : ''}`}
                      onClick={() => toggleStatusFilter('scheduled')}
                    >
                      <Clock size={16} />
                      Scheduled
                    </button>
                    <button
                      className={`filter-option ${filters.statuses.includes('published') ? 'active' : ''}`}
                      onClick={() => toggleStatusFilter('published')}
                    >
                      <CheckCircle size={16} />
                      Published
                    </button>
                    <button
                      className={`filter-option ${filters.statuses.includes('draft') ? 'active' : ''}`}
                      onClick={() => toggleStatusFilter('draft')}
                    >
                      <AlertCircle size={16} />
                      Draft
                    </button>
                    <button
                      className={`filter-option ${filters.statuses.includes('failed') ? 'active' : ''}`}
                      onClick={() => toggleStatusFilter('failed')}
                    >
                      <X size={16} />
                      Failed
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button className="btn-primary" onClick={() => setShowCreatePost(true)}>
            <Plus size={18} />
            Create Post
          </button>
        </div>
      </div>

      {/* Main Layout: Two-Panel */}
      <div className="planner-layout">
        {/* Left Sidebar: Content Pool */}
        {/* <div className={`content-pool ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="content-pool-header">
            <h3>Unscheduled Drafts</h3>
            <span className="draft-count">{draftPosts.length}</span>
          </div>

          <div className="draft-cards">
            {draftPosts.length > 0 ? (
              draftPosts.map(draft => (
                <div key={draft._id || draft.id} className="draft-card" draggable>
                  <div className="draft-content">
                    <p>{draft.content.substring(0, 60)}...</p>
                    <div className="draft-platforms">
                      {draft.platforms?.map(platform => (
                        <span key={platform} className={`platform-icon ${platform}`}>
                          {platform === 'instagram' && <Instagram size={14} />}
                          {platform === 'twitter' && <Twitter size={14} />}
                          {platform === 'facebook' && <Facebook size={14} />}
                        </span>
                      ))}
                    </div>
                  </div>
                  {draft.images && draft.images.length > 0 && (
                    <div className="draft-media-indicator">
                      <Image size={14} />
                      <span>{draft.images.length}</span>
                    </div>
                  )}

                  <div className="draft-actions">
                    <button
                      className="draft-edit-btn"
                      onClick={() => {
                        setSelectedDate(draft);
                        setShowCreatePost(true);
                      }}
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-drafts">
                <AlertCircle size={32} />
                <p>No draft posts</p>
                <p className="empty-subtitle">Create posts and save as drafts to see them here</p>
              </div>
            )}
          </div>
        </div> */}

        {/* Main Area: Calendar Grid */}
        <div className="calendar-main">
          <div className="calendar-grid">
            {viewMode === 'month' ? (
              <MonthView
                currentDate={currentDate}
                posts={calendarPosts}
                filters={filters}
                onDateClick={(date) => {
                  setSelectedDate(date);
                  setShowCreatePost(true);
                }}
                onPostClick={(post) => {
                  setSelectedPost(post);
                  setShowPostDetail(true);
                }}
                loading={loading}
              />
            ) : (
              <WeekView
                currentDate={currentDate}
                posts={calendarPosts}
                filters={filters}
                onDateClick={(date) => {
                  setSelectedDate(date);
                  setShowCreatePost(true);
                }}
                onPostClick={(post) => {
                  setSelectedPost(post);
                  setShowPostDetail(true);
                }}
                loading={loading}
              />
            )}
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePost
        isOpen={showCreatePost}
        onClose={() => {
          setShowCreatePost(false);
          setSelectedDate(null);
        }}
        onPostCreated={handleCreatePost}
        initialData={selectedDate ? { scheduledDate: selectedDate } : undefined}
      />
      {showPostDetail && (
        <PostDetailModal
          post={selectedPost}
          isOpen={showPostDetail}
          onClose={() => setShowPostDetail(false)}
        />
      )}
    </div>
  );
};

// Month View Component
const MonthView = ({ currentDate, posts, filters, onDateClick, onPostClick, loading }) => {
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const getPostsForDate = (date) => {
    const postsArray = Array.isArray(posts) ? posts : [];

    return postsArray.filter(post => {
      if (!post || !post.status) return false;
      
      // ✅ Show all posts if no status filters are selected
      if (filters.statuses.length > 0 && !filters.statuses.includes(post.status)) {
        return false;
      }
      
      // ✅ Show all posts if no platform filters are selected
      if (filters.platforms.length > 0 && 
          post.platforms && post.platforms.length > 0 && 
          !post.platforms.some(p => filters.platforms.includes(p))) {
        return false;
      }

      let postDate;
      if (post.status === 'published' && post.publishedAt) {
        postDate = new Date(post.publishedAt);
      } else if (post.scheduledDate) {
        postDate = new Date(post.scheduledDate);
      } else {
        postDate = new Date(post.createdAt);
      }

      const calendarDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const postLocalDate = new Date(postDate.getFullYear(), postDate.getMonth(), postDate.getDate());
      
      return calendarDate.getTime() === postLocalDate.getTime();
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  if (loading) {
    return (
      <div className="calendar-loading">
        <div className="loading-spinner"></div>
        <p>Loading calendar...</p>
      </div>
    );
  }

  return (
    <div className="month-view">
      <div className="calendar-header">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="calendar-header-day">{day}</div>
        ))}
      </div>

      <div className="calendar-body">
        {getDaysInMonth().map((date, index) => {
          const dayPosts = getPostsForDate(date);
          
          return (
            <div
              key={index}
              className={`calendar-day ${!isCurrentMonth(date) ? 'other-month' : ''} ${isToday(date) ? 'today' : ''}`}
              onClick={() => onDateClick(date)}
            >
              <div className="day-number">{date.getDate()}</div>
              <div className="day-posts">
                {/* ✅ Show social media icons instead of post cards */}
                <PostIconsDisplay 
                  posts={dayPosts} 
                  onPostClick={onPostClick}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Week View Component - Fixed getPostsForDate function
const WeekView = ({ currentDate, posts, filters, onDateClick, onPostClick, loading }) => {
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }

    return days;
  };

  const getPostsForDate = (date) => {
    const postsArray = Array.isArray(posts) ? posts : [];

    return postsArray.filter(post => {
      if (!post || !post.status) return false;
      
      // ✅ Fixed: Only filter by status if status filters are selected
      if (filters.statuses.length > 0 && !filters.statuses.includes(post.status)) {
        return false;
      }
      
      // ✅ Fixed: Only filter by platform if platform filters are selected
      if (filters.platforms.length > 0 && 
          post.platforms && post.platforms.length > 0 && 
          !post.platforms.some(p => filters.platforms.includes(p))) {
        return false;
      }

      let postDate;
      if (post.status === 'published' && post.publishedAt) {
        postDate = new Date(post.publishedAt);
      } else if (post.scheduledDate) {
        postDate = new Date(post.scheduledDate);
      } else {
        postDate = new Date(post.createdAt);
      }

      // ✅ Use the same date comparison logic as MonthView
      const calendarDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const postLocalDate = new Date(postDate.getFullYear(), postDate.getMonth(), postDate.getDate());
      
      return calendarDate.getTime() === postLocalDate.getTime();
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  if (loading) {
    return (
      <div className="calendar-loading">
        <div className="loading-spinner"></div>
        <p>Loading calendar...</p>
      </div>
    );
  }

  return (
    <div className="week-view">
      <div className="week-header">
        {getWeekDays().map((date, index) => (
          <div key={index} className={`week-day-header ${isToday(date) ? 'today' : ''}`}>
            <div className="day-name">
              {date.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className="day-date">{date.getDate()}</div>
          </div>
        ))}
      </div>

      <div className="week-body">
        {getWeekDays().map((date, index) => {
          const dayPosts = getPostsForDate(date);
          
          return (
            <div
              key={index}
              className={`week-day ${isToday(date) ? 'today' : ''}`}
              onClick={() => onDateClick(date)}
            >
              <div className="day-posts">
                {/* ✅ Show social media icons instead of post cards */}
                <PostIconsDisplay 
                  posts={dayPosts} 
                  onPostClick={onPostClick}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ✅ Updated PostIconsDisplay Component with global icon
const PostIconsDisplay = ({ posts, onPostClick }) => {
  // Group posts by time slots for better organization
  const groupPostsByTime = (posts) => {
    const grouped = {};
    
    posts.forEach(post => {
      let date;
      if (post.status === 'published' && post.publishedAt) {
        date = new Date(post.publishedAt);
      } else if (post.scheduledDate) {
        date = new Date(post.scheduledDate);
      } else {
        date = new Date(post.createdAt);
      }
      
      const timeKey = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      
      if (!grouped[timeKey]) {
        grouped[timeKey] = [];
      }
      grouped[timeKey].push(post);
    });
    
    return grouped;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return '#F59E0B';
      case 'published': return '#10B981';
      case 'failed': return '#EF4444';
      case 'draft': return '#6B7280';
      default: return '#6B7280';
    }
  };

  if (!posts || posts.length === 0) {
    return null;
  }

  const groupedPosts = groupPostsByTime(posts);

  return (
    <div className="post-icons-container">
      {Object.entries(groupedPosts).map(([time, timePosts]) => (
        <div key={time} className="time-slot">
          <div className="post-icons-row">
            {timePosts.map(post => {
              // Get all platforms for this post
              const platforms = post.platforms && post.platforms.length > 0 
                ? post.platforms 
                : ['instagram'];
              
              const statusColor = getStatusColor(post.status);
              
              // Count of platforms to show in the badge
              const platformCount = platforms.length;
              
              return (
                <div
                  key={post._id || post.id}
                  className="unified-social-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPostClick(post);
                  }}
                  style={{
                    '--status-color': statusColor
                  }}
                  title={`${post.status.charAt(0).toUpperCase() + post.status.slice(1)} - ${post.content.substring(0, 50)}...`}
                >
                  <Globe size={16} />
                  {platformCount > 1 && (
                    <span className="platform-count">{platformCount}</span>
                  )}
                  <div className="status-indicator"></div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};


export default Planner;
