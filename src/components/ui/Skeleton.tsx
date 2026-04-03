// ローディングスケルトンコンポーネント

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  isRounded?: boolean;
}

export default function Skeleton({
  className = '',
  width,
  height,
  isRounded = false,
}: SkeletonProps) {
  return (
    <div
      className={`
        animate-pulse bg-bg-tertiary
        ${isRounded ? 'rounded-full' : 'rounded-[var(--radius-sm)]'}
        ${className}
      `}
      style={{ width, height }}
    />
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height="16px"
          className={index === lines - 1 ? 'w-2/3' : 'w-full'}
        />
      ))}
    </div>
  );
}
