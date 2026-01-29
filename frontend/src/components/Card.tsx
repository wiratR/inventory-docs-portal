export default function Card({
  title,
  children,
  actions,
}: {
  title?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      {title && (
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
