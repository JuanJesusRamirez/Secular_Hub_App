"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function WordRainRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/wordcloud-new");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground animate-pulse">
        Redirecting to the new Word Analysis experience...
      </p>
    </div>
  );
}
