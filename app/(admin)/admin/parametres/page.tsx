'use client';

import { Settings, Shield, Clock } from 'lucide-react';

export default function AdminParametresPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-ink">Paramètres</h1>
        <p className="text-ink-soft mt-1">Configurez l&apos;identité de la plateforme et les accès.</p>
      </div>

      <div className="bg-white rounded-xl border border-border p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-ink flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-primary" /> Identité du site
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Nom de la plateforme</label>
              <input
                type="text"
                defaultValue="CODENLIGNE"
                disabled
                className="w-full p-2 border border-border-strong rounded-md bg-gray-50"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h2 className="text-lg font-semibold text-ink flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" /> Accès par défaut
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Durée d&apos;accès par défaut (jours)</label>
              <input
                type="number"
                defaultValue={30}
                disabled
                className="w-full p-2 border border-border-strong rounded-md bg-gray-50"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h2 className="text-lg font-semibold text-ink flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" /> Sécurité
          </h2>
          <p className="text-sm text-ink-soft">
            Ces paramètres seront configurables prochainement.
          </p>
        </div>
      </div>
    </div>
  );
}