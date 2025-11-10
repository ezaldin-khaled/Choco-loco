# Frontend Integration Guide

## 🚀 API Information

### Base URL
```
Production: http://164.90.215.173/graphql/
```

### API Type
**GraphQL API** - Single endpoint for all queries and mutations

### Interactive API Explorer
Visit: `http://164.90.215.173/graphql/` in your browser to use GraphiQL interface

---

## 🔐 Authentication

### Method
**JWT Bearer Token** (JSON Web Token)

### How to Get Token
1. Send a GraphQL mutation to authenticate
2. Receive JWT token in response
3. Include token in Authorization header for protected requests

### Header Format
```
Authorization: Bearer <your-token-here>
```

**Important:** The backend expects the `Bearer` prefix, not `JWT`.

### Token Expiration
- JWT tokens expire after **7 days**
- Refresh token expires after **30 days**

---

## 📝 Available Data

### **Products**
- List all products
- Get single product by ID
- Search products by name/description
- Filter by category, brand, featured status
- Product details: name, description, images, prices, inventory, variants

### **Categories**
- List all categories
- Get category details

### **Brands**
- List all brands
- Get brand details

### **Cart Operations**
- Add item to cart
- Update cart item quantity
- Remove item from cart
- Get cart contents
- Clear cart
- Cart uses session keys (no login required)

### **Orders**
- Create order (checkout)
- Get order details
- List user orders (requires authentication)
- Update order status (admin only)

### **User Management**
- Login/Register
- Get current user info
- Update user profile

---

## 📦 Media Files

### Image URLs
Product images are served at:
```
http://164.90.215.173/media/<image-path>
```

Example:
```
http://164.90.215.173/media/products/chocolate-bar.jpg
```

### Image Types
- **Primary images**: Main product images
- **Use case images**: Additional product images (up to 4 per product)

---

## 🔧 Configuration for Frontend

### CORS Settings
The backend allows requests from:
- `http://localhost:3000`
- `http://localhost:3001`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:3001`

**To add your production frontend domain**, contact backend team to add it to `CORS_ALLOWED_ORIGINS` in settings.

### Request Format
- **Content-Type**: `application/json`
- **Method**: POST
- **Body**: JSON with `query` or `mutation` field

---

## 📋 Important Data Types

### Product Unit Types
- `KG` - Kilogram
- `GRAM` - Gram
- `LITER` - Liter
- `BOTTLE` - Bottle
- `PIECE` - Piece
- `BOX` - Box
- `PACK` - Pack

### Price Types
- `RETAIL` - Retail price

### Order Status
- `PENDING` - Order placed
- `CONFIRMED` - Order confirmed
- `PROCESSING` - Being prepared
- `SHIPPED` - Out for delivery
- `DELIVERED` - Delivered
- `CANCELLED` - Cancelled

### Emirates (UAE)
- `DUBAI`
- `ABU_DHABI`
- `SHARJAH`
- `AJMAN`
- `UMM_AL_QUWAIN`
- `RAS_AL_KHAIMAH`
- `FUJAIRAH`

---

## 📄 Documentation Files

### Postman Collection
**File**: `POSTMAN_COLLECTION.json`

**How to use**:
1. Import into Postman
2. Set base URL: `http://164.90.215.173/graphql/`
3. Use "Login - Get JWT Token" to authenticate
4. Token will be saved automatically for other requests

### Complete API Reference
**File**: `ADMIN_API_GUIDE.md`

Contains detailed examples of all available queries and mutations.

---

## 🧪 Testing

### Interactive Testing
1. Go to: `http://164.90.215.173/graphql/`
2. Use GraphiQL interface to test queries
3. View schema documentation on the right side
4. Test mutations with real data

### Sample Test Credentials
Contact backend team for test user credentials.

---

## ⚠️ Important Notes

1. **Cart Sessions**: Cart uses session keys. Generate a unique session key (UUID) for anonymous users and store it in localStorage/cookies.

2. **Authentication**: 
   - Public queries (products, categories, brands) don't require authentication
   - Cart operations don't require authentication (use session key)
   - Order creation doesn't require authentication (but can include user info)
   - Admin operations require staff authentication

3. **Image Handling**: 
   - Product images return relative paths (e.g., `/media/products/image.jpg`)
   - Prepend base URL: `http://164.90.215.173` + image path

4. **Error Handling**: 
   - API returns errors in standard GraphQL format
   - Check `errors` array in response
   - All successful responses include `data` field

5. **Decimal Values**: 
   - Prices are returned as strings (e.g., `"45.99"`)
   - Send prices as strings in mutations (e.g., `"45.99"` not `45.99`)

---

## 📞 Support

### Questions?
- Check `POSTMAN_COLLECTION.json` for working examples
- Use GraphiQL interface at `/graphql/` to explore schema
- Refer to `ADMIN_API_GUIDE.md` for detailed API documentation

### Need to Update CORS?
Contact backend team with your production frontend URL to add to allowed origins.

---

## 🔄 API Updates

When backend is updated:
1. Pull latest changes from repository
2. Check this document for any changes
3. Test in GraphiQL interface first
4. Update frontend implementation

