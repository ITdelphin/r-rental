import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { propertyApi } from '@/lib/api'
import type { Property } from '@/types'

export function useProperties(filters?: Record<string, string | number | boolean>) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => propertyApi.list(filters),
  })
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyApi.get(id),
    enabled: !!id,
  })
}

export function useCreateProperty() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Property>) => propertyApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['properties'] }),
  })
}

export function useUpdateProperty() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Property> }) => propertyApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['properties'] }),
  })
}

export function useDeleteProperty() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => propertyApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['properties'] }),
  })
}
