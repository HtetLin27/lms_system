import { useQuery } from '@tanstack/react-query';
import { getLesson } from '../api/courses.api';

export const useLesson = (slug, id) => {
  return useQuery({
    queryKey: ['lesson', slug, id],
    queryFn: () => getLesson(slug, id),
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!(slug && id),
  });
};
