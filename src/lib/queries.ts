import { gql } from '@apollo/client';

// GraphQL Queries and Mutations

// Product Queries
export const GET_PRODUCTS = gql`
  query GetProducts($limit: Int, $category: String, $brand: String, $featured: Boolean, $search: String) {
    products(limit: $limit, category: $category, brand: $brand, featured: $featured, search: $search) {
      id
      name
      sku
      slug
      description
      isActive
      featured
      retailPrice
      brand {
        id
        name
        slug
      }
      category {
        id
        name
        slug
      }
      prices {
        id
        basePrice
        salePrice
        priceType
        minQuantity
        isActive
        effectivePrice
        currency
      }
      inventory {
        quantityInStock
        isInStock
        lowStockThreshold
      }
      images {
        id
        image
        altText
        isPrimary
        displayOrder
      }
      usecaseImages {
        id
        image
        altText
        displayOrder
      }
      variants {
        id
        sku
      }
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($id: Int!) {
    product(id: $id) {
      id
      name
      sku
      slug
      description
      shortDescription
      ingredients
      allergenInfo
      weight
      volume
      unitType
      retailPrice
      brand {
        id
        name
        countryOfOrigin
      }
      category {
        id
        name
        description
      }
      prices {
        id
        basePrice
        salePrice
        priceType
        minQuantity
        isActive
        effectivePrice
        currency
      }
      inventory {
        id
        quantityInStock
        lowStockThreshold
        warehouseLocation
        isInStock
      }
      images {
        id
        image
        altText
        isPrimary
        displayOrder
      }
      usecaseImages {
        id
        image
        altText
        displayOrder
      }
      variantOptions {
        id
        name
        displayOrder
        values {
          id
          value
          displayOrder
        }
      }
      variants {
        id
        sku
        price
        salePrice
        effectivePrice
        quantityInStock
        isInStock
        isActive
        isDefault
        optionValues {
          id
          value
          displayOrder
          option {
            id
            name
          }
        }
      }
    }
  }
`;

// Product Mutations
export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input) {
      success
      product {
        id
        name
        sku
        slug
        description
        shortDescription
        weight
        unitType
        isActive
        featured
        brand {
          id
          name
        }
        category {
          id
          name
        }
      }
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: Int!, $input: ProductInput!) {
    updateProduct(id: $id, input: $input) {
      success
      product {
        id
        name
        sku
        slug
        description
        shortDescription
        weight
        unitType
        isActive
        featured
        brand {
          id
          name
        }
        category {
          id
          name
        }
        inventory {
          id
          quantityInStock
          lowStockThreshold
          warehouseLocation
          isInStock
        }
        prices {
          id
          basePrice
          salePrice
          priceType
          minQuantity
          isActive
        }
      }
    }
  }
`;

export const CREATE_PRODUCT_INVENTORY = gql`
  mutation CreateProductInventory($productId: Int!, $quantityInStock: Int, $lowStockThreshold: Int, $warehouseLocation: String) {
    createProductInventory(
      productId: $productId
      quantityInStock: $quantityInStock
      lowStockThreshold: $lowStockThreshold
      warehouseLocation: $warehouseLocation
    ) {
      success
      inventory {
        id
        quantityInStock
        lowStockThreshold
        warehouseLocation
        isInStock
      }
    }
  }
`;

export const UPDATE_PRODUCT_INVENTORY = gql`
  mutation UpdateProductInventory($productId: Int!, $quantityInStock: Int, $lowStockThreshold: Int, $warehouseLocation: String) {
    updateProductInventory(
      productId: $productId
      quantityInStock: $quantityInStock
      lowStockThreshold: $lowStockThreshold
      warehouseLocation: $warehouseLocation
    ) {
      success
      inventory {
        id
        quantityInStock
        lowStockThreshold
        warehouseLocation
        isInStock
      }
    }
  }
`;

export const SET_PRODUCT_PRICE = gql`
  mutation SetProductPrice($input: SetProductPriceInput!) {
    setProductPrice(input: $input) {
      success
      message
      price {
        id
        basePrice
        salePrice
        effectivePrice
        priceType
        minQuantity
        isActive
        currency
      }
    }
  }
