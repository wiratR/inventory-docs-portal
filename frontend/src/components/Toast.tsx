export default function Toast({
  message,
  onClose,
}: {
  message: string | null;
  onClose: () => void;
}) {
  if (!message) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-xl border bg-white p-3 shadow">
      <div className="flex items-start gap-3">
        <div className="text-sm">{message}</div>
        <button className="ml-auto text-sm text-gray-500" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
}
