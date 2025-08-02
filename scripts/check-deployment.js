#!/usr/bin/env node

/**
 * Deployment Health Check Script
 * 
 * This script checks if the deployment is configured correctly
 * and all required environment variables are set.
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 BuzzConnect Deployment Health Check (Free Tier Optimized)\n');

// Check if required files exist
const requiredFiles = [
  'nhost.toml',
  '.env.example',
  'package.json',
  'src/lib/nhost.js'
];

console.log('📁 Checking required files...');
let filesOk = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - Found`);
  } else {
    console.log(`❌ ${file} - Missing`);
    filesOk = false;
  }
});

// Check package.json scripts
console.log('\n📦 Checking package.json scripts...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const requiredScripts = ['start', 'build', 'test'];
let scriptsOk = true;

requiredScripts.forEach(script => {
  if (packageJson.scripts && packageJson.scripts[script]) {
    console.log(`✅ ${script} script - Found`);
  } else {
    console.log(`❌ ${script} script - Missing`);
    scriptsOk = false;
  }
});

// Check Nhost dependencies
console.log('\n📚 Checking Nhost dependencies...');
const requiredDeps = ['@nhost/nhost-js', '@nhost/react'];
let depsOk = true;

requiredDeps.forEach(dep => {
  if (packageJson.dependencies && packageJson.dependencies[dep]) {
    console.log(`✅ ${dep} - Found (${packageJson.dependencies[dep]})`);
  } else {
    console.log(`❌ ${dep} - Missing`);
    depsOk = false;
  }
});

// Check nhost.toml configuration
console.log('\n⚙️  Checking nhost.toml configuration...');
let nhostConfigOk = true;

try {
  const nhostConfig = fs.readFileSync('nhost.toml', 'utf8');

  const requiredSections = ['[web]', 'build_command', 'build_directory'];

  requiredSections.forEach(section => {
    if (nhostConfig.includes(section)) {
      console.log(`✅ ${section} - Found`);
    } else {
      console.log(`❌ ${section} - Missing`);
      nhostConfigOk = false;
    }
  });

  // Check for free tier optimization
  if (nhostConfig.includes('Free Tier')) {
    console.log('✅ Free tier optimization - Configured');
  } else {
    console.log('⚠️  Free tier optimization - Not explicitly marked');
  }

  // Check for minimal compute resources
  if (nhostConfig.includes('cpu = 62, memory = 128')) {
    console.log('✅ Minimal compute resources - Configured for free tier');
  } else {
    console.log('⚠️  Compute resources - May exceed free tier limits');
  }
} catch (error) {
  console.log('❌ Error reading nhost.toml');
  nhostConfigOk = false;
}

// Check environment variables setup
console.log('\n🔧 Checking environment variables setup...');
let envOk = true;

try {
  const envExample = fs.readFileSync('.env.example', 'utf8');
  const requiredEnvVars = ['REACT_APP_NHOST_SUBDOMAIN', 'REACT_APP_NHOST_REGION'];
  
  requiredEnvVars.forEach(envVar => {
    if (envExample.includes(envVar)) {
      console.log(`✅ ${envVar} - Documented in .env.example`);
    } else {
      console.log(`❌ ${envVar} - Missing from .env.example`);
      envOk = false;
    }
  });
} catch (error) {
  console.log('❌ Error reading .env.example');
  envOk = false;
}

// Final summary
console.log('\n📊 Summary:');
console.log('='.repeat(50));

const allChecks = [
  { name: 'Required Files', status: filesOk },
  { name: 'Package Scripts', status: scriptsOk },
  { name: 'Nhost Dependencies', status: depsOk },
  { name: 'Nhost Configuration', status: nhostConfigOk },
  { name: 'Environment Setup', status: envOk }
];

let allPassed = true;

allChecks.forEach(check => {
  const status = check.status ? '✅ PASS' : '❌ FAIL';
  console.log(`${check.name}: ${status}`);
  if (!check.status) allPassed = false;
});

console.log('='.repeat(50));

if (allPassed) {
  console.log('🎉 All checks passed! Your project is ready for Nhost FREE TIER deployment.');
  console.log('\n🆓 Free Tier Benefits:');
  console.log('- 1 GB database storage');
  console.log('- 1 GB file storage');
  console.log('- 5 GB monthly egress');
  console.log('- Unlimited users');
  console.log('- No time limits');
  console.log('\nNext steps:');
  console.log('1. Create a FREE project on app.nhost.io');
  console.log('2. Set up environment variables');
  console.log('3. Connect your GitHub repository');
  console.log('4. Deploy for FREE!');
  console.log('\nSee FREE_TIER_GUIDE.md for free tier specific guidance.');
} else {
  console.log('⚠️  Some checks failed. Please fix the issues above before deploying.');
  process.exit(1);
}

console.log('\n📖 For help, see:');
console.log('- README.md for general information');
console.log('- FREE_TIER_GUIDE.md for free tier guidance');
console.log('- DEPLOYMENT.md for deployment guide');
console.log('- https://docs.nhost.io for Nhost documentation');
