// client/src/pages/CourseDetailPage.jsx
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCourse } from '../hooks/useCourse';
import { useCurrentUser } from '../stores/authStore';
import { useEnroll } from '../hooks/useEnroll';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// ── Helpers ───────────────────────────────────────────────────────────────────
const LEVEL_COLORS = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
};

const formatDuration = (seconds) => {
  if (!seconds) return null;
  const mins = Math.floor(seconds / 60);
  return `${mins} min`;
};

const CONTENT_ICONS = {
  video: '🎬',
  pdf: '📄',
  text: '📝',
};

// ── Skeleton loader ────────────────────────────────────────────────────────────
const CourseDetailSkeleton = () => (
  <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
    <Skeleton className="h-8 w-2/3" />
    <Skeleton className="h-4 w-1/3" />
    <Skeleton className="h-24 w-full" />
    <div className="space-y-3">
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────────
const CourseDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const enrollMutation = useEnroll(slug);

  const { data, isLoading, isError } = useCourse(slug);
  const course = data?.data?.course;

  // We will build useEnroll in the next step
  // For now the button just navigates
  const handleEnroll = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    // enroll logic coming soon
    enrollMutation.mutate(slug);
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) return <CourseDetailSkeleton />;

  // ── Error ──────────────────────────────────────────────────────────────────
  if (isError || !course)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-red-500">Course not found or failed to load.</p>
      </div>
    );

  // ── Enroll button logic ────────────────────────────────────────────────────
  const renderEnrollButton = () => {
    // Not logged in
    if (!user) {
      return (
        <Link to="/login">
          <Button className="w-full">Login to Enroll</Button>
        </Link>
      );
    }

    // Already enrolled
    if (course.isEnrolled) {
      const firstLesson = course.lessons?.[0];
      return (
        <Link to={firstLesson ? `/courses/${slug}/lessons/${firstLesson.id}` : '#'}>
          <Button className="w-full" variant="outline">
            Continue Learning
          </Button>
        </Link>
      );
    }

    // Not enrolled
    return (
      <Button className="w-full" onClick={handleEnroll}>
        Enroll Now — It's Free
      </Button>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* ── Two column layout on desktop ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left — course info ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 flex-wrap">
              <h1 className="text-3xl font-bold flex-1">{course.title}</h1>
              <Badge className={LEVEL_COLORS[course.level]}>{course.level}</Badge>
            </div>

            {/* Instructor */}
            <p className="text-gray-500">
              By <span className="font-medium text-gray-700">{course.instructor?.name}</span>
            </p>

            {/* Category */}
            {course.category && <p className="text-sm text-gray-400">{course.category.name}</p>}
          </div>

          {/* Thumbnail */}
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full rounded-lg aspect-video object-cover"
            />
          ) : (
            <div
              className="w-full rounded-lg aspect-video
                            bg-gradient-to-br from-blue-400 to-purple-500"
            />
          )}

          {/* Description */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">About this course</h2>
            <p className="text-gray-600 leading-relaxed">{course.description}</p>
          </div>

          {/* Instructor bio */}
          {course.instructor?.bio && (
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Your Instructor</h2>
              <div className="flex items-start gap-3">
                {course.instructor.avatar_url ? (
                  <img
                    src={course.instructor.avatar_url}
                    alt={course.instructor.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-full bg-gray-200
                                  flex items-center justify-center
                                  text-gray-500 font-medium"
                  >
                    {course.instructor.name?.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-medium">{course.instructor.name}</p>
                  <p className="text-sm text-gray-500">{course.instructor.bio}</p>
                </div>
              </div>
            </div>
          )}

          {/* Lesson list */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">
              Course Content
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({course.lessons?.length || 0} lessons)
              </span>
            </h2>

            <div className="border rounded-lg divide-y">
              {course.lessons?.map((lesson, index) => (
                <div key={lesson.id} className="flex items-center gap-3 px-4 py-3">
                  {/* Lesson number */}
                  <span className="text-sm text-gray-400 w-6">{index + 1}</span>

                  {/* Content type icon */}
                  <span>{CONTENT_ICONS[lesson.content_type]}</span>

                  {/* Title */}
                  <span className="flex-1 text-sm">{lesson.title}</span>

                  {/* Preview badge */}
                  {lesson.is_preview && (
                    <Badge variant="outline" className="text-xs">
                      Preview
                    </Badge>
                  )}

                  {/* Duration */}
                  {lesson.duration_seconds && (
                    <span className="text-xs text-gray-400">
                      {formatDuration(lesson.duration_seconds)}
                    </span>
                  )}

                  {/* Lock icon for non-enrolled */}
                  {!lesson.is_preview && !course.isEnrolled && (
                    <span className="text-gray-300 text-xs">🔒</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right — enroll card (sticky on desktop) ── */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">
                {course.isEnrolled ? 'You are enrolled' : 'Start learning today'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Lessons</span>
                  <span className="font-medium">{course.lessons?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Level</span>
                  <span className="font-medium capitalize">{course.level}</span>
                </div>
                <div className="flex justify-between">
                  <span>Instructor</span>
                  <span className="font-medium">{course.instructor?.name}</span>
                </div>
              </div>

              {/* Enroll button */}
              {renderEnrollButton()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
