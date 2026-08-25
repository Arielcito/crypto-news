'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  archiveAgencyClient,
  createAgencyClient,
  createClientProfile,
  deleteBrief,
  disconnectClientProfile,
  fetchAgencyClient,
  fetchAgencyClients,
  updateAgencyClient,
  updateClientProfile,
  uploadBrief,
} from '@/lib/api/agency';
import type {
  CreateClientInput,
  CreateClientProfileInput,
  UpdateClientInput,
  UpdateClientProfileInput,
} from '@/lib/types/agency';

const KEY = ['admin', 'agency', 'clients'] as const;

export function useAgencyClients() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => fetchAgencyClients(),
    select: (response) => response.data ?? [],
    retry: false,
  });
}

export function useAgencyClient(id: number | null) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => fetchAgencyClient(id as number),
    select: (response) => response.data,
    enabled: id !== null,
    retry: false,
  });
}

/** Todo lo que toca un cliente invalida el detalle y el listado a la vez. */
function useClientMutation<TInput, TResult>(fn: (input: TInput) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useCreateClient() {
  return useClientMutation((input: CreateClientInput) => createAgencyClient(input));
}

export function useUpdateClient() {
  return useClientMutation(({ id, input }: { id: number; input: UpdateClientInput }) =>
    updateAgencyClient(id, input)
  );
}

export function useArchiveClient() {
  return useClientMutation((id: number) => archiveAgencyClient(id));
}

export function useCreateClientProfile() {
  return useClientMutation(({ clientId, input }: { clientId: number; input: CreateClientProfileInput }) =>
    createClientProfile(clientId, input)
  );
}

export function useUpdateClientProfile() {
  return useClientMutation(({ id, input }: { id: number; input: UpdateClientProfileInput }) =>
    updateClientProfile(id, input)
  );
}

export function useDisconnectClientProfile() {
  return useClientMutation((id: number) => disconnectClientProfile(id));
}

export function useUploadBrief() {
  return useClientMutation(({ clientId, file }: { clientId: number; file: File }) =>
    uploadBrief(clientId, file)
  );
}

export function useDeleteBrief() {
  return useClientMutation((id: number) => deleteBrief(id));
}
