import { Input, Label, Select } from "../components/Field";

import Button from "../components/Button";
import Card from "../components/Card";
import type { ChangeEvent } from "react";
import { addRecent } from "../utils/recent";
import { uploadDocument } from "../api/client";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function UploadPage() {
  const nav = useNavigate();
  const [sku, setSku] = useState("");
  const [docType, setDocType] = useState("datasheet");
  const [version, setVersion] = useState("");
  const [file, setFile] = useState<File | null>(null);

  async function submit() {
    if (!file) return;
    const doc = await uploadDocument({ sku, docType, version, file });
    addRecent(doc);
    nav("/documents");
  }

  return (
    <Card title="Upload Document">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>SKU</Label>
          <Input value={sku} onChange={(e: ChangeEvent<HTMLInputElement>) => setSku(e.target.value)} />
        </div>
        <div>
          <Label>Document Type</Label>
          <Select value={docType} onChange={(e: ChangeEvent<HTMLSelectElement>) => setDocType(e.target.value)}>
            <option>datasheet</option>
            <option>manual</option>
            <option>certificate</option>
          </Select>
        </div>
        <div>
          <Label>Version</Label>
          <Input value={version} onChange={(e: ChangeEvent<HTMLInputElement>) => setVersion(e.target.value)} />
        </div>
        <div>
          <Label>File</Label>
          <input
            type="file"
            className="block w-full rounded-lg border p-2 text-sm"
            onChange={e => setFile(e.target.files?.[0] || null)}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          onClick={submit}
          className="bg-brand-accent text-white hover:bg-indigo-700"
        >
          Upload
        </Button>
      </div>
    </Card>
  );
}
