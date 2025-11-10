import { useQuery, useMutation } from '@apollo/client';
import { GET_CART, ADD_TO_CART, UPDATE_CART_ITEM, REMOVE_CART_ITEM, CLEAR_CART } from '../lib/queries';
import { CartResponse } from '../types';
import { getSessionKey } from '../lib/graphqlClient';

export const useCart = () => {
  const sessionKey = getSessionKey();

  const { data, loading, error, refetch } = useQuery<CartResponse>(GET_CART, {
    variables: { sessionKey },
    errorPolicy: 'all',
  });

  const cart = data?.cart || null;
  const cartItems = cart?.items || [];

  return {
    cart,
    cartItems,
    loading,
    error: error ? (error.message || 'Failed to fetch cart') : null,
    refetch,
  };
};

export const useAddToCart = () => {
  const sessionKey = getSessionKey();

  const [addToCartMutation, { loading, error }] = useMutation(ADD_TO_CART, {
    refetchQueries: [{ query: GET_CART, variables: { sessionKey } }],
  });

  const addToCart = async (productId: string | number, variantId?: string | number | null, quantity: number = 1) => {
    try {
      const result = await addToCartMutation({
        variables: {
          sessionKey,
          productId: typeof productId === 'string' ? parseInt(productId, 10) : productId,
          variantId: variantId ? (typeof variantId === 'string' ? parseInt(variantId, 10) : variantId) : null,
          quantity: Math.floor(quantity), // Ensure quantity is an integer
        },
      });
      return result.data?.addToCart;
    } catch (err) {
      console.error('Error adding to cart:', err);
      throw err;
    }
  };

  return {
    addToCart,
    loading,
    error: error ? (error.message || 'Failed to add to cart') : null,
  };
};

export const useUpdateCartItem = () => {
  const sessionKey = getSessionKey();

  const [updateCartItemMutation, { loading, error }] = useMutation(UPDATE_CART_ITEM, {
    refetchQueries: [{ query: GET_CART, variables: { sessionKey } }],
  });

  const updateCartItem = async (cartItemId: string | number, quantity: number) => {
    try {
      const result = await updateCartItemMutation({
        variables: {
          cartItemId: typeof cartItemId === 'string' ? parseInt(cartItemId, 10) : cartItemId,
          quantity: Math.floor(quantity), // Ensure quantity is an integer
        },
      });
      return result.data?.updateCartItem;
    } catch (err) {
      console.error('Error updating cart item:', err);
      throw err;
    }
  };

  return {
    updateCartItem,
    loading,
    error: error ? (error.message || 'Failed to update cart item') : null,
  };
};

export const useRemoveCartItem = () => {
  const sessionKey = getSessionKey();

  const [removeCartItemMutation, { loading, error }] = useMutation(REMOVE_CART_ITEM, {
    refetchQueries: [{ query: GET_CART, variables: { sessionKey } }],
  });

  const removeCartItem = async (cartItemId: string | number) => {
    try {
      const result = await removeCartItemMutation({
        variables: {
          cartItemId: typeof cartItemId === 'string' ? parseInt(cartItemId, 10) : cartItemId,
        },
      });
      return result.data?.removeFromCart;
    } catch (err) {
      console.error('Error removing cart item:', err);
      throw err;
    }
  };

  return {
    removeCartItem,
    loading,
    error: error ? (error.message || 'Failed to remove cart item') : null,
  };
};

export const useClearCart = () => {
  const sessionKey = getSessionKey();

  const [clearCartMutation, { loading, error }] = useMutation(CLEAR_CART, {
    refetchQueries: [{ query: GET_CART, variables: { sessionKey } }],
  });

  const clearCart = async () => {
    try {
      const result = await clearCartMutation({
        variables: {
          sessionKey,
        },
      });
      return result.data?.clearCart;
    } catch (err) {
      console.error('Error clearing cart:', err);
      throw err;
    }
  };

  return {
    clearCart,
    loading,
    error: error ? (error.message || 'Failed to clear cart') : null,
  };
};

