import client from './client';
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  Stats,
  GetReportsParams,
  GetReportsResponse,
  ProcessReportRequest,
  GetUsersParams,
  GetUsersResponse,
  GetReviewsParams,
  GetReviewsResponse,
  BlindReviewRequest,
  GetPlacesParams,
  GetPlacesResponse,
  UpdatePlaceRequest,
} from '../types/admin';

export async function login(email: string, password: string) {
  const { data } = await client.post<ApiResponse<LoginResponse>>(
    '/api/admin/login',
    { email, password } satisfies LoginRequest,
  );
  return data.data;
}

export async function getStats() {
  const { data } = await client.get<ApiResponse<Stats>>('/api/admin/stats');
  return data.data;
}

export async function getReports(params?: GetReportsParams) {
  const { data } = await client.get<ApiResponse<GetReportsResponse>>(
    '/api/admin/reports',
    { params },
  );
  return data.data;
}

export async function processReport(
  id: number,
  status: ProcessReportRequest['status'],
) {
  await client.patch(`/api/admin/reports/${id}`, { status });
}

export async function getUsers(params?: GetUsersParams) {
  const { data } = await client.get<ApiResponse<GetUsersResponse>>(
    '/api/admin/users',
    { params },
  );
  return data.data;
}

export async function getReviews(params?: GetReviewsParams) {
  const { data } = await client.get<ApiResponse<GetReviewsResponse>>(
    '/api/admin/reviews',
    { params },
  );
  return data.data;
}

export async function blindReview(
  id: number,
  status: BlindReviewRequest['status'],
) {
  await client.patch(`/api/admin/reviews/${id}`, { status });
}

export async function getPlaces(params?: GetPlacesParams) {
  const { data } = await client.get<ApiResponse<GetPlacesResponse>>(
    '/api/admin/places',
    { params },
  );
  return data.data;
}

export async function updatePlace(id: number, body: UpdatePlaceRequest) {
  await client.patch(`/api/admin/places/${id}`, body);
}
