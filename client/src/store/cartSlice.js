import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/cart');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const addToCart = createAsyncThunk('cart/addToCart', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post('/cart', payload);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const updateCartQty = createAsyncThunk(
  'cart/updateCartQty',
  async ({ itemId, qty }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/cart/${itemId}`, { qty });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const removeCartItem = createAsyncThunk(
  'cart/removeCartItem',
  async (itemId, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/cart/${itemId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const clearCart = createAsyncThunk('cart/clearCart', async (_, { rejectWithValue }) => {
  try {
    const res = await api.delete('/cart');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const initialState = {
  items: [],
  totals: {
    subtotal: 0,
    totalMrp: 0,
    discount: 0,
    delivery: 0,
    total: 0,
  },
  isLoading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCart: (state) => {
      state.items = [];
      state.totals = { subtotal: 0, totalMrp: 0, discount: 0, delivery: 0, total: 0 };
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items || [];
        state.totals = action.payload.totals || {
          subtotal: 0,
          totalMrp: 0,
          discount: 0,
          delivery: 0,
          total: 0,
        };
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // addToCart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items || [];
        state.totals = action.payload.totals || state.totals;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // updateCartQty
      .addCase(updateCartQty.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
        state.totals = action.payload.totals || state.totals;
      })
      // removeCartItem
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
        state.totals = action.payload.totals || state.totals;
      })
      // clearCart
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.totals = { subtotal: 0, totalMrp: 0, discount: 0, delivery: 0, total: 0 };
      });
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;
