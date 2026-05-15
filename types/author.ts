export interface Author {
  id: number;
  name: string;
  slug: string;
  bio: string | null;
  avatar: string | null;
  email: string | null;
  twitter: string | null;
  linkedin: string | null;
  website: string | null;
  credentials: string | null;
  jobTitle: string | null;
  domain: string;
  isActive: boolean;
}
