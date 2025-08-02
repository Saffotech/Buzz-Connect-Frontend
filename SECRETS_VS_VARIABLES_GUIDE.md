# 🔐 Nhost Secrets vs Variables Guide

## 🎯 **The Key Difference**

Nhost has **two different systems** for configuration values:

### 1. **`secrets.*`** - User-Defined Secrets
- Values **you create and manage**
- Used for sensitive data you control
- Referenced as `{{ secrets.SECRET_NAME }}`

### 2. **`variables.*`** - System Environment Variables  
- Values **automatically generated** by Nhost
- Used for system configuration and URLs
- Referenced as `{{ variables.VARIABLE_NAME }}`

## 📊 **What We Fixed**

### ❌ **Before (Incorrect)**
```toml
adminSecret = '{{ secrets.HASURA_GRAPHQL_ADMIN_SECRET }}'     # Wrong - should use system variable
webhookSecret = '{{ secrets.NHOST_WEBHOOK_SECRET }}'          # Wrong - should use system variable
key = '{{ secrets.HASURA_GRAPHQL_JWT_SECRET }}'               # Wrong - should use system variable
clientUrl = '{{ secrets.AUTH_CLIENT_URL }}'                   # Wrong - should use system variable
```

### ✅ **After (Correct)**
```toml
adminSecret = '{{ variables.NHOST_ADMIN_SECRET }}'            # ✅ Uses system variable
webhookSecret = '{{ variables.NHOST_WEBHOOK_SECRET }}'        # ✅ Uses system variable  
key = '{{ variables.NHOST_JWT_SECRET }}'                      # ✅ Uses system variable
clientUrl = 'https://{{ variables.NHOST_SUBDOMAIN }}.nhost.app' # ✅ Uses system variable
```

## 🔍 **Your Available Variables**

### **System Variables (variables.*)**
From your dashboard:
- `NHOST_ADMIN_SECRET` - Auto-generated admin secret
- `NHOST_WEBHOOK_SECRET` - Auto-generated webhook secret
- `NHOST_JWT_SECRET` - Auto-generated JWT secret
- `NHOST_SUBDOMAIN` = `rrbtsubvwmsqbnqyubmc`
- `NHOST_REGION` = `ap-south-1`
- Various service URLs

### **User Secrets (secrets.*)**
From your dashboard:
- `HASURA_GRAPHQL_ADMIN_SECRET` - Your custom admin secret
- `HASURA_GRAPHQL_JWT_SECRET` - Your custom JWT secret
- `NHOST_WEBHOOK_SECRET` - Your custom webhook secret
- `GRAFANA_ADMIN_PASSWORD` - Your custom password
- `AUTH_CLIENT_URL` - Your custom client URL

## 🎯 **When to Use Which**

### **Use `variables.*` for:**
- ✅ **System configuration** - Admin secrets, JWT secrets
- ✅ **Auto-generated values** - Subdomain, region, service URLs
- ✅ **Internal service communication** - Webhook secrets
- ✅ **Dynamic URLs** - Based on subdomain/region

### **Use `secrets.*` for:**
- ✅ **Custom passwords** - Grafana admin password
- ✅ **External API keys** - Third-party service keys
- ✅ **Custom configuration** - Values you want to control
- ✅ **Environment-specific values** - Different per environment

## 🚀 **Why This Fixes the Timeout**

The Hasura timeout was happening because:

1. **Wrong secret references** - Hasura couldn't find the values
2. **Auth service couldn't connect** - Missing proper admin secret
3. **JWT verification failed** - Wrong JWT secret reference
4. **Redirect URLs incorrect** - Wrong client URL format

Now with correct `variables.*` references:
- ✅ Hasura gets the right admin secret
- ✅ Auth can connect with proper credentials  
- ✅ JWT verification works correctly
- ✅ Redirect URLs are dynamically generated

## 📋 **Current Configuration Summary**

```toml
# ✅ Using system variables for core functionality
[hasura]
adminSecret = '{{ variables.NHOST_ADMIN_SECRET }}'
webhookSecret = '{{ variables.NHOST_WEBHOOK_SECRET }}'

[[hasura.jwtSecrets]]
key = '{{ variables.NHOST_JWT_SECRET }}'

[auth.redirections]
clientUrl = 'https://{{ variables.NHOST_SUBDOMAIN }}.nhost.app'
allowedUrls = ['https://{{ variables.NHOST_SUBDOMAIN }}.nhost.app', ...]
```

## 🎉 **Expected Result**

After this fix:
- ✅ **Hasura starts properly** with correct admin secret
- ✅ **Auth connects successfully** to Hasura
- ✅ **No more timeout errors** during metadata application
- ✅ **JWT verification works** with correct secret
- ✅ **Redirects work** with proper URLs

## 🔧 **Best Practices**

### **Always Use System Variables For:**
- Admin secrets
- JWT secrets  
- Webhook secrets
- Subdomain/region
- Service URLs

### **Use Custom Secrets For:**
- External API keys
- Custom passwords
- Environment-specific config
- Third-party integrations

---

**Status**: ✅ **Fixed** - Now using correct variable references for system configuration!
