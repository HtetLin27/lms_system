// client/src/hooks/useCourse.js
import { useQuery } from '@tanstack/react-query';
import { getCourse } from '../api/courses.api';

export const useCourse = (slug) =>
  useQuery({
    queryKey: ['course', slug],
    queryFn: () => getCourse(slug),
    staleTime: 1000 * 60 * 5,
    enabled: !!slug, // ← only fetch if slug exists
  });
