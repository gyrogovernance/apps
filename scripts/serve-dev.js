#!/usr/bin/env node

/**
 * Simple development server for testing the GyroGovernance extension
 * 
 * This serves the dist/ directory on a local HTTP server to avoid
 * CORS issues when testing with file:// protocol.
 * 
 * Usage:
 *   node scripts/serve-dev.js
 *   # Then open http://localhost:3000/sidepanel.html
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, '..', 'dist');

// MIME types for different file extensions
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.zip': 'application/zip',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Try to start server, if port is busy, try next port
function startServer(port) {
  const server = http.createServer((req, res) => {
    let filePath = path.join(DIST_DIR, req.url === '/' ? 'sidepanel.html' : req.url);
    
    // Security: prevent directory traversal
    if (!filePath.startsWith(DIST_DIR)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden');
      return;
    }
    
    // Check if file exists
    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File not found');
        return;
      }
      
      // Get file extension and set appropriate MIME type
      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      
      // Read and serve the file
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal server error');
          return;
        }
        
        res.writeHead(200, { 
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end(data);
      });
    });
  });

  server.listen(port, () => {
    console.log(`🚀 Development server running at http://localhost:${port}`);
    console.log(`📱 Open http://localhost:${port}/sidepanel.html to test the extension`);
    console.log(`📊 Import functionality should work without CORS issues`);
    console.log(`\nPress Ctrl+C to stop the server`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️  Port ${port} is busy, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development server...');
    server.close(() => {
      console.log('✅ Server stopped');
      process.exit(0);
    });
  });
}

// Start the server
startServer(PORT);