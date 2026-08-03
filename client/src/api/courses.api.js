import api from './axios';

export const getCourses = (filters) => api.get('/courses', { params: filters });

export const getCourse = (slug) => api.get(`/courses/${slug}`);

export const getMyCourses = () => api.get('/courses/my');

export const enrollInCourse = (slug) => api.post(`/courses/${slug}/enroll`);

export const getLesson = (slug, id) => api.get(`/courses/${slug}/lessons/${id}`);

export const markLessonComplete = (lessonId) => api.post(`/progress/lessons/${lessonId}/complete`);

export const getMyEnrollments = () => api.get('/enrollments/my');
