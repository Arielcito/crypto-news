import { adminFetch, adminUpload } from '@/lib/api/admin-client';
import type { ApiResponse } from '@/lib/types/admin';
import type {
  AgencyBrief,
  AgencyClient,
  AgencyClientDetail,
  AgencyClientProfile,
  AgencyPackage,
  AgencyReport,
  AgencyReportSummary,
  AgencyTask,
  AgencyUser,
  AgencyUserOption,
  CreateClientInput,
  CreateClientProfileInput,
  CreatePackageInput,
  CreateTaskInput,
  CreateUserInput,
  CreatedUser,
  OrganicMetrics,
  UpdateClientInput,
  UpdateClientProfileInput,
  UpdatePackageInput,
  UpdateTaskInput,
  UpdateUserInput,
} from '@/lib/types/agency';

const BASE = '/api/admin/agencia';

// ── Usuarios ────────────────────────────────────────────────────────────────

export function fetchAgencyUsers(): Promise<ApiResponse<AgencyUser[]>> {
  return adminFetch(`${BASE}/users`);
}

export function fetchAgencyUserOptions(): Promise<ApiResponse<AgencyUserOption[]>> {
  return adminFetch(`${BASE}/users/options`);
}

export function createAgencyUser(input: CreateUserInput): Promise<ApiResponse<CreatedUser>> {
  return adminFetch(`${BASE}/users`, { method: 'POST', body: JSON.stringify(input) });
}

export function updateAgencyUser(
  id: number,
  input: UpdateUserInput
): Promise<ApiResponse<AgencyUser>> {
  return adminFetch(`${BASE}/users/${id}`, { method: 'PUT', body: JSON.stringify(input) });
}

export function resetAgencyUserPassword(
  id: number
): Promise<ApiResponse<{ temporaryPassword: string }>> {
  return adminFetch(`${BASE}/users/${id}/password`, { method: 'POST' });
}

// ── Clientes ────────────────────────────────────────────────────────────────

export function fetchAgencyClients(): Promise<ApiResponse<AgencyClient[]>> {
  return adminFetch(`${BASE}/clients`);
}

export function fetchAgencyClient(id: number): Promise<ApiResponse<AgencyClientDetail>> {
  return adminFetch(`${BASE}/clients/${id}`);
}

export function createAgencyClient(input: CreateClientInput): Promise<ApiResponse<AgencyClient>> {
  return adminFetch(`${BASE}/clients`, { method: 'POST', body: JSON.stringify(input) });
}

export function updateAgencyClient(
  id: number,
  input: UpdateClientInput
): Promise<ApiResponse<AgencyClient>> {
  return adminFetch(`${BASE}/clients/${id}`, { method: 'PUT', body: JSON.stringify(input) });
}

export function archiveAgencyClient(id: number): Promise<ApiResponse<null>> {
  return adminFetch(`${BASE}/clients/${id}`, { method: 'DELETE' });
}

export function createClientProfile(
  clientId: number,
  input: CreateClientProfileInput
): Promise<ApiResponse<AgencyClientProfile>> {
  return adminFetch(`${BASE}/clients/${clientId}/profiles`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateClientProfile(
  id: number,
  input: UpdateClientProfileInput
): Promise<ApiResponse<AgencyClientProfile>> {
  return adminFetch(`${BASE}/profiles/${id}`, { method: 'PUT', body: JSON.stringify(input) });
}

export function disconnectClientProfile(id: number): Promise<ApiResponse<null>> {
  return adminFetch(`${BASE}/profiles/${id}`, { method: 'DELETE' });
}

// ── Paquetes ────────────────────────────────────────────────────────────────

export function fetchAgencyPackages(clientId?: number): Promise<ApiResponse<AgencyPackage[]>> {
  const query = clientId ? `?clientId=${clientId}` : '';
  return adminFetch(`${BASE}/packages${query}`);
}

export function createAgencyPackage(
  input: CreatePackageInput
): Promise<ApiResponse<AgencyPackage>> {
  return adminFetch(`${BASE}/packages`, { method: 'POST', body: JSON.stringify(input) });
}

export function updateAgencyPackage(
  id: number,
  input: UpdatePackageInput
): Promise<ApiResponse<AgencyPackage>> {
  return adminFetch(`${BASE}/packages/${id}`, { method: 'PUT', body: JSON.stringify(input) });
}

export function deleteAgencyPackage(id: number): Promise<ApiResponse<null>> {
  return adminFetch(`${BASE}/packages/${id}`, { method: 'DELETE' });
}

// ── Tareas ──────────────────────────────────────────────────────────────────

export interface TaskListFilters {
  clientId?: number;
  assigneeId?: number;
  packageId?: number;
  status?: 'PENDING' | 'DONE';
  network?: string;
  page?: number;
  perPage?: number;
}

export interface TaskListResponse {
  tasks: AgencyTask[];
  total: number;
  page: number;
  perPage: number;
}

export function fetchAgencyTasks(
  filters: TaskListFilters = {}
): Promise<ApiResponse<TaskListResponse>> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') params.set(key, String(value));
  }
  const query = params.toString();
  return adminFetch(`${BASE}/tasks${query ? `?${query}` : ''}`);
}

