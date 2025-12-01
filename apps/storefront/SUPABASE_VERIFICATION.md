# Supabase Integration Verification Guide

This guide helps you verify and test the Supabase integration for supplier metadata.

## Prerequisites

1. **Environment Variables**: Ensure these are set in your `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (optional, for admin operations)
   ```

2. **Supabase Table**: The code expects a table named `Suppliers` with the following fields:
   - `Supplier_ID` (primary key, matches Medusa seller.id)
   - `Supplier_Title` or `name`
   - `Supplier_Description` or `description`
   - `ai_business_summary`
   - `certifications` (array)
   - `compliance_status`
   - `years_in_business`
   - `employee_count`
   - `industries_supported` or `ai_industries_supported`
   - `Supplier_Website` or `website`
   - `Supplier_Whatsapp` or `whatsapp`
   - `Supplier_Location` or `address_line`
   - `Supplier_Country_Name` or `country_name`
   - `Supplier_City_Name` or `city_name`
   - `Supplier_Category` or `category`
   - `Supplier_Logo` or `logo`
   - `Supplier_Source_ID` or `source_id`

## Testing Steps

### 1. Verify Supabase Connection

Visit the API endpoint to test the connection:
```
GET /api/verify-supabase
```

This will return:
- `connected`: Whether Supabase client was created
- `tableExists`: Whether the Suppliers table exists and is accessible
- `sampleRecord`: A sample record from the table (if available)
- `fields`: List of fields in the sample record
- `error`: Any error messages

### 2. Test Fetching a Specific Supplier

```
GET /api/verify-supabase?supplierId=YOUR_SUPPLIER_ID
```

This tests fetching a supplier by ID using different field name variations.

### 3. Test Supplier Listing Page

1. Navigate to: `/[locale]/sellers`
2. Check browser console for any errors
3. Verify suppliers are displayed
4. Check if Supabase metadata is being loaded (check network tab)

### 4. Test Supplier Detail Page

1. Navigate to: `/[locale]/sellers/[handle]`
2. Check if extended metadata appears:
   - Business Summary
   - Industries Supported
   - Certifications
   - Contact Information

## Troubleshooting

### Issue: "Supabase client is null"

**Solution**: Check environment variables:
- Ensure `NEXT_PUBLIC_SUPABASE_URL` is set
- Ensure `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
- Restart your dev server after adding env vars

### Issue: "Table does not exist" or "relation does not exist"

**Possible causes**:
1. Table name is different (check if it's lowercase `suppliers` or another name)
2. Table doesn't exist in your Supabase database
3. RLS (Row Level Security) policies are blocking access

**Solutions**:
1. Check your Supabase dashboard for the actual table name
2. Update the table name in `src/lib/data/suppliers.ts` if different
3. Check RLS policies in Supabase dashboard

### Issue: "Supplier not found" but seller exists in Medusa

**Possible causes**:
1. `Supplier_ID` in Supabase doesn't match `seller.id` from Medusa
2. Field name is different

**Solutions**:
1. Verify the ID mapping between Medusa and Supabase
2. Check the API verification endpoint to see which field names work
3. Update field mappings in `src/lib/data/suppliers.ts`

### Issue: Fields are missing or null

**Solution**: The code tries multiple field name variations. Check:
1. What fields exist in your Supabase table
2. Use the verification API to see the actual field names
3. Update the field mappings in `src/lib/data/suppliers.ts` if needed

## Code Locations

- **Supabase Client**: `src/lib/supabase-server.ts`
- **Supplier Data Layer**: `src/lib/data/suppliers.ts`
- **Verification Utilities**: `src/lib/data/verify-supabase.ts`
- **API Route**: `src/app/api/verify-supabase/route.ts`
- **Supplier Listing**: `src/app/[locale]/(main)/sellers/page.tsx`
- **Supplier Detail**: `src/app/[locale]/(main)/sellers/[handle]/page.tsx`

## Expected Behavior

### Without Supabase
- Supplier listing page works (shows Medusa sellers only)
- Supplier detail page works (shows Medusa seller data only)
- No errors, just warnings in console

### With Supabase
- Supplier listing page shows enriched data
- Supplier detail page shows extended metadata:
  - Business summaries
  - Certifications
  - Industries supported
  - Additional contact information

## Next Steps

1. Set up environment variables
2. Run verification API: `/api/verify-supabase`
3. Test supplier pages
4. Adjust field mappings if needed
5. Verify data is being merged correctly

