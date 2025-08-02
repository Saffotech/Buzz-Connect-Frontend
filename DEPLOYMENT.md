# Deployment Guide for Nhost

This guide will walk you through deploying BuzzConnect on Nhost step by step.

## Prerequisites

- [ ] GitHub account
- [ ] Nhost account (sign up at [app.nhost.io](https://app.nhost.io))
- [ ] Your code pushed to a GitHub repository

## Step 1: Create Nhost Project

1. Go to [app.nhost.io](https://app.nhost.io)
2. Sign in or create an account
3. Click "Create New Project"
4. Choose a project name (e.g., "buzzconnect")
5. Select a region (e.g., "us-east-1" or closest to your users)
6. Click "Create Project"

**Note down:**
- Project subdomain (e.g., `buzzconnect-abc123`)
- Project region (e.g., `us-east-1`)

## Step 2: Configure Environment Variables

In your Nhost project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables:

### Required Variables:
```
NHOST_SUBDOMAIN=your-project-subdomain
NHOST_REGION=your-project-region
AUTH_CLIENT_URL=https://your-project-subdomain.nhost.app
```

### Security Variables (Generate strong passwords):
```
HASURA_GRAPHQL_ADMIN_SECRET=your-strong-admin-secret
NHOST_WEBHOOK_SECRET=your-webhook-secret
GRAFANA_ADMIN_PASSWORD=your-grafana-password
```

**Example:**
```
NHOST_SUBDOMAIN=buzzconnect-abc123
NHOST_REGION=us-east-1
AUTH_CLIENT_URL=https://buzzconnect-abc123.nhost.app
HASURA_GRAPHQL_ADMIN_SECRET=my-super-secret-admin-key-2024
NHOST_WEBHOOK_SECRET=webhook-secret-key-2024
GRAFANA_ADMIN_PASSWORD=grafana-admin-2024
```

## Step 3: Connect GitHub Repository

1. In your Nhost project dashboard, go to **Git** → **Connect Repository**
2. Authorize Nhost to access your GitHub account
3. Select your repository containing the BuzzConnect code
4. Choose the branch to deploy (usually `main` or `master`)
5. Click "Connect Repository"

## Step 4: Configure Build Settings

Nhost should automatically detect your `nhost.toml` file, but verify:

1. Go to **Settings** → **Build & Deploy**
2. Ensure the following settings:
   - **Build Command**: `npm run build`
   - **Build Directory**: `build`
   - **Install Command**: `npm install`
   - **Node Version**: 18 (or latest LTS)

## Step 5: Deploy

1. Go to **Deployments** in your Nhost dashboard
2. Click "Deploy Now" or push a commit to trigger automatic deployment
3. Monitor the build logs for any errors
4. Wait for deployment to complete (usually 2-5 minutes)

## Step 6: Verify Deployment

1. Once deployed, click on the deployment URL
2. Test the following:
   - [ ] App loads correctly
   - [ ] Authentication works (sign up/sign in)
   - [ ] Dashboard is accessible
   - [ ] No console errors

## Step 7: Set Up Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Configure DNS records as instructed
4. Wait for SSL certificate provisioning

## Troubleshooting

### Common Issues:

**Build Fails:**
- Check build logs in Nhost dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

**App Loads but Authentication Fails:**
- Verify environment variables are set correctly
- Check that `AUTH_CLIENT_URL` matches your deployed URL
- Ensure Nhost subdomain and region are correct

**Console Errors:**
- Check browser developer tools
- Verify all API endpoints are accessible
- Check CORS settings in Nhost

**Environment Variables Not Working:**
- Ensure variables are set in Nhost dashboard, not in `.env` files
- Variables should not have quotes around values
- Restart deployment after changing variables

### Getting Help:

1. Check [Nhost Documentation](https://docs.nhost.io)
2. Visit [Nhost Discord Community](https://discord.gg/nhost)
3. Open an issue in this repository
4. Check Nhost status page for service issues

## Post-Deployment Checklist

- [ ] App is accessible via the provided URL
- [ ] User registration works
- [ ] User login works
- [ ] Dashboard loads correctly
- [ ] All features are functional
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] Mobile responsiveness works
- [ ] Custom domain configured (if applicable)
- [ ] Monitoring and alerts set up (optional)

## Updating Your App

To deploy updates:

1. Push changes to your connected GitHub branch
2. Nhost will automatically trigger a new deployment
3. Monitor the deployment in the Nhost dashboard
4. Test the updated app once deployment completes

## Rollback

If something goes wrong:

1. Go to **Deployments** in Nhost dashboard
2. Find a previous successful deployment
3. Click "Redeploy" on that version
4. Wait for rollback to complete

---

**Need Help?** Contact the development team or check the Nhost documentation for more detailed information.
