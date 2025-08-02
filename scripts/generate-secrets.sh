#!/bin/bash

# Nhost Secrets Generator
# This script generates all required secrets for your Nhost deployment

echo "🔐 Nhost Secrets Generator"
echo "=========================="
echo ""

echo "📋 Copy these secrets to your Nhost Dashboard:"
echo "Settings → Environment Variables"
echo ""

echo "🔑 Required Secrets:"
echo "-------------------"

echo ""
echo "1. AUTH_CLIENT_URL (CRITICAL - Replace with your actual app URL):"
echo "AUTH_CLIENT_URL=https://your-subdomain.nhost.app"
echo ""

echo "2. HASURA_GRAPHQL_ADMIN_SECRET:"
echo "HASURA_GRAPHQL_ADMIN_SECRET=$(openssl rand -base64 32)"
echo ""

echo "3. NHOST_WEBHOOK_SECRET:"
echo "NHOST_WEBHOOK_SECRET=$(openssl rand -base64 32)"
echo ""

echo "4. HASURA_GRAPHQL_JWT_SECRET:"
echo "HASURA_GRAPHQL_JWT_SECRET=$(openssl rand -base64 32)"
echo ""

echo "5. GRAFANA_ADMIN_PASSWORD:"
echo "GRAFANA_ADMIN_PASSWORD=MyStrongGrafanaPassword2024!"
echo ""

echo "📝 Instructions:"
echo "1. Replace 'your-subdomain' in AUTH_CLIENT_URL with your actual Nhost subdomain"
echo "2. Copy each secret to your Nhost Dashboard (Settings → Environment Variables)"
echo "3. Redeploy your app after setting all secrets"
echo ""

echo "🔍 How to find your subdomain:"
echo "- Check your Nhost project dashboard"
echo "- Look at deployment logs"
echo "- Your URL format: https://[subdomain].nhost.app"
echo ""

echo "✅ After setting these secrets, your deployment should work correctly!"
