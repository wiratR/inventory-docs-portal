import { Input, Select } from "../components/Field";

import Button from "../components/Button";
import Card from "../components/Card";
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
      <div className="space-y-3">
        <Input placeholder="SKU" value={sku} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSku(e.target.value)} />
        <Select value={docType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDocType(e.target.value)}>
          <option>datasheet</option>
          <option>manual</option>
          <option>cert</option>
        </Select>
        <Input placeholder="Version" value={version} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVersion(e.target.value)} />
        <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
        <Button onClick={submit}>Upload</Button>
      </div>
    </Card>
  );
}
