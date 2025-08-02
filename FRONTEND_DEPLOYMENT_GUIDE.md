# Frontend Deployment Configuration Guide

## ⚠️ Important: Web Section Not Supported in nhost.toml

The `[web]` section is **not supported** in the current Nhost configuration format. Frontend deployment settings must be configured through the **Nhost Dashboard UI**.

## 🔧 How to Configure Frontend Deployment

### 1. In Your Nhost Dashboard

1. Go to your project in [app.nhost.io](https://app.nhost.io)
2. Navigate to **Settings** → **Git** or **Deployments**
3. Configure the following build settings:

### 2. Build Configuration

Set these values in the Nhost dashboard:

```
Build Command: npm run build
Build Directory: build
Install Command: npm install
Node Version: 18 (or latest LTS)
```

### 3. Environment Variables

In **Settings** → **Environment Variables**, add:

```
REACT_APP_NHOST_SUBDOMAIN=your-project-subdomain
REACT_APP_NHOST_REGION=your-project-region
```

**Example:**
```
REACT_APP_NHOST_SUBDOMAIN=buzzconnect-abc123
REACT_APP_NHOST_REGION=us-east-1
```

### 4. Repository Configuration

1. **Connect Repository**: Link your GitHub repository
2. **Branch**: Select `main` (or your deployment branch)
3. **Auto Deploy**: Enable automatic deployments on push

## 📁 What nhost.toml Should Contain

Your `nhost/nhost.toml` should **only** contain backend service configurations:

```toml
[global]

[hasura]
version = 'v2.46.0-ce'
adminSecret = '{{ secrets.HASURA_GRAPHQL_ADMIN_SECRET }}'
# ... other Hasura settings

[auth]
version = '0.39.0-beta6'
# ... auth settings

[postgres]
version = '16.6-20250311-1'
# ... database settings

[storage]
version = '0.7.1'
# ... storage settings
```

## ❌ What NOT to Include

**Do NOT include these sections in nhost.toml:**
```toml
# ❌ This will cause deployment failures
[web]
build_command = "npm run build"
build_directory = "build"

[web.environment]
REACT_APP_NHOST_SUBDOMAIN = "..."
```

## ✅ Correct Deployment Flow

1. **nhost.toml**: Contains only backend service configurations
2. **Nhost Dashboard**: Contains frontend build settings
3. **Environment Variables**: Set in dashboard, not in nhost.toml
4. **GitHub**: Repository connected for automatic deployments

## 🚀 Expected Deployment Logs

After removing the `[web]` section, your deployment should show:

```
✅ Detected new config file
✅ Successfully updated app configuration
✅ Building frontend...
✅ Deployment completed with status DEPLOYED
```

Instead of:
```
❌ Failed to update app configuration: graphql: field 'web' not found
```

## 🔍 Troubleshooting

### If deployment still fails:

1. **Check nhost.toml syntax**: Ensure valid TOML format
2. **Verify versions**: Use supported service versions
3. **Check secrets**: Ensure all required secrets are set
4. **Review logs**: Look for specific error messages

### Common Issues:

- **Invalid TOML syntax**: Use single quotes for strings
- **Unsupported versions**: Stick to officially supported versions
- **Missing secrets**: Set all required environment variables
- **Wrong file location**: Ensure file is at `nhost/nhost.toml`

## 📖 References

- **Nhost Documentation**: https://docs.nhost.io
- **Configuration Reference**: https://docs.nhost.io/platform/cli/configuration
- **Deployment Guide**: https://docs.nhost.io/platform/deployments

---

**Key Takeaway**: Frontend deployment configuration happens in the Nhost dashboard UI, not in nhost.toml!
