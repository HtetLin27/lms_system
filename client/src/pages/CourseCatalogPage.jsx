import { useCourses } from '../hooks/useCourses';
import CourseCard from '../components/courses/CourseCard';
import CourseCardSkeleton from '../components/courses/CourseCardSkeleton';

const CourseCatalogPage = () => {
  const { data, isLoading, isError } = useCourses();
  const courses = data?.data?.courses || [];

  if (isError)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-red-500">Failed to load courses. Please try again.</p>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">All Courses</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Show skeletons while loading */}
        {isLoading && Array.from({ length: 6 }, (_, i) => <CourseCardSkeleton key={i} />)}

        {/* Show real cards when loaded */}
        {!isLoading && courses.length === 0 && (
          <p className="text-gray-500 col-span-3">No courses available yet.</p>
        )}

        {!isLoading && courses.map((course) => <CourseCard key={course.id} course={course} />)}
      </div>
    </div>
  );
};

export default CourseCatalogPage;
