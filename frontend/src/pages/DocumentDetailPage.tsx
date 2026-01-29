import Card from "../components/Card";
import { useParams } from "react-router-dom";
import { viewUrl } from "../api/client";

export default function DocumentDetailPage() {
  const { id } = useParams();

  if (!id) return null;

  return (
    <Card title="Preview">
      <iframe src={viewUrl(id)} className="w-full h-[70vh]" />
    </Card>
  );
}
