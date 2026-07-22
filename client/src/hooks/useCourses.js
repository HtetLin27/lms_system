import { useQuery } from '@tanstack/react-query';
import { getCourses } from '../api/courses.api';

export const useCourses = (filters) => {
  return useQuery({
    queryKey: ['courses', filters],
    queryFn: () => getCourses(filters),
    staleTime: 1000 * 60 * 5,
  });
};
