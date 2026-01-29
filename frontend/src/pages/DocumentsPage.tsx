import { downloadUrl, viewUrl } from "../api/client";

import Card from "../components/Card";
import { getRecent } from "../utils/recent";

export default function DocumentsPage() {
  const docs = getRecent();

  return (
    <Card title="Documents">
      {docs.length === 0 && (
        <div className="text-center py-10 text-gray-500 text-sm">
          No documents uploaded yet
        </div>
      )}

      {docs.length > 0 && (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b text-left text-sm text-gray-500">
              <th className="py-2">SKU</th>
              <th>Type</th>
              <th>Version</th>
              <th>Title</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d: any) => (
              <tr
                key={d.id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="py-3 font-medium">{d.sku}</td>
                <td>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs">
                    {d.docType}
                  </span>
                </td>
                <td className="text-sm">{d.version}</td>
                <td className="text-sm">{d.title || d.fileName}</td>
                <td className="text-right space-x-3 text-sm">
                  <a
                    href={viewUrl(d.id)}
                    target="_blank"
                    className="text-brand-accent hover:underline"
                  >
                    View
                  </a>
                  <a
                    href={downloadUrl(d.id)}
                    className="text-gray-600 hover:underline"
                  >
                    Download
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}
