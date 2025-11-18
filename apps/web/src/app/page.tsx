import Link from "next/link";
import { Button } from "@biolab/ui/components/button";
import { ArrowRight, Leaf, Shield, FileCheck, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold">BioLab Consulting</span>
          </div>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/dashboard">
              <Button>Dashboard</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">
            Piattaforma Gestionale per<br />Certificazioni Biologiche
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Semplifica la gestione delle certificazioni bio in Alto Adige con la nostra
            piattaforma enterprise all-in-one
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="gap-2">
              Inizia Ora <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <FeatureCard
            icon={<Users className="h-10 w-10" />}
            title="CRM Avanzato"
            description="Gestisci clienti, pipeline e certificazioni in un unico posto"
          />
          <FeatureCard
            icon={<FileCheck className="h-10 w-10" />}
            title="Gestione Documenti"
            description="OCR automatico, versioning e firma digitale"
          />
          <FeatureCard
            icon={<Shield className="h-10 w-10" />}
            title="AI Compliance"
            description="Assistente AI per normative e conformità"
          />
          <FeatureCard
            icon={<Leaf className="h-10 w-10" />}
            title="Specializzati Bio"
            description="Focus su agricoltura biologica Alto Adige"
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
      <div className="text-green-600 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
