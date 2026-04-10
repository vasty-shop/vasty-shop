export interface User {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio?: string;
}

export interface UserStats {
  outfits: number;
  outfitsWithEvents: number;
  savedOutfits: number;
}
