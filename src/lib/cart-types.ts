export type CartItem = {
  partId: string;
  name: string;
  pricePln: number;
  quantity: number;
  brandName: string;
  modelName: string;
  generationName: string;
  imageUrl: string | null;
};

export const CART_STORAGE_KEY = "flydes-cart-v1";
