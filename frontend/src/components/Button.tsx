export default function Button(props: any) {
  return (
    <button
      {...props}
      className="border rounded px-3 py-2 text-sm hover:bg-gray-50"
    />
  );
}
