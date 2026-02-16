#!/usr/bin/env node
/**
 * Automated verification script for BookSearch functionality
 * Tests: API integration, debounce, loading states, cover URLs
 */

const http = require('http');

// Colors for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(emoji, message, color = colors.reset) {
  console.log(`${emoji} ${color}${message}${colors.reset}`);
}

function pass(message) {
  log('✅', message, colors.green);
}

function fail(message) {
  log('❌', message, colors.red);
}

function info(message) {
  log('ℹ️ ', message, colors.blue);
}

async function testOpenLibraryAPI() {
  info('Testing Open Library API integration...');

  try {
    const response = await fetch('https://openlibrary.org/search.json?q=dune&limit=5&fields=key,title,author_name,first_publish_year,cover_i,number_of_pages_median');
    const data = await response.json();

    if (!data.docs || data.docs.length === 0) {
      fail('API returned no results');
      return false;
    }

    pass(`API returned ${data.docs.length} results`);

    // Check first result has expected fields
    const book = data.docs[0];
    const hasRequiredFields = book.key && book.title && book.author_name;

    if (hasRequiredFields) {
      pass(`Results have required fields: key, title, author_name`);
    } else {
      fail('Results missing required fields');
      return false;
    }

    // Verify cover URL construction
    if (book.cover_i) {
      const coverUrl = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
      const coverResponse = await fetch(coverUrl, { method: 'HEAD' });

      if (coverResponse.ok || coverResponse.status === 302) {
        pass(`Cover URL is valid: ${coverUrl}`);
      } else {
        fail(`Cover URL returned ${coverResponse.status}`);
        return false;
      }
    }

    return true;
  } catch (error) {
    fail(`API test failed: ${error.message}`);
    return false;
  }
}

async function testPageLoads() {
  info('Testing /test-search page loads...');

  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000/test-search', (res) => {
      if (res.statusCode === 200) {
        pass('Test page loads successfully (HTTP 200)');
        resolve(true);
      } else {
        fail(`Test page returned HTTP ${res.statusCode}`);
        resolve(false);
      }
    });

    req.on('error', (error) => {
      fail(`Failed to connect to dev server: ${error.message}`);
      fail('Make sure `npm run dev` is running');
      resolve(false);
    });
  });
}

async function testComponentStructure() {
  info('Verifying component implementation...');

  const fs = require('fs');
  const componentPath = './src/components/BookSearch.tsx';

  try {
    const content = fs.readFileSync(componentPath, 'utf8');

    // Check for debounce implementation (setTimeout with 300ms)
    if (content.includes('setTimeout') && content.includes('300')) {
      pass('Debounce implementation found (300ms timeout)');
    } else {
      fail('Debounce implementation not found or incorrect timeout');
      return false;
    }

    // Check for AbortController
    if (content.includes('AbortController')) {
      pass('AbortController found for cancelling in-flight requests');
    } else {
      fail('AbortController not implemented');
      return false;
    }

    // Check for loading state
    if (content.includes('loading') && content.includes('setLoading')) {
      pass('Loading state management found');
    } else {
      fail('Loading state not implemented');
      return false;
    }

    // Check for error handling
    if (content.includes('error') && content.includes('setError')) {
      pass('Error state management found');
    } else {
      fail('Error state not implemented');
      return false;
    }

    // Check for 3-character minimum
    if (content.includes('< 3') || content.includes('< 3')) {
      pass('3-character minimum validation found');
    } else {
      fail('3-character minimum not implemented');
      return false;
    }

    // Check for empty results message
    if (content.includes('No books found')) {
      pass('Empty results message found');
    } else {
      fail('Empty results message not found');
      return false;
    }

    // Check for loading spinner
    if (content.includes('animate-spin') || content.includes('spinner')) {
      pass('Loading spinner implementation found');
    } else {
      fail('Loading spinner not found');
      return false;
    }

    return true;
  } catch (error) {
    fail(`Failed to read component file: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('📚 BookSearch Component Verification');
  console.log('='.repeat(60) + '\n');

  const results = [];

  // Test 1: Component structure
  results.push(await testComponentStructure());
  console.log('');

  // Test 2: Page loads
  results.push(await testPageLoads());
  console.log('');

  // Test 3: API integration
  results.push(await testOpenLibraryAPI());
  console.log('');

  // Summary
  console.log('='.repeat(60));
  const passed = results.filter(Boolean).length;
  const total = results.length;

  if (passed === total) {
    pass(`All tests passed! (${passed}/${total})`);
    console.log('');
    info('Manual verification checklist:');
    console.log('  1. Open http://localhost:3000/test-search');
    console.log('  2. Type "dune" and verify:');
    console.log('     - Loading spinner appears briefly');
    console.log('     - Results appear after ~300ms debounce');
    console.log('     - Book covers display correctly');
    console.log('     - Title, author, and year are shown');
    console.log('  3. Click a book to select it');
    console.log('  4. Check browser console for logged book data');
    console.log('');
    return true;
  } else {
    fail(`Tests failed: ${total - passed} issues found`);
    return false;
  }
}

// Run tests
runAllTests().then(success => {
  process.exit(success ? 0 : 1);
});
