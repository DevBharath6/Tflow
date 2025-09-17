import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { client } from '../api/client'

function buildQuery(params) {
  const usp = new URLSearchParams()
  if (params.search) usp.set('search', params.search)
  if (params.status) usp.set('status', params.status)
  usp.set('page', String(params.page || 1))
  usp.set('pageSize', String(params.pageSize || 10))
  usp.set('sort', params.sort || 'order')
  return `/jobs?${usp.toString()}`
}

export function useJobsList(params) {
  const key = ['jobs', params]
  return useQuery({
    queryKey: key,
    queryFn: () => client.get(buildQuery(params)),
    keepPreviousData: true,
  })
}

export function useCreateJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body) => client.post('/jobs', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] })
    }
  })
}

export function useUpdateJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => client.patch(`/jobs/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] })
    }
  })
}

export function useReorderJobs(params) {
  const qc = useQueryClient()
  const key = ['jobs', params]
  return useMutation({
    mutationFn: ({ id, fromOrder, toOrder }) => client.patch(`/jobs/${id}/reorder`, { fromOrder, toOrder }),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData(key)
      // optimistic update for current page only
      qc.setQueryData(key, (old) => {
        if (!old) return old
        const data = [...old.data]
        const fromIdx = typeof vars.fromIndex === 'number' ? vars.fromIndex : data.findIndex(j => j.id === vars.id)
        const toIdx = typeof vars.toIndex === 'number' ? vars.toIndex : fromIdx
        if (fromIdx === -1) return old
        const [moved] = data.splice(fromIdx, 1)
        data.splice(toIdx, 0, moved)
        return { ...old, data }
      })
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] })
    }
  })
}