`;

export const UPDATE_PRODUCT_PRICE = gql`
  mutation UpdateProductPrice($priceId: Int!, $basePrice: String, $salePrice: String, $minQuantity: Int, $isActive: Boolean) {
    updateProductPrice(
      priceId: $priceId
      basePrice: $basePrice
      salePrice: $salePrice
      minQuantity: $minQuantity
      isActive: $isActive
    ) {
      success
      price {
        id
        basePrice
        salePrice
        priceType
        minQuantity
        isActive
      }
    }
  }
`;

// Variant Mutations
export const CREATE_VARIANT_OPTIONS = gql`
  mutation CreateVariantOptions($productId: Int!, $options: [VariantOptionInput!]!) {
    createVariantOptions(productId: $productId, options: $options) {
      success
      message
      variantOptions {
        id
        name
        displayOrder
        values {
          id
          value
          displayOrder
        }
      }
    }
  }
`;

export const CREATE_PRODUCT_VARIANT = gql`
  mutation CreateProductVariant($input: ProductVariantInput!) {
    createProductVariant(input: $input) {
      success
      message
      variant {
        id
        sku
        price
        salePrice
        effectivePrice
        quantityInStock
        isInStock
        isActive
        isDefault
        optionValues {
          id
          value
          displayOrder
          option {
            id
            name
          }
        }
      }
    }
  }
`;

export const UPDATE_PRODUCT_VARIANT = gql`
  mutation UpdateProductVariant(
    $variantId: Int!
    $price: String
    $salePrice: String
    $quantityInStock: Int
    $isActive: Boolean
    $isDefault: Boolean
  ) {
    updateProductVariant(
      variantId: $variantId
      price: $price
      salePrice: $salePrice
      quantityInStock: $quantityInStock
      isActive: $isActive
      isDefault: $isDefault
    ) {
      success
      message
      variant {
        id
        sku
        price
        salePrice
        effectivePrice
        quantityInStock
        isInStock
        isActive
        isDefault
        optionValues {
          id
          value
          option {
            id
            name
          }
        }
      }
    }
  }
`;

export const DELETE_PRODUCT_VARIANT = gql`
  mutation DeleteProductVariant($variantId: Int!) {
    deleteProductVariant(variantId: $variantId) {
      success
      message
    }
  }
`;

// Category Queries
export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      slug
      description
      image
      isActive
      displayOrder
    }
  }
`;

export const GET_CATEGORY = gql`
  query GetCategory($id: String!) {
    category(id: $id) {
      id
      name
      slug
      description
      image
    }
  }
`;

// Category Mutations
export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CategoryInput!) {
    createCategory(input: $input) {
      success
      category {
        id
        name
        slug
        description
        isActive
        displayOrder
      }
    }
  }
`;

// Brand Queries
export const GET_BRANDS = gql`
  query GetBrands {
    brands {
      id
      name
      slug
      description
      countryOfOrigin
      isActive
      displayOrder
    }
  }
`;

export const GET_BRAND = gql`
  query GetBrand($id: String, $slug: String) {
    brand(id: $id, slug: $slug) {
      id
      name
      slug
      description
      countryOfOrigin
      isActive
      displayOrder
    }
  }
`;

// Brand Mutations
export const CREATE_BRAND = gql`
  mutation CreateBrand($input: BrandInput!) {
    createBrand(input: $input) {
      success
      brand {
        id
        name
        slug
        description
        countryOfOrigin
        isActive
        displayOrder
      }
    }
  }
`;

// Cart Queries
export const GET_CART = gql`
  query GetCart($sessionKey: String!) {
    cart(sessionKey: $sessionKey) {
      id
      sessionKey
      createdAt
      updatedAt
      subtotal
      taxAmount
      total
      itemCount
      items {
        id
        quantity
        priceAtAddition
        subtotal
        productName
        displayName
        variantOptionsDisplay
        variant {
          id
          sku
        }
        product {
          id
          name
          sku
          images {
            image
            isPrimary
          }
        }
      }
    }
  }
`;

// Cart Mutations
export const ADD_TO_CART = gql`
  mutation AddToCart($sessionKey: String!, $productId: Int!, $variantId: Int, $quantity: Int!) {
    addToCart(
      sessionKey: $sessionKey
      productId: $productId
      variantId: $variantId
      quantity: $quantity
    ) {
      success
      message
      cartItem {
        id
        quantity
        priceAtAddition
        subtotal
        productName
        displayName
        variantOptionsDisplay
        product {
          id
          name
        }
        variant {
          id
          sku
        }
      }
      cart {
        id
        subtotal
        taxAmount
        total
        itemCount
        sessionKey
      }
    }
  }
