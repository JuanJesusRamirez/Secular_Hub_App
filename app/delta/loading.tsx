import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-[350px]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4">
             <Skeleton className="h-8 w-1/2 mb-2" />
             <Skeleton className="h-4 w-3/4" />
          </Card>
        ))}
      </div>

      <Card className="mb-6 h-[200px]">
        <CardHeader>
           <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
           <Skeleton className="h-4 w-full mb-2" />
           <Skeleton className="h-4 w-full mb-2" />
           <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>

      <Card className="mb-6 h-[400px]">
        <CardHeader>
           <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
           <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="h-[400px]">
            <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
            <CardContent><Skeleton className="h-full w-full" /></CardContent>
        </Card>
        <Card className="h-[400px]">
            <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
            <CardContent><Skeleton className="h-full w-full" /></CardContent>
        </Card>
      </div>
    </div>
  );
}
