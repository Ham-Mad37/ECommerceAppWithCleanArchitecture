import { Suspense, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

import ErrorBoundary from "./ErrorBoundary";
import { PageSkeleton } from "./Skeleton";

/** Error screen + loading placeholder for lazily loaded pages. Placed inside the layouts, so the header stays put. */
export default function PageBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <ErrorBoundary resetKey={pathname}>
      <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
    </ErrorBoundary>
  );
}
