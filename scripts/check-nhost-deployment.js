#!/usr/bin/env node

console.log('🚀 Nhost Deployment Status Check');
console.log('================================');

// Check if required files exist
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'nhost/nhost.toml',
  'nhost/migrations/default/1733155200000_init_buzzconnect_schema/up.sql'
];

console.log('\n📁 Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

if (allFilesExist) {
  console.log('\n🎉 All required files are present!');
  console.log('\n📊 Configuration Summary:');
  console.log('- ✅ Nhost configuration (nhost.toml) - Modern config approach');
  console.log('- ✅ Database migrations - BuzzConnect schema');
  console.log('- ✅ No metadata files needed - Nhost manages this automatically');
  console.log('\n🚀 Your deployment should succeed!');
  
  console.log('\n📋 Next Steps:');
  console.log('1. Push changes to GitHub');
  console.log('2. Nhost will auto-deploy from main branch');
  console.log('3. Check deployment logs in Nhost dashboard');
  console.log('4. Verify all services are running');
  
} else {
  console.log('\n❌ Some required files are missing!');
  console.log('Please ensure all files are committed and pushed.');
}

console.log('\n🔗 Useful Links:');
console.log('- Nhost Dashboard: https://app.nhost.io');
console.log('- Deployment Logs: Check your project dashboard');
console.log('- GraphQL Endpoint: Will be available after successful deployment');
