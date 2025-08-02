# 🚀 BuzzConnect Frontend

> **"Aapke Brands. Ek Jagah."** - Your Brands. One Place.

A modern, responsive React frontend for the BuzzConnect social media management platform that enables users to create, schedule, and manage posts across multiple social media platforms.

## 👥 For Different Audiences

### 🎓 **For Interns & New Developers**
- Start with [Quick Start Guide](#-quick-start-for-interns)
- Follow [Step-by-Step Setup](#-step-by-step-setup)
- Check [Common Issues](#-common-issues--troubleshooting)

### 👨‍💻 **For Experienced Developers**
- Jump to [Component Architecture](#-component-architecture)
- Review [State Management](#-state-management)
- See [Advanced Configuration](#-advanced-configuration)

### 🧪 **For Testers**
- Use [Testing Guide](#-testing-guide)
- Check [E2E Testing](#-e2e-testing-with-playwright)
- Review [Test Scenarios](#-test-scenarios)

---

## ✨ Key Features

| Feature | Description | Status |
|---------|-------------|--------|
| 🔐 **Authentication** | JWT-based login/register with secure storage | ✅ Complete |
| 📝 **Post Creation** | Rich text editor with media upload | ✅ Complete |
| ⏰ **Scheduling** | Calendar-based post scheduling | ✅ Complete |
| 📱 **Multi-Platform** | Instagram, Twitter, Facebook support | ✅ Instagram Ready |
| 📊 **Analytics** | Real-time engagement metrics | ✅ Complete |
| 🤖 **AI Content** | AI-powered content suggestions | ✅ Complete |
| 📸 **Media Library** | Drag-drop upload with Cloudinary | ✅ Complete |
| 📱 **Responsive** | Mobile-first responsive design | ✅ Complete |
| 🎨 **Modern UI** | Clean, intuitive user interface | ✅ Complete |

## 🛠️ Tech Stack

### Core Technologies
- **React 18** - Latest React with hooks and concurrent features
- **React Router v6** - Client-side routing and navigation
- **Lucide React** - Beautiful, customizable icons
- **CSS3** - Modern styling with flexbox and grid

### Development Tools
- **Create React App** - Zero-config build setup
- **Playwright** - End-to-end testing framework
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting

### Backend Integration
- **Axios** - HTTP client for API calls
- **JWT** - Token-based authentication
- **WebSocket** - Real-time updates (planned)

## 🎯 Quick Start for Interns

### Prerequisites Check
```bash
# Check if you have Node.js (need 16+)
node --version

# Check if you have npm
npm --version

# Check if backend is running
curl http://localhost:5001/health
```

### 1-Minute Setup
```bash
# 1. Clone the repository
git clone git@github.com:MGAssociates/buzz-connect-frontend.git
cd buzz-connect-frontend

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local

# 4. Start the development server
npm start
```

**🎉 That's it!** Your app should open at http://localhost:3000

### First UI Test
1. Open http://localhost:3000 in your browser
2. You should see the BuzzConnect login page
3. Try registering a new account
4. Navigate through the dashboard

## 🔧 Step-by-Step Setup

### Step 1: Environment Setup
```bash
# Clone the repository
git clone git@github.com:MGAssociates/buzz-connect-frontend.git
cd buzz-connect-frontend

# Install dependencies
npm install
```

### Step 2: Backend Connection Setup

**Make sure the backend is running first!**
```bash
# In another terminal, start the backend
cd ../buzz-connect-backend
npm run dev

# Verify backend is running
curl http://localhost:5001/health
```

### Step 3: Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local file with your settings
nano .env.local  # or use your preferred editor
```

**Required Environment Variables:**
```env
# Backend API Configuration
REACT_APP_API_URL=http://localhost:5001
REACT_APP_API_BASE_URL=http://localhost:5001/api

# Optional: For production deployment
REACT_APP_ENVIRONMENT=development
```

### Step 4: Start the Development Server
```bash
# Start the React development server
npm start

# The app will automatically open at http://localhost:3000
```

### Step 5: Verify Installation
Check these in your browser:
- **Frontend**: http://localhost:3000
- **Backend Health**: http://localhost:5001/health
- **API Docs**: http://localhost:5001/api-docs

### Available Scripts

| Command | Description | When to Use |
|---------|-------------|-------------|
| `npm start` | Start development server | Daily development |
| `npm run build` | Build for production | Before deployment |
| `npm test` | Run unit tests | Testing components |
| `npm run test:e2e` | Run Playwright E2E tests | Full app testing |
| `npm run test:e2e:ui` | Run tests with UI | Debugging tests |
| `npm run test:e2e:headed` | Run tests in browser | Visual testing |
| `npm run lint` | Check code quality | Before commits |
| `npm run lint:fix` | Fix linting issues | Code cleanup |

## 🧪 Testing Guide

### For Testers: Manual Testing Scenarios

#### 1. Authentication Flow
```bash
# Test user registration
1. Go to http://localhost:3000
2. Click "Sign Up"
3. Fill form: email, password, display name
4. Verify successful registration
5. Test login with same credentials
```

#### 2. Post Creation Flow
```bash
# Test creating a scheduled post
1. Login to dashboard
2. Click "Create Post"
3. Add content: "Test post from frontend! 🚀"
4. Select platforms: Instagram, Twitter
5. Add hashtags: #test #buzzconnect
6. Upload an image (drag & drop)
7. Set future schedule date
8. Click "Schedule Post"
9. Verify post appears in dashboard
```

#### 3. Media Upload Testing
```bash
# Test media library
1. Go to Media Library
2. Drag and drop an image
3. Verify upload progress
4. Check image appears in library
5. Test image selection in post creation
```

#### 4. Responsive Design Testing
```bash
# Test on different screen sizes
1. Open browser dev tools (F12)
2. Test mobile view (375px width)
3. Test tablet view (768px width)
4. Test desktop view (1200px+ width)
5. Verify all components are responsive
```

### E2E Testing with Playwright

#### Running Tests
```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run tests with visual UI
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test auth.spec.js
```

#### Test Scenarios Covered
- ✅ User registration and login
- ✅ Post creation and scheduling
- ✅ Media upload functionality
- ✅ Navigation between pages
- ✅ Responsive design
- ✅ Error handling
- ✅ Form validation

### Test Data
```javascript
// Use these test credentials
const testUser = {
  email: "tester@buzzconnect.com",
  password: "password123",
  displayName: "Test User"
};

// Test post content
const testPost = {
  content: "Automated test post! 🤖",
  platforms: ["instagram", "twitter"],
  hashtags: ["#test", "#automation"]
};
```

## 🏗️ Component Architecture

### Project Structure
```
src/
├── components/              # Reusable UI components
│   ├── common/             # Shared components
│   │   ├── Header.js       # Navigation header
│   │   ├── Sidebar.js      # Navigation sidebar
│   │   ├── LoadingSpinner.js
│   │   └── ErrorBoundary.js
│   ├── auth/               # Authentication components
│   │   ├── LoginForm.js
│   │   ├── RegisterForm.js
│   │   └── ProtectedRoute.js
│   ├── posts/              # Post-related components
│   │   ├── PostCard.js     # Individual post display
│   │   ├── PostForm.js     # Post creation/editing
│   │   ├── PostList.js     # List of posts
│   │   └── ScheduleModal.js
│   ├── media/              # Media components
│   │   ├── MediaUpload.js  # Drag & drop upload
│   │   ├── MediaLibrary.js # Media gallery
│   │   └── ImagePreview.js
│   └── analytics/          # Analytics components
│       ├── AnalyticsCard.js
│       ├── EngagementChart.js
│       └── MetricsOverview.js
├── pages/                  # Page components (routes)
│   ├── AuthPage.js        # Login/Register page
│   ├── Dashboard.js       # Main dashboard
│   ├── CreatePost.js      # Post creation page
│   ├── MediaLibrary.js    # Media management
│   ├── Analytics.js       # Analytics dashboard
│   └── Settings.js        # User settings
├── hooks/                  # Custom React hooks
│   ├── useAuth.js         # Authentication hook
│   ├── useApi.js          # API calls hook
│   ├── usePosts.js        # Posts management
│   └── useLocalStorage.js # Local storage hook
├── utils/                  # Utility functions
│   ├── api.js             # API client setup
│   ├── auth.js            # Auth helpers
│   ├── constants.js       # App constants
│   ├── formatters.js      # Data formatting
│   └── validators.js      # Form validation
├── assets/                 # Static assets
│   ├── images/            # Images and icons
│   ├── styles/            # Global CSS
│   └── fonts/             # Custom fonts
└── App.js                 # Main app component
```

### State Management

#### Context Providers
```javascript
// AuthContext - Global authentication state
const AuthContext = {
  user: null,
  token: null,
  login: (credentials) => {},
  logout: () => {},
  isAuthenticated: false
};

// PostsContext - Posts management state
const PostsContext = {
  posts: [],
  loading: false,
  createPost: (postData) => {},
  updatePost: (id, data) => {},
  deletePost: (id) => {}
};
```

#### Local State Management
- **useState** - Component-level state
- **useReducer** - Complex state logic
- **useContext** - Global state access
- **Custom hooks** - Reusable state logic

### API Integration

#### API Client Setup
```javascript
// utils/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auto-attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

#### API Hooks Pattern
```javascript
// hooks/useApi.js
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = async (method, url, data) => {
    setLoading(true);
    try {
      const response = await apiClient[method](url, data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { request, loading, error };
};
```

## 🚨 Common Issues & Troubleshooting

### Issue 1: App Won't Start
**Problem**: `Error: Cannot find module` or `Module not found`
**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear React cache
rm -rf node_modules/.cache
npm start
```

### Issue 2: API Connection Failed
**Problem**: `Network Error` or `CORS error`
**Solutions**:
```bash
# Check if backend is running
curl http://localhost:5001/health

# Verify environment variables
cat .env.local
# Should contain: REACT_APP_API_URL=http://localhost:5001

# Check CORS settings in backend
# Backend should allow origin: http://localhost:3000
```

### Issue 3: Authentication Not Working
**Problem**: Login successful but redirects to login page
**Solution**:
```bash
# Check browser localStorage
# Open DevTools > Application > Local Storage
# Should see 'token' and 'user' entries

# Clear localStorage and try again
localStorage.clear()
```

### Issue 4: Images Not Uploading
**Problem**: Media upload fails or shows error
**Check**:
```bash
# Verify backend Cloudinary configuration
# Check backend .env file has:
# CLOUDINARY_CLOUD_NAME=your-cloud-name
# CLOUDINARY_API_KEY=your-api-key
# CLOUDINARY_API_SECRET=your-api-secret
```

### Issue 5: Build Fails
**Problem**: `npm run build` fails with errors
**Solution**:
```bash
# Check for unused imports
npm run lint

# Fix linting issues
npm run lint:fix

# Check for TypeScript errors (if using TS)
npm run type-check
```

### Debug Mode
```bash
# Enable React debug mode
REACT_APP_DEBUG=true npm start

# Check browser console for errors
# Open DevTools > Console

# Check network requests
# Open DevTools > Network tab
```

## 🚀 Deployment Guide

### Build for Production
```bash
# Create production build
npm run build

# Test production build locally
npm install -g serve
serve -s build -l 3000
```

### Environment Variables for Production
```env
# Production API URL
REACT_APP_API_URL=https://your-api-domain.com
REACT_APP_API_BASE_URL=https://your-api-domain.com/api

# Environment
REACT_APP_ENVIRONMENT=production

# Optional: Analytics
REACT_APP_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
```

### Deployment Options

#### Option 1: Netlify (Recommended)
```bash
# Build and deploy to Netlify
npm run build

# Drag and drop 'build' folder to Netlify
# Or connect GitHub repository for auto-deploy
```

#### Option 2: Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Option 3: Traditional Hosting
```bash
# Build the app
npm run build

# Upload 'build' folder contents to your web server
# Configure server to serve index.html for all routes
```

### Production Checklist
- [ ] Set production API URL in environment variables
- [ ] Test all features in production build
- [ ] Configure proper CORS on backend
- [ ] Set up SSL/HTTPS
- [ ] Configure error monitoring (Sentry, etc.)
- [ ] Set up analytics (Google Analytics, etc.)
- [ ] Test responsive design on real devices
- [ ] Optimize images and assets
- [ ] Configure caching headers

## 🤝 Contributing

### For Developers
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test thoroughly
4. Run tests: `npm test` and `npm run test:e2e`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Submit Pull Request

### Code Standards
- Use functional components with hooks
- Follow React best practices
- Write tests for new components
- Use meaningful component and variable names
- Keep components small and focused
- Use TypeScript for type safety (if applicable)

### Component Development Guidelines
```javascript
// Good component structure
const MyComponent = ({ prop1, prop2 }) => {
  // 1. Hooks at the top
  const [state, setState] = useState(null);
  const { data, loading } = useApi();

  // 2. Event handlers
  const handleClick = () => {
    // Handle click
  };

  // 3. Effects
  useEffect(() => {
    // Side effects
  }, []);

  // 4. Early returns
  if (loading) return <LoadingSpinner />;
  if (!data) return <ErrorMessage />;

  // 5. Main render
  return (
    <div className="my-component">
      {/* Component JSX */}
    </div>
  );
};
```

## 📞 Support

### Getting Help
- **Documentation**: Check this README and component docs
- **Issues**: Create GitHub issue with detailed description
- **Questions**: Contact development team
- **Backend Issues**: Check backend README

### Useful Commands
```bash
# Development
npm start              # Start dev server
npm run build         # Production build
npm test              # Run unit tests
npm run test:e2e      # Run E2E tests

# Code Quality
npm run lint          # Check code quality
npm run lint:fix      # Fix linting issues
npm run format        # Format code with Prettier

# Debugging
npm run analyze       # Analyze bundle size
npm run storybook     # Run component storybook (if configured)
```

### Browser Support
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

**Made with ❤️ by the BuzzConnect Team**

> **"Aapke Brands. Ek Jagah."** - Your Brands. One Place.