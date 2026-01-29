export function Label({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <label className="mb-1 block text-sm font-medium text-gray-700">
      {children}
    </label>
  );
}

export function Input(props: any) {
  return (
    <input
      {...props}
      className="w-full border rounded px-3 py-2 text-sm"
    />
  );
}

export function Select(props: any) {
  return (
    <select
      {...props}
      className="w-full border rounded px-3 py-2 text-sm"
    />
  );
}
