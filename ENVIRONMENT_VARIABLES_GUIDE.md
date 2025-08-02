# 🔐 Environment Variables Setup Guide

## ✅ Issue Fixed: AUTH_CLIENT_URL Dependency Removed

The `AUTH_CLIENT_URL` dependency has been temporarily removed from the configuration to allow initial deployment. You can set it up properly after your app is deployed.

## 🎯 Required Environment Variables

### For Your React App (Required)

Set these in **Nhost Dashboard → Settings → Environment Variables**:

```bash
# Your Nhost project details
REACT_APP_NHOST_SUBDOMAIN=your-project-subdomain
REACT_APP_NHOST_REGION=your-project-region
```

**How to find these values:**
1. **Subdomain**: Check your Nhost project URL or dashboard
2. **Region**: Usually shown in project settings (e.g., `us-east-1`, `eu-central-1`)

**Example:**
```bash
REACT_APP_NHOST_SUBDOMAIN=buzzconnect-abc123
REACT_APP_NHOST_REGION=us-east-1
```

### Backend Secrets (Optional - Auto-generated)

These will be **automatically generated** by Nhost if not provided:

```bash
# Auto-generated if not set
HASURA_GRAPHQL_ADMIN_SECRET=auto-generated-secret
NHOST_WEBHOOK_SECRET=auto-generated-secret  
HASURA_GRAPHQL_JWT_SECRET=auto-generated-secret
GRAFANA_ADMIN_PASSWORD=auto-generated-password
```

## 🚀 Deployment Steps

### 1. Initial Deployment (Now)
Your app should deploy successfully with the current configuration.

### 2. After Successful Deployment
Once your app is deployed and you have the URL, you can optionally update the auth redirections:

1. **Find your app URL**: `https://your-subdomain.nhost.app`
2. **Update nhost.toml** (optional):
   ```toml
   [auth.redirections]
   clientUrl = 'https://your-subdomain.nhost.app'
   allowedUrls = ['https://your-subdomain.nhost.app', 'https://your-subdomain.nhost.app/dashboard']
   ```

### 3. Environment Variables in Dashboard

**Go to**: Nhost Dashboard → Your Project → Settings → Environment Variables

**Add these variables:**
```bash
# Required for React app
REACT_APP_NHOST_SUBDOMAIN=your-actual-subdomain
REACT_APP_NHOST_REGION=your-actual-region

# Optional: Set specific auth URL after deployment
AUTH_CLIENT_URL=https://your-subdomain.nhost.app
```

## 🔍 How to Find Your Values

### Finding Your Subdomain
1. **Nhost Dashboard**: Look at your project URL
2. **Project Settings**: Check the project details
3. **Deployment Logs**: Usually shown after deployment

### Finding Your Region
1. **Project Settings**: Usually displayed in project info
2. **Common regions**: `us-east-1`, `eu-central-1`, `ap-southeast-1`

### Example Values
If your project URL is `https://buzzconnect-abc123.nhost.app`:
- **Subdomain**: `buzzconnect-abc123`
- **Region**: `us-east-1` (or whatever region you selected)

## ⚠️ Important Notes

1. **REACT_APP_ prefix**: Required for React environment variables
2. **Case sensitive**: Use exact casing as shown
3. **No quotes**: Don't wrap values in quotes in the dashboard
4. **Restart required**: Changes may require redeployment

## 🎯 Current Status

✅ **Configuration**: Fixed to allow deployment without AUTH_CLIENT_URL  
✅ **Deployment**: Should now succeed  
✅ **Flexibility**: Can add specific URLs after deployment  
✅ **Free Tier**: All settings optimized for free tier  

## 🚀 Next Steps

1. **Deploy**: Your app should now deploy successfully
2. **Get URL**: Note your deployed app URL
3. **Set Variables**: Add the required environment variables
4. **Test**: Verify your app works correctly

---

**Status**: ✅ **Ready for deployment** - Environment variable dependency resolved!
