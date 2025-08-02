# BuzzConnect - Aapke Brands. Ek Jagah.

A modern social media management platform built with React and traditional backend.

## Features

- 🔐 User authentication with JWT
- 📱 Multi-platform social media management
- 📊 Analytics and insights
- 📅 Content scheduling
- 🤖 AI-powered content suggestions
- 📈 Performance tracking
- 🖼️ Media management with Cloudinary
- 🗄️ MongoDB database

## Tech Stack

- **Frontend**: React 18, React Router, Lucide React
- **Backend**: Node.js, Express, MongoDB, JWT Authentication
- **Media Storage**: Cloudinary
- **Styling**: CSS3 with modern design patterns
- **Testing**: Playwright for E2E testing

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Nhost account (for deployment)

### Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd buzz-connect-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Update the environment variables in `.env.local` with your Nhost project details.

5. Start the development server:
```bash
npm start
```

The app will be available at `http://localhost:3000`.

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run test:e2e` - Run Playwright E2E tests
- `npm run test:e2e:ui` - Run Playwright tests with UI
- `npm run test:e2e:headed` - Run Playwright tests in headed mode

## Deployment on Nhost

This project is configured to deploy on [Nhost](https://nhost.io) and **optimized for the free tier**.

> 🆓 **Free Tier Ready**: The configuration uses minimal resources to stay within Nhost's generous free tier limits (1GB database, 1GB storage, 5GB egress).

For detailed free tier guidance, see [FREE_TIER_GUIDE.md](FREE_TIER_GUIDE.md).

### Quick Deploy Steps:

### 1. Create a Nhost Project

1. Go to [app.nhost.io](https://app.nhost.io)
2. Sign up or log in to your account
3. Create a new project
4. Note down your project's subdomain and region

### 2. Configure Environment Variables

In your Nhost project dashboard, go to Settings > Environment Variables and add:

```
NHOST_SUBDOMAIN=your-project-subdomain
NHOST_REGION=your-project-region
AUTH_CLIENT_URL=https://your-app-url.nhost.app
HASURA_GRAPHQL_ADMIN_SECRET=your-admin-secret
NHOST_WEBHOOK_SECRET=your-webhook-secret
GRAFANA_ADMIN_PASSWORD=your-grafana-password
```

### 3. Deploy via GitHub

1. Push your code to a GitHub repository
2. In your Nhost project dashboard, go to Deployments
3. Connect your GitHub repository
4. Select the branch you want to deploy (usually `main`)
5. Nhost will automatically detect the `nhost.toml` configuration and deploy your app

### 4. Access Your App

Once deployed, your app will be available at:
`https://your-project-subdomain.nhost.app`

## Project Structure

```
src/
├── components/          # React components
│   ├── AuthPage.js     # Authentication page
│   ├── Dashboard.js    # Main dashboard
│   ├── CreatePost.js   # Post creation component
│   └── PostDetail.js   # Post detail view
├── hooks/              # Custom React hooks
├── lib/                # Library configurations
│   └── nhost.js       # Nhost client setup
├── pages/              # Page components
├── utils/              # Utility functions
└── assets/             # Static assets
```

## Configuration Files

- `nhost.toml` - Nhost project configuration
- `.env.example` - Environment variables template
- `package.json` - Dependencies and scripts
- `public/index.html` - HTML template

## Development Notes

- The app includes a development mode for quick testing
- Authentication tokens are automatically managed
- The UI is responsive and mobile-friendly
- All API calls go through Nhost's GraphQL endpoint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Check the [Nhost documentation](https://docs.nhost.io)
- Open an issue in this repository
- Contact the development team