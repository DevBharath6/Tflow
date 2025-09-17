import { useQuery } from '@tanstack/react-query';
import { client } from '../api/client';

function buildQuery(params) {
  const usp = new URLSearchParams();
  if (params.search) usp.set('search', params.search);
  if (params.stage) usp.set('stage', params.stage);
  usp.set('page', String(params.page || 1));
  usp.set('pageSize', String(params.pageSize || 1000));
  return `/candidates?${usp.toString()}`;
}

export function useCandidates(params) {
  return useQuery({
    queryKey: ['candidates', params],
    queryFn: async () => {
      const res = await client.get(buildQuery(params));
      // ensure all fields exist
      const augmented = (res.data || []).map(c => ({
        ...c,
        job: c.job || 'Unknown',
        experience: c.experience ?? 0,
        skills: c.skills?.length ? c.skills : ['N/A'],
        location: c.location || 'Unknown'
      }));
      return { ...res, data: augmented };
    },
    keepPreviousData: true
  });
}
