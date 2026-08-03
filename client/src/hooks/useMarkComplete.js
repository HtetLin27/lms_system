import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markLessonComplete } from '../api/courses.api';

export const useMarkComplete = (slug, lessonId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markLessonComplete(lessonId),
    onSuccess: () => {
      // Invalidate lesson cache — updates isCompleted flag
      queryClient.invalidateQueries({
        queryKey: ['lesson', slug, lessonId],
      });
      // Invalidate course cache — updates progress percent
      queryClient.invalidateQueries({
        queryKey: ['course', slug],
      });
    },
  });
};
