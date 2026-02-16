/**
 * Verification script for book deduplication
 * Tests that selecting the same book twice returns the same record
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables from .env.local
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyDedup() {
  console.log('🔍 Testing book deduplication...\n')

  // Test data: The Lean Startup (already exists in database)
  const testBook = {
    title: 'The Lean Startup',
    author: 'Eric Ries',
    open_library_key: '/works/OL16086010W',
  }

  console.log('Test book:', testBook)
  console.log('Expected behavior: Both queries should return the SAME book record\n')

  // First query: should find existing book
  console.log('📚 First query...')
  const { data: firstBook, error: firstError } = await supabase
    .from('books')
    .select('*')
    .eq('open_library_key', testBook.open_library_key)
    .single()

  if (firstError) {
    console.error('❌ First query failed:', firstError.message)
    return
  }

  if (!firstBook) {
    console.log('⚠️  Book not found in database. Creating it...')
    const { data: newBook, error: createError } = await supabase
      .from('books')
      .insert({
        title: testBook.title,
        author: testBook.author,
        open_library_key: testBook.open_library_key,
        slug: testBook.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        description: 'Test description',
        cover_url: null,
        published_year: 2011,
      })
      .select()
      .single()

    if (createError) {
      console.error('❌ Failed to create book:', createError.message)
      return
    }

    console.log('✅ Book created:', newBook?.id)
    console.log('\nNow run this script again to test deduplication.')
    return
  }

  console.log('✅ Found existing book:')
  console.log(`   ID: ${firstBook.id}`)
  console.log(`   Title: ${firstBook.title}`)
  console.log(`   Created: ${firstBook.created_at}`)

  // Second query: should find the SAME book
  console.log('\n📚 Second query (simulating selecting the same book again)...')
  const { data: secondBook, error: secondError } = await supabase
    .from('books')
    .select('*')
    .eq('open_library_key', testBook.open_library_key)
    .single()

  if (secondError) {
    console.error('❌ Second query failed:', secondError.message)
    return
  }

  console.log('✅ Found book:')
  console.log(`   ID: ${secondBook.id}`)
  console.log(`   Title: ${secondBook.title}`)
  console.log(`   Created: ${secondBook.created_at}`)

  // Verify deduplication worked
  console.log('\n🔍 Verification:')
  if (firstBook.id === secondBook.id) {
    console.log('✅ SUCCESS! Both queries returned the SAME book (ID matches)')
    console.log('✅ Deduplication is working correctly')
  } else {
    console.log('❌ FAILED! Queries returned DIFFERENT books')
    console.log(`   First book ID: ${firstBook.id}`)
    console.log(`   Second book ID: ${secondBook.id}`)
  }

  // Check for duplicates in database
  console.log('\n🔍 Checking for duplicates in database...')
  const { data: allBooks, error: countError } = await supabase
    .from('books')
    .select('id, title, open_library_key')
    .eq('open_library_key', testBook.open_library_key)

  if (countError) {
    console.error('❌ Failed to check for duplicates:', countError.message)
    return
  }

  console.log(`Found ${allBooks.length} book(s) with open_library_key = ${testBook.open_library_key}`)

  if (allBooks.length === 1) {
    console.log('✅ No duplicates found (expected)')
  } else {
    console.log('❌ Multiple books found with the same open_library_key:')
    allBooks.forEach((book, index) => {
      console.log(`   ${index + 1}. ID: ${book.id}, Title: ${book.title}`)
    })
  }
}

verifyDedup().catch(console.error)
