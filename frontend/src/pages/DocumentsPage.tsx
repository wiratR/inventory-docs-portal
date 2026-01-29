import { downloadUrl, viewUrl } from "../api/client";

import Card from "../components/Card";
import { getRecent } from "../utils/recent";

export default function DocumentsPage() {
  const docs = getRecent();

  return (
    <Card title="Recent Documents">
      {docs.length === 0 && <p className="text-sm text-gray-500">No documents</p>}
      <ul className="space-y-2">
        {docs.map((d: any) => (
          <li key={d.id} className="flex justify-between border-b py-2">
            <div>
              <div className="text-sm font-medium">{d.title || d.fileName}</div>
              <div className="text-xs text-gray-500">
                {d.sku} • {d.docType} • {d.version}
              </div>
            </div>
            <div className="flex gap-2">
              <a href={viewUrl(d.id)} target="_blank">View</a>
              <a href={downloadUrl(d.id)}>Download</a>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
