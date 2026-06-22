import { lazy, Suspense, useEffect, useState } from "react";

const ThreeScene = lazy(() => import("./ThreeScene"));

interface Props {
  progressRef: React.MutableRefObject<number>;
}

export default function ClientCanvas({ progressRef }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <Suspense fallback={null}>
      <ThreeScene progressRef={progressRef} />
    </Suspense>
  );
}
