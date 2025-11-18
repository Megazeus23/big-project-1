"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@biolab/ui/components/card";
import { Button } from "@biolab/ui/components/button";
import { Plus, Mail, Phone, MapPin } from "lucide-react";

export default function ClientsPage() {
  const { data, isLoading } = trpc.client.list.useQuery({ limit: 50 });

  if (isLoading) {
    return <div>Caricamento clienti...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clienti</h1>
          <p className="text-gray-500">Gestisci i tuoi clienti e aziende agricole</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nuovo Cliente
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.clients.map((client) => (
          <Card key={client.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-start justify-between">
                <span>{client.companyName}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    client.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : client.status === "LEAD"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {client.status}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                {client.email}
              </div>
              {client.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  {client.phone}
                </div>
              )}
              {client.city && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  {client.city}, {client.province}
                </div>
              )}
              <div className="pt-3 flex gap-2 text-xs text-gray-500">
                <span>{client._count.documents} documenti</span>
                <span>•</span>
                <span>{client._count.certifications} certificazioni</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
