# Debugging GraphQL 400 Error

## Test the Query Directly

Open your browser console and check the Network tab to see the actual error response.

Or test with curl:

```bash
curl -X POST http://164.90.215.173/graphql/ \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query($limit: Int) { products(limit: $limit) { id name sku prices { basePrice } } }",
    "variables": {"limit": 20}
  }'
```

## Common Issues

1. **Check browser console** - The actual error message will show which field is causing the problem
2. **Network tab** - Look at the actual request/response to see what GraphQL is complaining about
3. **Field may not exist** - Some fields might be optional or have different names

## Next Steps

1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "graphql" or "fetch"
4. Look at the failed request
5. Check the Response tab for the actual error message

The error should tell you exactly which field is invalid.

