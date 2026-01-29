export default function Card({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm">
      {title && <h2 className="font-semibold mb-3">{title}</h2>}
      {children}
    </div>
  );
}
