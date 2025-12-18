#!/usr/bin/env node

/// node .demo/scripts/blur-control.cjs on "Your custom message"
/// node .demo/scripts/blur-control.cjs off

const https = require('http');

const API_URL = 'http://127.0.0.1:42042/action';

function makeRequest(data) {
  const url = new URL(API_URL);
  
  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body);
        } else {
          reject(new Error(`Request failed with status ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function blurOn(message) {
  const payload = JSON.stringify({
    action: 'blur.on',
    message: message || 'Hello World',
    background_color: 'rgba(0,0,0,0.9)',
    text_color: '#ffffff'
  });

  try {
    const response = await makeRequest(payload);
    console.log('✓ Blur turned ON');
    console.log(response);
  } catch (error) {
    console.error('✗ Error turning blur on:', error.message);
    process.exit(1);
  }
}

async function blurOff() {
  const payload = JSON.stringify({
    action: 'blur.off'
  });

  try {
    const response = await makeRequest(payload);
    console.log('✓ Blur turned OFF');
    console.log(response);
  } catch (error) {
    console.error('✗ Error turning blur off:', error.message);
    process.exit(1);
  }
}

// Main execution
const args = process.argv.slice(2);
const action = args[0];

if (!action || !['on', 'off'].includes(action)) {
  console.log('Usage:');
  console.log('  node blur-control.cjs on [message]   - Turn blur on with optional message');
  console.log('  node blur-control.cjs off            - Turn blur off');
  console.log('');
  console.log('Examples:');
  console.log('  node blur-control.cjs on "Recording in progress"');
  console.log('  node blur-control.cjs off');
  process.exit(1);
}

if (action === 'on') {
  const message = args.slice(1).join(' ') || 'Hello World';
  blurOn(message);
} else if (action === 'off') {
  blurOff();
}
