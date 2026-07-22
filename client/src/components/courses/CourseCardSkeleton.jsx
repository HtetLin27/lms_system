import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

const CourseCardSkeleton = () => (
  <Card className="overflow-hidden">
    {/* Thumbnail placeholder */}
    <Skeleton className="aspect-video w-full rounded-none" />

    {/* Header placeholder */}
    <CardHeader className="pb-2">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-4 w-3/4" /> {/* title */}
        <Skeleton className="h-5 w-16" /> {/* badge */}
      </div>
      <Skeleton className="h-3 w-1/3" /> {/* instructor name */}
    </CardHeader>

    {/* Content placeholder */}
    <CardContent className="pb-2">
      <Skeleton className="h-3 w-1/4" /> {/* category */}
    </CardContent>

    {/* Button placeholder */}
    <CardFooter>
      <Skeleton className="h-9 w-full" /> {/* button */}
    </CardFooter>
  </Card>
);

export default CourseCardSkeleton;
