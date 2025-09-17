import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { client } from '../api/client'

export function useAssessment(jobId) {
  return useQuery({
    queryKey: ['assessment', jobId],
    queryFn: () => client.get(`/assessments/${jobId}`),
    enabled: !!jobId,
  })
}

export function useSaveAssessment(jobId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => client.put(`/assessments/${jobId}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assessment', jobId] })
    }
  })
}

export function useSubmitAssessment(jobId) {
  return useMutation({
    mutationFn: (payload) => client.post(`/assessments/${jobId}/submit`, payload)
  })
}


