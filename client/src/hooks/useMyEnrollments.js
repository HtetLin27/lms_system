import { useQuery } from '@tanstack/react-query';
import { getMyEnrollments } from '../api/courses.api';

export const useMyEnrollments = () =>
  useQuery({
    queryKey: ['enrollments', 'my'],
    queryFn: () => getMyEnrollments(),
    staleTime: 0, // always fresh — progress changes often
  });