export function createAgencyTask(input: CreateTaskInput): Promise<ApiResponse<AgencyTask>> {
  return adminFetch(`${BASE}/tasks`, { method: 'POST', body: JSON.stringify(input) });
}

export function updateAgencyTask(
  id: number,
  input: UpdateTaskInput
): Promise<ApiResponse<AgencyTask>> {
  return adminFetch(`${BASE}/tasks/${id}`, { method: 'PUT', body: JSON.stringify(input) });
}

export function setTaskStatus(
  id: number,
  status: 'PENDING' | 'DONE',
  permalink?: string | null
): Promise<ApiResponse<AgencyTask>> {
  return adminFetch(`${BASE}/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, ...(permalink !== undefined ? { permalink } : {}) }),
  });
}

export function deleteAgencyTask(id: number): Promise<ApiResponse<null>> {
  return adminFetch(`${BASE}/tasks/${id}`, { method: 'DELETE' });
}

// ── Briefs ──────────────────────────────────────────────────────────────────

export function uploadBrief(clientId: number, file: File): Promise<ApiResponse<AgencyBrief>> {
  const formData = new FormData();
  formData.append('clientId', String(clientId));
  formData.append('file', file);
  return adminUpload(`${BASE}/briefs`, formData);
}

export function deleteBrief(id: number): Promise<ApiResponse<null>> {
  return adminFetch(`${BASE}/briefs/${id}`, { method: 'DELETE' });
}

/** La descarga pasa por el proxy con sesión: nunca se linkea el Blob directo. */
export function briefDownloadUrl(id: number): string {
  return `${BASE}/briefs/${id}/download`;
}

// ── Métricas ────────────────────────────────────────────────────────────────

export function fetchOrganicMetrics(
  days: number,
  clientId?: number
): Promise<ApiResponse<OrganicMetrics>> {
  const params = new URLSearchParams({ days: String(days) });
  if (clientId) params.set('clientId', String(clientId));
  return adminFetch(`${BASE}/metrics?${params.toString()}`);
}

export function syncSocialNow(): Promise<
  ApiResponse<{ posts: number; postReadings: number; accountReadings: number; truncated: boolean }>
> {
  return adminFetch(`${BASE}/sync`, { method: 'POST' });
}

// ── Reportes ────────────────────────────────────────────────────────────────

export function fetchAgencyReports(
  clientId?: number
): Promise<ApiResponse<AgencyReportSummary[]>> {
  const query = clientId ? `?clientId=${clientId}` : '';
  return adminFetch(`${BASE}/reports${query}`);
}

export function fetchAgencyReport(id: number): Promise<ApiResponse<AgencyReport>> {
  return adminFetch(`${BASE}/reports/${id}`);
}

export function generateAgencyReport(
  packageId: number
): Promise<ApiResponse<AgencyReportSummary>> {
  return adminFetch(`${BASE}/reports`, { method: 'POST', body: JSON.stringify({ packageId }) });
}

export function deleteAgencyReport(id: number): Promise<ApiResponse<null>> {
  return adminFetch(`${BASE}/reports/${id}`, { method: 'DELETE' });
}
