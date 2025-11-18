"use client";

import { trpc } from "@/lib/trpc/client";
import { Card } from "@biolab/ui/components/card";
import { Button } from "@biolab/ui/components/button";
import { Upload, File, Download, Trash2 } from "lucide-react";

export default function DocumentsPage() {
  const { data: documents, isLoading } = trpc.document.list.useQuery({ limit: 100 });

  if (isLoading) {
    return <div>Caricamento documenti...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documenti</h1>
          <p className="text-gray-500">Gestisci documenti e certificati</p>
        </div>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Carica Documento
        </Button>
      </div>

      <div className="grid gap-4">
        {documents?.map((doc) => (
          <Card key={doc.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <File className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-sm text-gray-500">
                    {doc.client?.companyName} • {new Date(doc.createdAt).toLocaleDateString("it")}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
