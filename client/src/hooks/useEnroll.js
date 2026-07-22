import { useMutation, useQueryClient } from '@tanstack/react-query';
import { enrollInCourse } from '../api/courses.api';

export const useEnroll = (slug) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => enrollInCourse(slug),
    onSuccess: () => {
      queryClient.invalidateQueries(['course', slug]);
    },
  });
};
