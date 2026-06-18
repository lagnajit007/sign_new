import Link from "next/link";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-[#EAE4FF]">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-bold text-[#2D1B69] mb-1">{title}</h3>
      <p className="text-sm text-[#7E7A93] mb-4 max-w-xs mx-auto">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#7D54FF] text-white rounded-full text-sm font-medium hover:bg-[#6840E0] transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
