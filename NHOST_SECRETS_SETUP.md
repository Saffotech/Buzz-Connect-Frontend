# 🔐 Nhost Secrets Setup Guide

## ✅ Configuration Updated to Official Format

Based on the official Nhost documentation and examples, I've updated the `nhost.toml` to use the correct template format with secrets.

## 🔑 Required Secrets

You **must** set these secrets in your Nhost Dashboard before deployment will work:

### 1. **HASURA_GRAPHQL_ADMIN_SECRET**
- **Purpose**: Admin access to Hasura GraphQL API
- **Generate**: `openssl rand -base64 32`
- **Example**: `f03d5f5a0ed055e3fcbc0a3639405aca0511e6abe6d60e40d1fff610c6248f2a`

### 2. **NHOST_WEBHOOK_SECRET**
- **Purpose**: Secure webhooks between services
- **Generate**: `openssl rand -base64 32`
- **Example**: `a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456`

### 3. **HASURA_GRAPHQL_JWT_SECRET**
- **Purpose**: JWT signing and verification
- **Generate**: `openssl rand -base64 32`
- **Example**: `9876543210abcdef9876543210abcdef9876543210abcdef9876543210abcdef`

### 4. **GRAFANA_ADMIN_PASSWORD**
- **Purpose**: Grafana monitoring dashboard access
- **Generate**: Any strong password
- **Example**: `MyStrongGrafanaPassword2024!`

## 🎯 How to Set Secrets in Nhost Dashboard

### Step 1: Access Environment Variables
1. Go to [app.nhost.io](https://app.nhost.io)
2. Select your project
3. Navigate to **Settings** → **Environment Variables**

### Step 2: Add Required Secrets
Click **"Add Environment Variable"** for each secret:

```bash
# Secret 1
Name: HASURA_GRAPHQL_ADMIN_SECRET
Value: [generated-32-char-string]

# Secret 2  
Name: NHOST_WEBHOOK_SECRET
Value: [generated-32-char-string]

# Secret 3
Name: HASURA_GRAPHQL_JWT_SECRET
Value: [generated-32-char-string]

# Secret 4
Name: GRAFANA_ADMIN_PASSWORD
Value: [your-strong-password]
```

### Step 3: Generate Secrets
Use these commands to generate secure secrets:

```bash
# Generate all secrets at once
echo "HASURA_GRAPHQL_ADMIN_SECRET=$(openssl rand -base64 32)"
echo "NHOST_WEBHOOK_SECRET=$(openssl rand -base64 32)"
echo "HASURA_GRAPHQL_JWT_SECRET=$(openssl rand -base64 32)"
echo "GRAFANA_ADMIN_PASSWORD=MyStrongPassword2024!"
```

## 🚀 Expected Deployment Flow

After setting these secrets:

1. **Configuration Valid**: nhost.toml will resolve all `{{ secrets.* }}` references
2. **Services Start**: Hasura, Auth, Storage, Postgres will start properly
3. **Deployment Success**: Should show "DEPLOYED" status

## 📊 What Each Secret Does

| Secret | Used By | Purpose |
|--------|---------|---------|
| **HASURA_GRAPHQL_ADMIN_SECRET** | Hasura | Admin API access, metadata operations |
| **NHOST_WEBHOOK_SECRET** | Hasura + Auth | Secure service-to-service communication |
| **HASURA_GRAPHQL_JWT_SECRET** | Hasura + Auth | JWT token signing and verification |
| **GRAFANA_ADMIN_PASSWORD** | Grafana | Monitoring dashboard access |

## ⚠️ Security Best Practices

1. **Use Strong Secrets**: Minimum 32 characters, random generation
2. **Keep Secrets Private**: Never commit secrets to git
3. **Rotate Regularly**: Change secrets periodically
4. **Environment Specific**: Use different secrets for dev/staging/prod

## 🔧 Alternative: Auto-Generated Secrets

If you don't set these secrets, Nhost **may** auto-generate them, but this can cause deployment issues. It's better to set them explicitly.

## 🎯 Current Status

- ✅ **Configuration**: Updated to official format
- ✅ **Template Variables**: All secrets properly referenced
- ⚠️ **Secrets**: Need to be set in dashboard
- ⚠️ **Deployment**: Will succeed after secrets are set

## 📖 References

- **Official Example**: [react-apollo/nhost.toml](https://github.com/nhost/nhost/blob/main/examples/react-apollo/nhost/nhost.toml)
- **JWT Documentation**: [docs.nhost.io/products/auth/jwt](https://docs.nhost.io/products/auth/jwt)
- **Secrets Documentation**: [docs.nhost.io/platform/cloud/secrets](https://docs.nhost.io/platform/cloud/secrets)

---

**Next Step**: Set the 4 required secrets in your Nhost dashboard, then deploy!
