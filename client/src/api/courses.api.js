import api from './axios';

export const getCourses = (filters) => api.get('/courses', { params: filters });

export const getCourse = (slug) => api.get(`/courses/${slug}`);

export const getMyCourses = () => api.get('/courses/my');

export const enrollInCourse = (slug) => api.post(`/courses/${slug}/enroll`);
