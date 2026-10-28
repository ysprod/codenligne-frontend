'use client';

import { BarChart3, Download } from 'lucide-react';

export default function AdminResultatsPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-ink">Résultats & Rapports</h1>
        <p className="text-ink-soft mt-1">Analysez les performances des apprenants et exportez les données.</p>
      </div>

      {/* Cartes d'indicateurs (vides pour l'instant) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <p className="text-sm font-medium text-ink-soft">QCM réalisés</p>
          <p className="text-3xl font-bold text-ink mt-1">0</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <p className="text-sm font-medium text-ink-soft">Moyenne générale</p>
          <p className="text-3xl font-bold text-ink mt-1">--</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <p className="text-sm font-medium text-ink-soft">Taux de réussite</p>
          <p className="text-3xl font-bold text-ink mt-1">--%</p>
        </div>
      </div>

      {/* Zone vide */}
      <div className="bg-white rounded-xl border border-border p-8 text-center shadow-sm">
        <BarChart3 className="w-16 h-16 text-border-strong mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-ink">Aucune donnée disponible</h2>
        <p className="text-sm text-ink-soft mt-2 max-w-md mx-auto">
          Les résultats des apprenants apparaîtront ici dès que le système de tentatives sera activé.
        </p>
      </div>

      {/* Bouton d'export (désactivé) */}
      <div className="flex justify-end">
        <button disabled className="btn-secondary opacity-50 cursor-not-allowed">
          <Download className="w-5 h-5 mr-2" />
          Exporter les résultats (bientôt)
        </button>
      </div>
    </div>
  );
}