`;

export const UPDATE_CART_ITEM = gql`
  mutation UpdateCartItem($cartItemId: Int!, $quantity: Int!) {
    updateCartItem(
      cartItemId: $cartItemId
      quantity: $quantity
    ) {
      success
      message
      cartItem {
        id
        quantity
        priceAtAddition
        subtotal
        productName
        displayName
        product {
          id
          name
        }
      }
      cart {
        id
        subtotal
        taxAmount
        total
        itemCount
        sessionKey
      }
    }
  }
`;

export const REMOVE_CART_ITEM = gql`
  mutation RemoveFromCart($cartItemId: Int!) {
    removeFromCart(cartItemId: $cartItemId) {
      success
      message
      cart {
        id
        subtotal
        taxAmount
        total
        itemCount
        sessionKey
      }
    }
  }
`;

export const CLEAR_CART = gql`
  mutation ClearCart($sessionKey: String!) {
    clearCart(sessionKey: $sessionKey) {
      success
      message
    }
  }
`;

// Order Mutations
export const CREATE_ORDER = gql`
  mutation CreateOrder(
    $sessionKey: String!
    $fullName: String!
    $phoneNumber: String!
    $addressLine: String!
    $emirate: String!
    $city: String!
    $paymentMethod: String
  ) {
    createOrder(
      sessionKey: $sessionKey
      fullName: $fullName
      phoneNumber: $phoneNumber
      addressLine: $addressLine
      emirate: $emirate
      city: $city
      paymentMethod: $paymentMethod
    ) {
      order {
        id
        orderNumber
        status
        totalAmount
        createdAt
      }
      success
      message
    }
  }
`;

// Retail Order Mutation (for Ziina payment)
export const CREATE_RETAIL_ORDER = gql`
  mutation CreateRetailOrder(
    $sessionKey: String!
    $customerInfo: CustomerInput!
    $shippingAddress: AddressInput!
  ) {
    createRetailOrder(
      sessionKey: $sessionKey
      customerInfo: $customerInfo
      shippingAddress: $shippingAddress
    ) {
      success
      message
      order {
        id
        orderNumber
        status
        subtotal
        taxAmount
        deliveryFee
        totalAmount
        items {
          productName
          quantity
          unitPrice
          totalPrice
          productSku
        }
      }
    }
  }
`;

// Order Queries (for admin panel)
export const GET_ORDERS = gql`
  query GetOrders($status: String, $orderType: String, $limit: Int) {
    orders(status: $status, orderType: $orderType, limit: $limit) {
      id
      orderNumber
      status
      customerName
      customerEmail
      totalAmount
      createdAt
      items {
        productName
        quantity
      }
    }
  }
`;

export const GET_ORDER = gql`
  query GetOrder($orderNumber: String!) {
    order(orderNumber: $orderNumber) {
      id
      orderNumber
      status
      orderType
      customerName
      customerEmail
      customerPhone
      customerCompany
      subtotal
      discountAmount
      taxAmount
      deliveryFee
      totalAmount
      currency
      notes
      internalNotes
      createdAt
      updatedAt
      confirmedAt
      deliveredAt
      cancelledAt
      items {
        id
        product {
          id
          name
          sku
        }
        variant {
          id
          sku
        }
        productName
        productSku
        variantOptions
        quantity
        unitPrice
        discountAmount
        taxAmount
        totalPrice
      }
      shippingAddress {
        id
        fullName
        phoneNumber
        email
        addressLine1
        addressLine2
        city
        emirate
        area
        postalCode
        country
        deliveryInstructions
      }
      statusHistory {
        id
        status
        notes
        createdAt
      }
    }
  }
`;

// Order Mutations (for admin panel)
export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($input: UpdateOrderStatusInput!) {
    updateOrderStatus(input: $input) {
      success
      message
      order {
        id
        orderNumber
        status
        statusHistory {
          status
          notes
          createdAt
        }
      }
    }
  }
`;

