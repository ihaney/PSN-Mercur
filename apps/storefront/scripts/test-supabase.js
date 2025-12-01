/**
 * Test script to verify Supabase connection
 * Run with: node scripts/test-supabase.js
 * 
 * Make sure to set environment variables first:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

const { createClient } = require('@supabase/supabase-js')

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...\n')

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables!')
    console.log('\nPlease set the following in your .env.local file:')
    console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key')
    console.log('\nOr export them before running this script:')
    console.log('export NEXT_PUBLIC_SUPABASE_URL=...')
    console.log('export NEXT_PUBLIC_SUPABASE_ANON_KEY=...')
    process.exit(1)
  }

  console.log('✅ Environment variables found')
  console.log(`   URL: ${supabaseUrl.substring(0, 30)}...`)
  console.log(`   Key: ${supabaseKey.substring(0, 20)}...\n`)

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Test 1: Check connection
  console.log('📡 Testing connection...')
  try {
    const { data, error } = await supabase
      .from('Suppliers')
      .select('*')
      .limit(1)

    if (error) {
      console.error('❌ Connection failed!')
      console.error(`   Error: ${error.message}`)
      
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('\n💡 Possible issues:')
        console.log('   1. Table name might be different (check if it\'s lowercase "suppliers")')
        console.log('   2. Table doesn\'t exist in your Supabase database')
        console.log('   3. RLS (Row Level Security) policies might be blocking access')
        console.log('\n   Try checking your Supabase dashboard for the actual table name.')
      }
      
      process.exit(1)
    }

    console.log('✅ Connection successful!\n')

    // Test 2: Check table structure
    if (data && data.length > 0) {
      console.log('📊 Sample record found:')
      const sample = data[0]
      console.log(`   Fields: ${Object.keys(sample).join(', ')}`)
      console.log(`   Total fields: ${Object.keys(sample).length}\n`)

      // Check for expected fields
      const expectedFields = [
        'Supplier_ID',
        'Supplier_Title',
        'Supplier_Description',
        'ai_business_summary',
        'certifications',
        'compliance_status',
        'years_in_business',
        'employee_count',
        'industries_supported',
      ]

      console.log('🔍 Checking for expected fields:')
      const foundFields = []
      const missingFields = []

      expectedFields.forEach(field => {
        if (sample.hasOwnProperty(field)) {
          foundFields.push(field)
          console.log(`   ✅ ${field}`)
        } else {
          missingFields.push(field)
          console.log(`   ⚠️  ${field} (not found)`)
        }
      })

      console.log(`\n   Found: ${foundFields.length}/${expectedFields.length} expected fields`)

      if (missingFields.length > 0) {
        console.log('\n⚠️  Some expected fields are missing.')
        console.log('   The code will still work, but some features may not be available.')
        console.log('   You may need to adjust field mappings in src/lib/data/suppliers.ts')
      }
    } else {
      console.log('⚠️  Table exists but is empty')
      console.log('   This is okay - the code will work with Medusa data only')
    }

    // Test 3: Try to count records
    console.log('\n📈 Counting records...')
    const { count, error: countError } = await supabase
      .from('Suppliers')
      .select('*', { count: 'exact', head: true })

    if (!countError) {
      console.log(`   Total records: ${count || 0}`)
    }

    console.log('\n✅ All tests passed!')
    console.log('\nNext steps:')
    console.log('1. Test the API endpoint: http://localhost:3000/api/verify-supabase')
    console.log('2. Visit the supplier listing page: /[locale]/sellers')
    console.log('3. Visit a supplier detail page: /[locale]/sellers/[handle]')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    process.exit(1)
  }
}

// Run the test
testSupabaseConnection().catch(console.error)

