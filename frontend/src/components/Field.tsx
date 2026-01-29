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