export const CANCEL_ORDER = gql`
  mutation CancelOrder($orderId: Int!, $reason: String) {
    cancelOrder(orderId: $orderId, reason: $reason) {
      success
      message
      order {
        id
        orderNumber
        status
        statusHistory {
          status
          notes
          createdAt
        }
      }
    }
  }
`;

export const UPDATE_SHIPPING_ADDRESS = gql`
  mutation UpdateShippingAddress(
    $orderId: Int!
    $fullName: String
    $phoneNumber: String
    $addressLine1: String
    $addressLine2: String
    $city: String
    $emirate: String
    $postalCode: String
  ) {
    updateShippingAddress(
      orderId: $orderId
      fullName: $fullName
      phoneNumber: $phoneNumber
      addressLine1: $addressLine1
      addressLine2: $addressLine2
      city: $city
      emirate: $emirate
      postalCode: $postalCode
    ) {
      success
      message
      order {
        orderNumber
        shippingAddress {
          fullName
          phoneNumber
          addressLine1
          addressLine2
          city
          emirate
          postalCode
        }
        statusHistory {
          notes
          createdAt
        }
      }
    }
  }
`;

// Payment Session Mutation
export const CREATE_PAYMENT_SESSION = gql`
  mutation CreatePaymentSession(
    $input: PaymentSessionInput!
    $gatewayName: String!
  ) {
    createPaymentSession(input: $input, gatewayName: $gatewayName) {
      success
      message
      paymentUrl
      paymentId
      expiresAt
      gatewayResponse
    }
  }
`;

// Payment Query
export const GET_PAYMENT = gql`
  query GetPayment($paymentId: String!) {
    payment(paymentId: $paymentId) {
      id
      paymentId
      status
      amount
      currency
      order {
        orderNumber
        status
        customerName
        totalAmount
      }
      gateway {
        name
      }
      createdAt
      capturedAt
      gatewayTransactionId
      gatewayResponse
    }
  }
`;

// Verify Payment Mutation
export const VERIFY_PAYMENT = gql`
  mutation VerifyPayment($input: PaymentVerificationInput!) {
    verifyPayment(input: $input) {
      success
      message
      status
      amount
      transactionId
      gatewayResponse
    }
  }
`;

// Authentication Mutations
export const TOKEN_AUTH = gql`
  mutation TokenAuth($username: String!, $password: String!) {
    tokenAuth(username: $username, password: $password) {
      token
      payload
      user {
        id
        username
        email
        isStaff
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      refreshToken
      user {
        id
        username
        email
      }
      success
      message
    }
  }
`;

export const REGISTER = gql`
  mutation Register($username: String!, $email: String!, $password: String!) {
    register(username: $username, email: $email, password: $password) {
      token
      refreshToken
      user {
        id
        username
        email
      }
      success
      message
    }
  }
`;

// Product Image Mutations
export const UPLOAD_PRODUCT_IMAGE = gql`
  mutation UploadProductImage($productId: Int!, $image: Upload!, $altText: String, $isPrimary: Boolean, $displayOrder: Int) {
    uploadProductImage(
      productId: $productId
      image: $image
      altText: $altText
      isPrimary: $isPrimary
      displayOrder: $displayOrder
    ) {
      success
      message
      image {
        id
        image
        altText
        isPrimary
        displayOrder
      }
    }
  }
`;

export const UPLOAD_PRODUCT_USECASE_IMAGE = gql`
  mutation UploadProductUseCaseImage($productId: Int!, $image: Upload!, $altText: String, $displayOrder: Int) {
    uploadProductUseCaseImage(
      productId: $productId
      image: $image
      altText: $altText
      displayOrder: $displayOrder
    ) {
      success
      message
      image {
        id
        image
        altText
        displayOrder
      }
    }
  }
`;

// Search Query
export const SEARCH_PRODUCTS = gql`
  query SearchProducts($query: String!, $limit: Int) {
    searchProducts(query: $query, limit: $limit) {
      id
      name
      sku
      slug
      retailPrice
      inStock
      brand {
        id
        name
        slug
      }
      category {
        id
        name
        slug
      }
      images {
        image
        altText
        isPrimary
        displayOrder
      }
      inventory {
        availableQuantity
        isInStock
      }
    }
  }
`;

