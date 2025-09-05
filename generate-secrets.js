#!/usr/bin/env node

/**
 * Script to generate JWT secret key for GitHub Actions setup
 * Run with: node generate-secrets.js
 */

const crypto = require('crypto');

console.log('🔐 GitHub Actions Setup Helper\n');

// Generate JWT secret key
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('Generated JWT Secret Key:');
console.log(jwtSecret);
console.log('\n📋 Copy this value to your GitHub repository secrets as JWT_SECRET_KEY\n');

// Show required secrets
console.log('📝 Required GitHub Secrets:');
console.log('┌─────────────────────┬─────────────────────────────────────────────┐');
console.log('│ Secret Name         │ Value                                        │');
console.log('├─────────────────────┼─────────────────────────────────────────────┤');
console.log('│ GCP_PROJECT_ID      │ nice-height-460409-m5                       │');
console.log('│ GCP_SA_KEY          │ [Your service account JSON key]             │');
console.log('│ JWT_SECRET_KEY      │ ' + jwtSecret.substring(0, 20) + '... │');
console.log('└─────────────────────┴─────────────────────────────────────────────┘');

console.log('\n🚀 Next Steps:');
console.log('1. Create a service account in Google Cloud Console');
console.log('2. Download the JSON key file');
console.log('3. Add all secrets to your GitHub repository');
console.log('4. Push your code to trigger deployment!');

console.log('\n📖 For detailed instructions, see GITHUB_SETUP.md');
