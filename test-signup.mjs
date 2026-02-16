#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://acbrvjpggtnptcmqdcbw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjYnJ2anBnZ3RucHRjbXFkY2J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MTY1OTMsImV4cCI6MjA4NjE5MjU5M30.QOI4Q_MqjgcZeb2frjM46La2JeMQuqpBK76cDqKgz8U'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSignup() {
  console.log('🧪 Testing signup flow...\n')

  // Generate unique test email
  const timestamp = Date.now()
  const testEmail = `bookpitches-test-${timestamp}@gmail.com`
  const testPassword = 'testpass123'
  const testName = 'Test User'

  console.log(`📧 Test email: ${testEmail}`)
  console.log(`👤 Test name: ${testName}\n`)

  // Step 1: Sign up
  console.log('Step 1: Creating account...')
  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        name: testName,
      },
    },
  })

  if (signupError) {
    console.error('❌ Signup failed:', signupError.message)
    process.exit(1)
  }

  console.log('✅ Signup successful')
  console.log(`   User ID: ${signupData.user?.id}`)
  console.log(`   Email: ${signupData.user?.email}\n`)

  // Step 2: Verify user profile was created in database
  console.log('Step 2: Verifying profile in database...')

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', signupData.user.id)
    .single()

  if (profileError) {
    console.error('❌ Profile not found:', profileError.message)
    process.exit(1)
  }

  console.log('✅ Profile found in database')
  console.log(`   ID: ${profile.id}`)
  console.log(`   Name: ${profile.name}`)
  console.log(`   Slug: ${profile.slug}`)
  console.log(`   Created: ${profile.created_at}\n`)

  // Validate profile data matches signup data
  if (profile.name !== testName) {
    console.error(`❌ Name mismatch: expected "${testName}", got "${profile.name}"`)
    process.exit(1)
  }

  if (!profile.slug) {
    console.error('❌ Slug not generated')
    process.exit(1)
  }

  console.log('✅ Profile data validated')
  console.log('✅ All tests passed!\n')

  // Cleanup: Sign out
  await supabase.auth.signOut()

  console.log('🎉 Signup flow test complete!')
  console.log('📝 Summary:')
  console.log('   - Account created in auth.users')
  console.log('   - Profile auto-created in public.users via trigger')
  console.log('   - Name populated from user_metadata')
  console.log('   - Slug auto-generated from email')
}

testSignup().catch(console.error)
