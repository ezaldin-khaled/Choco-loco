// Type definitions for API responses

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description?: string;
  shortDescription?: string;
  ingredients?: string;
  allergenInfo?: string;
  weight?: number;
  volume?: number;
  unitType?: string;
  isActive?: boolean;
  featured?: boolean;
  images?: Array<{
    id: string;
    image: string;
    altText?: string;
    isPrimary?: boolean;
    displayOrder?: number;
  }>;
  usecaseImages?: Array<{
    id: string;
    image: string;
    altText?: string;
    displayOrder?: number;
  }>;
  category?: {
    id: string;
    name: string;
    slug?: string;
    description?: string;
  };
  brand?: {
    id: string;
    name: string;
    slug?: string;
    description?: string;
    countryOfOrigin?: string;
  };
  prices?: Array<{
    id?: string;
    basePrice?: string;
    salePrice?: string;
    priceType: string;
    minQuantity?: number;
    isActive?: boolean;
  }>;
  inventory?: {
    id?: string;
    quantityInStock?: number;
    isInStock?: boolean;
    lowStockThreshold?: number;
    warehouseLocation?: string;
  };
  variants?: Array<{
    id: string;
    sku: string;
    price?: string;
    salePrice?: string;
    effectivePrice?: string;
    quantityInStock?: number;
    isInStock?: boolean;
    isActive?: boolean;
    isDefault?: boolean;
    optionValues?: Array<{
      id: string;
      value: string;
      displayOrder?: number;
      option: {
        id: string;
        name: string;
      };
    }>;
  }>;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  countryOfOrigin?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface CartItem {
  id: string;
  quantity: number;
  priceAtAddition?: string;
  subtotal?: string;
  productName?: string;
  displayName?: string;
  variantOptionsDisplay?: string;
  product: {
    id: string;
    name: string;
    sku?: string;
    images?: Array<{
      image: string;
      isPrimary?: boolean;
    }>;
  };
  variant?: {
    id: string;
    sku?: string;
  };
}

export interface Cart {
  id: string;
  sessionKey?: string;
  createdAt?: string;
  updatedAt?: string;
  subtotal?: string;
  taxAmount?: string;
  total?: string;
  itemCount: number;
  items?: CartItem[];
}

export interface ProductsResponse {
  products: Product[];
}

export interface ProductResponse {
  product: Product;
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface CategoryResponse {
  category: Category;
}

export interface BrandsResponse {
  brands: Brand[];
}

export interface BrandResponse {
  brand: Brand;
}

export interface CartResponse {
  cart: Cart;
}

