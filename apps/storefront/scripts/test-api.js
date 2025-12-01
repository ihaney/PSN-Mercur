/**
 * Test the Supabase verification API endpoint
 * Run with: node scripts/test-api.js
 * 
 * Make sure the Next.js dev server is running first:
 * npm run dev
 */

const http = require('http')

const port = process.env.PORT || 3000
const host = 'localhost'

function testAPI() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: host,
      port: port,
      path: '/api/verify-supabase',
      method: 'GET',
    }

    const req = http.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          resolve({ status: res.statusCode, data: json })
        } catch (e) {
          resolve({ status: res.statusCode, data: data })
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.end()
  })
}

async function runTest() {
  console.log('🔍 Testing Supabase Verification API...\n')
  console.log(`   Endpoint: http://${host}:${port}/api/verify-supabase\n`)

  try {
    const result = await testAPI()
    
    console.log(`📊 Response Status: ${result.status}\n`)
    console.log('📋 Response Data:')
    console.log(JSON.stringify(result.data, null, 2))
    
    if (result.status === 200) {
      if (result.data.connected) {
        console.log('\n✅ Supabase connection successful!')
        if (result.data.tableExists) {
          console.log('✅ Suppliers table exists and is accessible')
          if (result.data.fields && result.data.fields.length > 0) {
            console.log(`✅ Found ${result.data.fields.length} fields in table`)
            console.log(`   Fields: ${result.data.fields.join(', ')}`)
          }
        } else {
          console.log('⚠️  Table may not exist or is not accessible')
        }
      } else {
        console.log('\n⚠️  Supabase client not connected')
        if (result.data.error) {
          console.log(`   Error: ${result.data.error}`)
        }
      }
    } else {
      console.log('\n❌ API request failed')
      if (result.data.error) {
        console.log(`   Error: ${result.data.error}`)
      }
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connection refused!')
      console.error('\n   Make sure the Next.js dev server is running:')
      console.error('   npm run dev')
    } else {
      console.error('❌ Error:', error.message)
    }
    process.exit(1)
  }
}

runTest()

