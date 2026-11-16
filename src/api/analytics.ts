import client from './client';
import type { ApiResponse } from '../types/admin';
import type {
  ParticipationAnalytics,
  FreshnessAnalytics,
  TrustAnalytics,
  CoverageAnalytics,
  PatternsAnalytics,
} from '../types/analytics';

export async function getParticipationAnalytics() {
  const { data } = await client.get<ApiResponse<ParticipationAnalytics>>(
    '/api/admin/analytics/participation',
  );
  return data.data;
}

export async function getFreshnessAnalytics() {
  const { data } = await client.get<ApiResponse<FreshnessAnalytics>>(
    '/api/admin/analytics/freshness',
  );
  return data.data;
}

export async function getTrustAnalytics() {
  const { data } = await client.get<ApiResponse<TrustAnalytics>>(
    '/api/admin/analytics/trust',
  );
  return data.data;
}

export async function getCoverageAnalytics() {
  const { data } = await client.get<ApiResponse<CoverageAnalytics>>(
    '/api/admin/analytics/coverage',
  );
  return data.data;
}

export async function getPatternsAnalytics() {
  const { data } = await client.get<ApiResponse<PatternsAnalytics>>(
    '/api/admin/analytics/patterns',
  );
  return data.data;
}
