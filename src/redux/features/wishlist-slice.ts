import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type InitialState = {
  items: WishListItem[];
};

export type WishListItem = {
  id: number | string;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  status?: string;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

const getInitialWishlist = (): WishListItem[] => {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("wishlist_items");
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error("Failed to parse wishlist items:", err);
      return [];
    }
  }
  return [];
};

const initialState: InitialState = {
  items: getInitialWishlist(),
};

const saveWishlistToLocalStorage = (items: WishListItem[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("wishlist_items", JSON.stringify(items));
  }
};

export const wishlist = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addItemToWishlist: (state, action: PayloadAction<WishListItem>) => {
      const { id, title, price, quantity, imgs, discountedPrice, status } =
        action.payload;
      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          id,
          title,
          price,
          quantity,
          imgs,
          discountedPrice,
          status,
        });
      }
      saveWishlistToLocalStorage(state.items);
    },
    removeItemFromWishlist: (state, action: PayloadAction<number | string>) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item.id !== itemId);
      saveWishlistToLocalStorage(state.items);
    },

    removeAllItemsFromWishlist: (state) => {
      state.items = [];
      saveWishlistToLocalStorage([]);
    },
  },
});

export const {
  addItemToWishlist,
  removeItemFromWishlist,
  removeAllItemsFromWishlist,
} = wishlist.actions;
export default wishlist.reducer;
