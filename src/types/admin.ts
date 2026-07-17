export interface ApiResponse<T> {
  data: T;
}

export interface Admin {
  id: number;
  name: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  admin: Admin;
}

export interface Stats {
  total_users: number;
  today_reviews: number;
  pending_reports: number;
  active_places: number;
}

export interface Report {
  id: number;
  review_id: number;
  review_image_url: string | null;
  reason: string;
  detail: string;
  reporter_nickname: string;
  status: ReportStatus;
  created_at: string;
}

export type ReportStatus = 'PENDING' | 'RESOLVED' | 'REJECTED';

export interface GetReportsParams {
  status?: ReportStatus;
  cursor?: string;
  limit?: number;
}

export interface GetReportsResponse {
  reports: Report[];
  next_cursor: string | null;
}

export interface ProcessReportRequest {
  status: 'RESOLVED' | 'REJECTED';
}

// Users
export interface User {
  id: number;
  nickname: string;
  email: string;
  profile_image_url: string | null;
  review_count: number;
  created_at: string;
}

export interface GetUsersParams {
  cursor?: string;
  limit?: number;
}

export interface GetUsersResponse {
  users: User[];
  next_cursor: string | null;
}

// Reviews
export type ReviewStatus = 'ACTIVE' | 'ARCHIVED' | 'BLINDED';

export interface Review {
  id: number;
  place_name: string | null;
  image_url: string | null;
  congestion_level: string;
  comment: string;
  author_nickname: string;
  status: ReviewStatus;
  created_at: string;
}

export interface GetReviewsParams {
  status?: ReviewStatus;
  cursor?: string;
  limit?: number;
}

export interface GetReviewsResponse {
  reviews: Review[];
  next_cursor: string | null;
}

export interface BlindReviewRequest {
  status: 'BLINDED' | 'ACTIVE';
}

// Places
export interface Place {
  id: number;
  name: string;
  address: string;
  category: string | null;
  review_count: number;
  is_active: boolean;
  created_at: string;
}

export interface GetPlacesParams {
  keyword?: string;
  cursor?: string;
  limit?: number;
}

export interface GetPlacesResponse {
  places: Place[];
  next_cursor: string | null;
}

export interface UpdatePlaceRequest {
  is_active?: boolean;
  category?: string;
}
