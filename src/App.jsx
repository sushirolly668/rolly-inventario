import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { ESTACIONES } from './data';

export default function App() {
  return (
    <div className="min-h-screen bg-stone-100">
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg">
            R
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Rolli Sushi</h1>
          <p className="text-sm text-stone-500 mt-1">Sistema de inventario</p>
        </div>

        <div className="bg-white rounded-xl p-4 mb-4 border border-stone-200 text-sm text-stone-600">
          Elige tu estación para empezar el conteo
        </div>

        <div className="space-y-2">
          {Object.entries(ESTACIONES).map(([id, est]) => {
            const totalItems = Object.values(est.secciones).reduce(
              (acc, items) => acc + items.length, 0
            );
            return (
              <Link
                key={id}
                to={`/${id}`}
                className="flex items-center justify-between bg-white rounded-xl p-4 border border-stone-200 active:bg-stone-50 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-2xl">
                    {est.emoji}
                  </div>
                  <div>
                    <div className="font-semibold text-stone-900">{est.nombre}</div>
                    <div className="text-xs text-stone-500">{totalItems} productos</div>
                  </div>
                </div>
                <ChevronRight size={20} className="text-stone-400" />
              </Link>
            );
          })}
        </div>

        <div className="text-center text-xs text-stone-400 mt-8">
          v1.0 · Rolli Sushi
        </div>
      </div>
    </div>
  );
}
