import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLesson } from '../hooks/useLesson';
import { useCourse } from '../hooks/useCourse';
import { useMarkComplete } from '../hooks/useMarkComplete';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// ── Content type icons ────────────────────────────────────────────────────────
const CONTENT_ICONS = {
  video: '🎬',
  pdf: '📄',
  text: '📝',
};

// ── Skeleton loader ───────────────────────────────────────────────────────────
const LessonSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="w-full aspect-video rounded-lg" />
    <Skeleton className="h-6 w-1/2" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const LessonPlayerPage = () => {
  const { slug, id } = useParams();
  const navigate = useNavigate();

  // Fetch the current lesson
  const { data: lessonData, isLoading: lessonLoading, isError: lessonError } = useLesson(slug, id);

  // Fetch the full course — for lesson list sidebar
  const { data: courseData, isLoading: courseLoading } = useCourse(slug);

  const lesson = lessonData?.data?.lesson;
  const course = courseData?.data?.course;
  const lessons = course?.lessons || [];

  // Mark complete mutation — we will build this hook next
  const { mutate: markComplete, isPending: isMarking } = useMarkComplete(slug, id);

  // ── Find prev and next lessons ────────────────────────────────────────────
  const currentIndex = lessons.findIndex((l) => l.id === id);
  const prevLesson = lessons[currentIndex - 1] || null;
  const nextLesson = lessons[currentIndex + 1] || null;

  // ── Render content based on type ──────────────────────────────────────────
  const renderContent = () => {
    if (!lesson) return null;

    switch (lesson.content_type) {
      case 'video':
        return lesson.video_url ? (
          <video
            key={lesson.id}
            src={lesson.video_url}
            controls
            controlsList="nodownload"
            className="w-full rounded-lg aspect-video bg-black"
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="flex justify-center items-center h-48 bg-gray-100 rounded-lg">
            <p className="text-gray-500">Video is not available.</p>
          </div>
        );

      case 'pdf':
        return lesson.pdf_url ? (
          <iframe
            src={lesson.pdf_url}
            title={lesson.title}
            className="w-full rounded-lg border"
            style={{ height: '600px' }}
          />
        ) : (
          <div className="flex justify-center items-center h-48 bg-gray-100 rounded-lg">
            <p className="text-gray-500">PDF is not available.</p>
          </div>
        );

      case 'text':
        return (
          <div
            className="prose max-w-none bg-white rounded-lg
                        border p-6 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: lesson.content }}
          />
        );

      default:
        return (
          <div
            className="flex justify-center items-center
                          h-48 bg-gray-100 rounded-lg"
          >
            <p className="text-gray-500">Unknown content type: {lesson.content_type}</p>
          </div>
        );
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (lessonLoading)
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <LessonSkeleton />
      </div>
    );

  // ── Error ─────────────────────────────────────────────────────────────────
  if (lessonError || !lesson)
    return (
      <div
        className="flex flex-col items-center justify-center
                    min-h-[60vh] gap-4"
      >
        <p className="text-red-500">Lesson not found or you do not have access.</p>
        <Link to={`/courses/${slug}`}>
          <Button variant="outline">Back to Course</Button>
        </Link>
      </div>
    );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left — lesson content ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/courses" className="hover:text-gray-700">
              Courses
            </Link>
            <span>→</span>
            <Link to={`/courses/${slug}`} className="hover:text-gray-700">
              {course?.title || slug}
            </Link>
            <span>→</span>
            <span className="text-gray-700 font-medium">{lesson.title}</span>
          </div>

          {/* Lesson title */}
          <div className="flex items-start gap-3">
            <span className="text-2xl">{CONTENT_ICONS[lesson.content_type]}</span>
            <h1 className="text-2xl font-bold leading-snug">{lesson.title}</h1>
          </div>

          {/* Content player */}
          {renderContent()}

          {/* Lesson description */}
          {lesson.description && (
            <div
              className="bg-gray-50 rounded-lg p-4 text-sm
                            text-gray-600 leading-relaxed"
            >
              {lesson.description}
            </div>
          )}

          {/* Navigation + Mark complete */}
          <div
            className="flex items-center justify-between
                          pt-4 border-t gap-3"
          >
            {/* Previous lesson */}
            <Button
              variant="outline"
              disabled={!prevLesson}
              onClick={() => prevLesson && navigate(`/courses/${slug}/lessons/${prevLesson.id}`)}
            >
              ← Previous
            </Button>

            {/* Mark complete */}
            <Button
              onClick={() => markComplete()}
              disabled={isMarking || lesson.isCompleted}
              variant={lesson.isCompleted ? 'outline' : 'default'}
            >
              {lesson.isCompleted ? '✅ Completed' : isMarking ? 'Saving...' : 'Mark Complete'}
            </Button>

            {/* Next lesson */}
            <Button
              disabled={!nextLesson}
              onClick={() => nextLesson && navigate(`/courses/${slug}/lessons/${nextLesson.id}`)}
            >
              Next →
            </Button>
          </div>
        </div>

        {/* ── Right — lesson list sidebar ── */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 border rounded-lg overflow-hidden">
            {/* Sidebar header */}
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h2 className="font-semibold text-sm">Course Content</h2>
              {course && <p className="text-xs text-gray-500 mt-0.5">{lessons.length} lessons</p>}
            </div>

            {/* Lesson list */}
            <div className="divide-y max-h-[60vh] overflow-y-auto">
              {courseLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : (
                lessons.map((l, index) => (
                  <button
                    key={l.id}
                    onClick={() => navigate(`/courses/${slug}/lessons/${l.id}`)}
                    className={cn(
                      'w-full text-left px-4 py-3 text-sm',
                      'flex items-start gap-3 hover:bg-gray-50',
                      'transition-colors',
                      l.id === id && 'bg-blue-50 border-l-2 border-blue-500'
                    )}
                  >
                    {/* Lesson number */}
                    <span
                      className="text-gray-400 text-xs mt-0.5 w-4
                                     flex-shrink-0"
                    >
                      {index + 1}
                    </span>

                    {/* Icon + title */}
                    <span className="flex-1 leading-snug">
                      {CONTENT_ICONS[l.content_type]} {l.title}
                    </span>

                    {/* Completed indicator */}
                    {l.isCompleted && (
                      <span
                        className="text-green-500 text-xs
                                       flex-shrink-0"
                      >
                        ✅
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPlayerPage;
