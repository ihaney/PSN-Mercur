# Supabase Setup and Testing Guide

## Step 1: Set Up Environment Variables

1. **Create `.env.local` file** in the `mercur/apps/storefront` directory (if it doesn't exist)

2. **Add your Supabase credentials**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find these:**
- Go to your Supabase project dashboard: https://app.supabase.com
- Navigate to: Project Settings → API
- Copy the "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
- Copy the "anon public" key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Restart your dev server** after adding environment variables:
```bash
npm run dev
```

## Step 2: Test Supabase Connection

### Option A: Using the Test Script

Run the Node.js test script:
```bash
node scripts/test-supabase.js
```

This will:
- ✅ Check if environment variables are set
- ✅ Test the Supabase connection
- ✅ Check if the `Suppliers` table exists
- ✅ Show available fields in the table
- ✅ Verify expected fields are present

### Option B: Using the API Endpoint

1. **Start the dev server** (if not already running):
```bash
npm run dev
```

2. **Test the API endpoint**:

**Using curl:**
```bash
curl http://localhost:3000/api/verify-supabase
```

**Using the test script:**
```bash
node scripts/test-api.js
```

**Or visit in browser:**
```
http://localhost:3000/api/verify-supabase
```

### Expected Response

**Success:**
```json
{
  "connected": true,
  "tableExists": true,
  "sampleRecord": { ... },
  "fields": ["Supplier_ID", "Supplier_Title", ...],
  "error": null
}
```

**If table doesn't exist:**
```json
{
  "connected": true,
  "tableExists": false,
  "error": "relation \"Suppliers\" does not exist"
}
```

**If environment variables missing:**
```json
{
  "connected": false,
  "error": "Supabase client is null. Check environment variables..."
}
```

## Step 3: Review Verification Output

### Check the following:

1. **Connection Status**: Should be `true`
2. **Table Exists**: Should be `true` if your table is named `Suppliers`
3. **Fields Available**: Review the list of fields
4. **Errors**: Check for any error messages

### Common Issues:

#### Issue: Table name is different
If you see "relation does not exist", your table might be:
- `suppliers` (lowercase)
- `supplier` (singular)
- Another name

**Solution**: Update the table name in `src/lib/data/suppliers.ts`:
```typescript
.from('suppliers') // Change from 'Suppliers' to your actual table name
```

#### Issue: Field names don't match
If fields are missing, check:
- What fields actually exist in your Supabase table
- Update field mappings in `src/lib/data/suppliers.ts`

## Step 4: Adjust Field Mappings (If Needed)

If your Supabase schema uses different field names, update `src/lib/data/suppliers.ts`:

1. **Check your actual field names** from the verification output
2. **Update the mappings** in the `extendedMetadata` object:

```typescript
extendedMetadata = {
  ai_business_summary: data.ai_business_summary || data.Supplier_Description || data.description,
  // Add your actual field names here
}
```

The code already tries multiple variations, but you may need to add more.

## Step 5: Test Supplier Pages

### Test Supplier Listing Page

1. **Navigate to**: `http://localhost:3000/en/sellers` (or your locale)
2. **Check**:
   - ✅ Page loads without errors
   - ✅ Suppliers are displayed
   - ✅ Browser console has no errors
   - ✅ Network tab shows API calls

**Expected behavior:**
- Shows suppliers from Medusa
- If Supabase is connected, metadata is enriched
- Infinite scroll works
- Filters work (if implemented)

### Test Supplier Detail Page

1. **Navigate to**: `http://localhost:3000/en/sellers/[handle]` (use an actual seller handle)
2. **Check**:
   - ✅ Page loads without errors
   - ✅ Supplier information is displayed
   - ✅ If Supabase connected, extended metadata shows:
     - Business Summary
     - Industries Supported
     - Certifications
     - Contact Information

**Expected behavior:**
- Shows supplier from Medusa
- If Supabase connected, shows extended metadata
- Tabs work (Supplier Info, Products, Contact)
- Products are listed (if any)

## Troubleshooting

### "Supabase client is null"
- ✅ Check `.env.local` exists
- ✅ Check environment variables are set correctly
- ✅ Restart dev server after adding env vars

### "Table does not exist"
- ✅ Check table name in Supabase dashboard
- ✅ Update table name in `suppliers.ts` if different
- ✅ Check RLS policies allow read access

### "Fields are missing"
- ✅ Check actual field names in Supabase
- ✅ Update field mappings in `suppliers.ts`
- ✅ The code tries multiple variations automatically

### Pages work but no Supabase data
- ✅ Check browser console for warnings
- ✅ Verify Supabase connection via API endpoint
- ✅ Check that `Supplier_ID` in Supabase matches `seller.id` from Medusa

## Quick Test Checklist

- [ ] `.env.local` file created with Supabase credentials
- [ ] Dev server restarted after adding env vars
- [ ] API endpoint `/api/verify-supabase` returns success
- [ ] Supplier listing page loads: `/[locale]/sellers`
- [ ] Supplier detail page loads: `/[locale]/sellers/[handle]`
- [ ] No errors in browser console
- [ ] Extended metadata appears (if Supabase connected)

## Next Steps

Once everything is working:
1. ✅ Test with real supplier data
2. ✅ Verify metadata is being merged correctly
3. ✅ Test all features (saving suppliers, messaging, etc.)
4. ✅ Check performance with large datasets

