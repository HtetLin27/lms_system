import { Link } from 'react-router-dom';
import { useMyEnrollments } from '../hooks/useMyEnrollments';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// ── Status badge colors ───────────────────────────────────────────────────────
const STATUS_COLORS = {
  active: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  dropped: 'bg-gray-100 text-gray-600',
};

// ── Skeleton loader ───────────────────────────────────────────────────────────
const EnrollmentSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 3 }, (_, i) => (
      <Card key={i} className="overflow-hidden">
        <Skeleton className="aspect-video w-full rounded-none" />
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    ))}
  </div>
);

// ── Single enrollment card ────────────────────────────────────────────────────
const EnrollmentCard = ({ enrollment }) => {
  const { course, status, progress_percent, completed_at } = enrollment;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Thumbnail */}
      <Link to={`/courses/${course.slug}`}>
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="aspect-video w-full object-cover"
          />
        ) : (
          <div
            className="aspect-video w-full bg-gradient-to-br
                          from-blue-400 to-purple-500"
          />
        )}
      </Link>

      {/* Header */}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug line-clamp-2">{course.title}</CardTitle>
          <Badge className={STATUS_COLORS[status]}>
            {status === 'active' ? 'In Progress' : null}
            {status === 'completed' ? 'Completed' : null}
            {status === 'dropped' ? 'Dropped' : null}
          </Badge>
        </div>
        <p className="text-sm text-gray-500">By {course.instructor?.name}</p>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Progress</span>
            <span className="font-medium">{progress_percent}%</span>
          </div>
          <Progress value={progress_percent} className="h-2" />
        </div>

        {/* Completed date */}
        {status === 'completed' && completed_at && (
          <p className="text-xs text-gray-400">
            Completed on{' '}
            {new Date(completed_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        )}

        {/* Action button */}
        <Link to={`/courses/${course.slug}`} className="block">
          <Button className="w-full" variant={status === 'completed' ? 'outline' : 'default'}>
            {status === 'active' ? 'Continue Learning' : null}
            {status === 'completed' ? 'View Course' : null}
            {status === 'dropped' ? 'Re-enroll' : null}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = ({ message }) => (
  <div
    className="flex flex-col items-center justify-center
                  py-16 text-center"
  >
    <div className="text-5xl mb-4">📚</div>
    <p className="text-gray-500 mb-4">{message}</p>
    <Link to="/courses">
      <Button>Browse Courses</Button>
    </Link>
  </div>
);

// ── Course grid ───────────────────────────────────────────────────────────────
const EnrollmentGrid = ({ enrollments, emptyMessage }) => {
  if (enrollments.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {enrollments.map((enrollment) => (
        <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
      ))}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const StudentDashboard = () => {
  const { data, isLoading, isError } = useMyEnrollments();
  const enrollments = data?.data?.enrollments || [];

  // Filter by status
  const active = enrollments.filter((e) => e.status === 'active');
  const completed = enrollments.filter((e) => e.status === 'completed');
  const dropped = enrollments.filter((e) => e.status === 'dropped');

  // ── Error ─────────────────────────────────────────────────────────────────
  if (isError)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-red-500">Failed to load your courses. Please try again.</p>
      </div>
    );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <p className="text-gray-500 mt-1">Track your learning progress</p>
      </div>

      {/* Stats row */}
      {!isLoading && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="text-center p-4">
            <div className="text-3xl font-bold text-blue-600">{active.length}</div>
            <div className="text-sm text-gray-500 mt-1">In Progress</div>
          </Card>

          <Card className="text-center p-4">
            <div className="text-3xl font-bold text-green-600">{completed.length}</div>
            <div className="text-sm text-gray-500 mt-1">Completed</div>
          </Card>

          <Card className="text-center p-4">
            <div className="text-3xl font-bold text-gray-600">{enrollments.length}</div>
            <div className="text-sm text-gray-500 mt-1">Total Enrolled</div>
          </Card>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <EnrollmentSkeleton />
      ) : (
        /* Tabs */
        <Tabs defaultValue="active">
          <TabsList className="mb-6">
            <TabsTrigger value="active">
              In Progress
              {active.length > 0 && (
                <Badge className="ml-2 bg-blue-100 text-blue-700 text-xs">{active.length}</Badge>
              )}
            </TabsTrigger>

            <TabsTrigger value="completed">
              Completed
              {completed.length > 0 && (
                <Badge className="ml-2 bg-green-100 text-green-700 text-xs">
                  {completed.length}
                </Badge>
              )}
            </TabsTrigger>

            <TabsTrigger value="dropped">
              Dropped
              {dropped.length > 0 && (
                <Badge className="ml-2 bg-gray-100 text-gray-600 text-xs">{dropped.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* In Progress tab */}
          <TabsContent value="active">
            <EnrollmentGrid
              enrollments={active}
              emptyMessage="You are not enrolled in any courses yet."
            />
          </TabsContent>

          {/* Completed tab */}
          <TabsContent value="completed">
            <EnrollmentGrid
              enrollments={completed}
              emptyMessage="You have not completed any courses yet. Keep going!"
            />
          </TabsContent>

          {/* Dropped tab */}
          <TabsContent value="dropped">
            <EnrollmentGrid
              enrollments={dropped}
              emptyMessage="You have not dropped any courses."
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default StudentDashboard;
