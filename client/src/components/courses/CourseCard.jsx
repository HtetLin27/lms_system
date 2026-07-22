import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const LEVEL_COLORS = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
};

const CourseCard = ({ course }) => (
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
        <Badge className={LEVEL_COLORS[course.level]}>{course.level}</Badge>
      </div>
      <p className="text-sm text-gray-500">By {course.instructor?.name}</p>
    </CardHeader>

    {/* Content */}
    <CardContent className="pb-2">
      {course.category && <span className="text-xs text-gray-400">{course.category.name}</span>}
    </CardContent>

    {/* Footer */}
    <CardFooter>
      <Link to={`/courses/${course.slug}`} className="w-full">
        <Button variant={course.isEnrolled ? 'outline' : 'default'} className="w-full">
          {course.isEnrolled ? 'Continue Learning' : 'View Course'}
        </Button>
      </Link>
    </CardFooter>
  </Card>
);

export default CourseCard;
