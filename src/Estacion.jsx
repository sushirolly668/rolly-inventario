import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  ChevronDown, Send, History, X, Copy, Check, Trash2,
  MessageCircle, AlertTriangle, ShoppingCart, ArrowLeft
} from 'lucide-react';
import { ESTACIONES, WHATSAPP_DESTINO } from './data';

const keyFor = (section, idx) => `${section}::${idx}`;

// Helpers de almacenamiento local
const loadLS = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
};
const saveLS = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};

export default function Estacion() {
  const { stationId } = useParams();
  const est = ESTACIONES[stationId];

  if (!est) return <Navigate to="/" replace />;

  const SECTION_ORDER = Object.keys(est.secciones);
  const storageKey = `rolli_${stationId}`;
  const nameKey = `rolli_${stationId}_name`;
  const historyKey = `rolli_${stationId}_history`;

  const [name, setName] = useState(() => loadLS(nameKey, ''));
  const [belowMin, setBelowMin] = useState(() => loadLS(`${storageKey}_below`, {}));
  const [quantities, setQuantities] = useState(() => loadLS(`${storageKey}_qty`, {}));
  const [expandedSection, setExpandedSection] = useState(SECTION_ORDER[0]);
  const [showSummary, setShowSummary] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState(() => loadLS(historyKey, []));
  const [copied, setCopied] = useState(false);
  const [viewingHistoric, setViewingHistoric] = useState(null);
  const [notas, setNotas] = useState('');

  useEffect(() => { saveLS(nameKey, name); }, [name]);
  useEffect(() => { saveLS(`${storageKey}_below`, belowMin); }, [belowMin]);
  useEffect(() => { saveLS(`${storageKey}_qty`, quantities); }, [quantities]);
  useEffect(() => { saveLS(historyKey, history); }, [history]);

  const toggleBelowMin = (section, idx) => {
    const k = keyFor(section, idx);
    setBelowMin(prev => {
      const next = { ...prev };
      if (next[k]) delete next[k]; else next[k] = true;
      return next;
    });
  };

  const updateQty = (section, idx, val) => {
    setQuantities(prev => ({ ...prev, [keyFor(section, idx)]: val }));
  };

  const countInSection = (section) =>
    est.secciones[section].filter((_, idx) => belowMin[keyFor(section, idx)]).length;

  const totalToOrder = useMemo(
    () => Object.keys(belowMin).filter(k => belowMin[k]).length,
    [belowMin]
  );

  const generateText = (marked = belowMin, qtys = quantities, who = name, obs = notas) => {
    let text = `🛒 *PEDIDO ${est.nombre.toUpperCase()} — ROLLI SUSHI*\n`;
    text += `👤 ${who || 'Sin nombre'}\n`;
    text += `📅 ${new Date().toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}\n`;
    text += `━━━━━━━━━━━━━━\n\n`;

    let totalItems = 0;
    let sectionsText = '';
    SECTION_ORDER.forEach(section => {
      const items = est.secciones[section]
        .map((row, idx) => ({ row, idx }))
        .filter(({ idx }) => marked[keyFor(section, idx)]);
      if (items.length) {
        totalItems += items.length;
        sectionsText += `*${section.toUpperCase()}*\n`;
        items.forEach(({ row, idx }) => {
          const qty = qtys[keyFor(section, idx)];
          const hasQty = qty && String(qty).trim();
          let line = `  • ${row.item}`;
          if (hasQty) line += ` — hay ${qty}`;
          if (row.min) line += ` (mín ${row.min})`;
          sectionsText += line + '\n';
        });
        sectionsText += '\n';
      }
    });

    if (totalItems === 0) {
      text += `✅ Todo bien, no hay nada que pedir.\n`;
    } else {
      text += `🚨 *Hay ${totalItems} producto(s) por debajo del mínimo:*\n\n${sectionsText}`;
    }

    if (obs && obs.trim()) {
      text += `\n📝 *Notas:*\n${obs.trim()}\n`;
    }

    return text.trim();
  };

  const handleFinalize = () => {
    if (!name.trim()) { alert('Por favor anota tu nombre'); return; }
    const submission = {
      id: Date.now(),
      name: name.trim(),
      timestamp: new Date().toISOString(),
      belowMin,
      quantities,
      notas,
      total: totalToOrder,
    };
    setHistory(prev => [submission, ...prev].slice(0, 30));
    setShowSummary(true);
  };

  const sendWhatsApp = () => {
    const t = viewingHistoric
      ? generateText(viewingHistoric.belowMin || {}, viewingHistoric.quantities || {}, viewingHistoric.name, viewingHistoric.notas || '')
      : generateText();
    const encoded = encodeURIComponent(t);
    const url = WHATSAPP_DESTINO
      ? `https://wa.me/${WHATSAPP_DESTINO}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  const copyText = async () => {
    const t = viewingHistoric
      ? generateText(viewingHistoric.belowMin || {}, viewingHistoric.quantities || {}, viewingHistoric.name, viewingHistoric.notas || '')
      : generateText();
    try {
      await navigator.clipboard.writeText(t);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { alert('No se pudo copiar'); }
  };

  const clearAll = () => {
    if (confirm('¿Limpiar todas las marcas y cantidades?')) {
      setBelowMin({});
      setQuantities({});
      setNotas('');
    }
  };

  const deleteHistoric = (id) => {
    if (!confirm('¿Borrar este registro del historial?')) return;
    setHistory(prev => prev.filter(h => h.id !== id));
    if (viewingHistoric?.id === id) setViewingHistoric(null);
  };

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="sticky top-0 z-30 bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="p-2 -ml-2 rounded-lg hover:bg-stone-100 text-stone-600">
              <ArrowLeft size={20} />
            </Link>
            <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm">R</div>
            <div>
              <div className="font-semibold text-stone-900 leading-tight">Rolli Sushi</div>
              <div className="text-xs text-stone-500 leading-tight flex items-center gap-1">
                <span>{est.emoji}</span><span>{est.nombre}</span>
              </div>
            </div>
          </div>
          <button onClick={() => setShowHistory(true)} className="p-2 rounded-lg hover:bg-stone-100 active:bg-stone-200 text-stone-600">
            <History size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 pb-36">
        <div className="bg-white rounded-xl p-4 mb-4 border border-stone-200">
          <label className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2 block">Tu nombre</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Quién hace el conteo"
            className="w-full text-lg text-stone-900 placeholder:text-stone-300 bg-transparent"
          />
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm text-amber-900 space-y-1">
          <div><strong>1.</strong> Revisa cada producto en el local.</div>
          <div><strong>2.</strong> Si hay <strong>menos del mínimo</strong>, toca para marcarlo.</div>
          <div><strong>3.</strong> Anota cuánto queda en la casilla derecha (opcional).</div>
          <div><strong>4.</strong> Al terminar, manda el pedido.</div>
        </div>

        {SECTION_ORDER.map(section => {
          const count = countInSection(section);
          const total = est.secciones[section].length;
          const isOpen = expandedSection === section;
          return (
            <div key={section} className="bg-white rounded-xl mb-3 border border-stone-200 overflow-hidden">
              <button onClick={() => setExpandedSection(isOpen ? null : section)} className="w-full flex items-center justify-between p-4 active:bg-stone-50">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-stone-900">{section}</span>
                  <span className="text-xs text-stone-400">({total})</span>
                  {count > 0 && (
                    <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <AlertTriangle size={10} />{count} pedir
                    </span>
                  )}
                </div>
                <ChevronDown size={20} className={`text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div className="border-t border-stone-100">
                  {est.secciones[section].map((row, idx) => {
                    const k = keyFor(section, idx);
                    const marked = belowMin[k];
                    const qty = quantities[k] || '';
                    return (
                      <div key={k} className={`flex items-stretch border-t border-stone-100 first:border-t-0 ${marked ? 'bg-red-50' : ''}`}>
                        <button
                          onClick={() => toggleBelowMin(section, idx)}
                          className={`flex-1 flex items-center gap-3 px-4 py-3 text-left ${marked ? 'active:bg-red-100' : 'active:bg-stone-50'}`}
                        >
                          <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 ${marked ? 'border-red-600 bg-red-600' : 'border-stone-300 bg-white'}`}>
                            {marked && <Check size={16} className="text-white" strokeWidth={3} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`${marked ? 'font-semibold text-red-900' : 'text-stone-800'}`}>{row.item}</div>
                            {row.min && <div className={`text-xs ${marked ? 'text-red-700' : 'text-stone-500'}`}>Mínimo: {row.min}</div>}
                          </div>
                        </button>
                        <div className="flex items-center pr-3 py-2">
                          <input
                            type="text"
                            value={qty}
                            onChange={(e) => updateQty(section, idx, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="cantidad"
                            className={`w-24 text-center text-sm px-2 py-2 rounded-lg border ${marked ? 'border-red-300 bg-white text-red-900 font-semibold placeholder:text-red-300' : 'border-stone-200 bg-stone-50 text-stone-700 placeholder:text-stone-300'} focus:border-red-500 focus:bg-white`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <div className="bg-white rounded-xl p-4 mt-3 border border-stone-200">
          <label className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2 block">Notas (opcional)</label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Cualquier observación..."
            rows={2}
            className="w-full text-stone-900 placeholder:text-stone-300 bg-transparent resize-none"
          />
        </div>

        {(totalToOrder > 0 || Object.keys(quantities).length > 0 || notas) && (
          <button onClick={clearAll} className="w-full text-sm text-stone-500 py-3 mt-2 flex items-center justify-center gap-2 active:text-red-600">
            <Trash2 size={16} /> Limpiar todo
          </button>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 shadow-lg z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex-1">
            <div className="text-xs text-stone-500">A pedir</div>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold ${totalToOrder > 0 ? 'text-red-600' : 'text-stone-400'}`}>{totalToOrder}</span>
              <span className="text-xs text-stone-500">producto{totalToOrder !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <button onClick={handleFinalize} className="flex-1 bg-red-600 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 active:bg-red-700">
            <Send size={18} /> Enviar pedido
          </button>
        </div>
      </div>

      {showSummary && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-stone-200">
              <h2 className="font-semibold text-lg text-stone-900 flex items-center gap-2">
                <ShoppingCart size={20} className="text-red-600" />
                {viewingHistoric ? 'Pedido guardado' : 'Pedido listo'}
              </h2>
              <button onClick={() => { setShowSummary(false); setViewingHistoric(null); if (!viewingHistoric) { setBelowMin({}); setQuantities({}); setNotas(''); } }} className="p-2 rounded-lg hover:bg-stone-100">
                <X size={20} className="text-stone-600" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <pre className="whitespace-pre-wrap text-sm font-mono text-stone-800 bg-stone-50 p-3 rounded-lg border border-stone-200">
                {viewingHistoric
                  ? generateText(viewingHistoric.belowMin || {}, viewingHistoric.quantities || {}, viewingHistoric.name, viewingHistoric.notas || '')
                  : generateText()}
              </pre>
            </div>
            <div className="p-4 border-t border-stone-200 grid grid-cols-2 gap-3">
              <button onClick={copyText} className="py-3 px-4 rounded-xl border-2 border-stone-300 text-stone-700 font-semibold flex items-center justify-center gap-2 active:bg-stone-100">
                {copied ? <><Check size={18} /> Copiado</> : <><Copy size={18} /> Copiar</>}
              </button>
              <button onClick={sendWhatsApp} className="py-3 px-4 rounded-xl bg-green-600 text-white font-semibold flex items-center justify-center gap-2 active:bg-green-700">
                <MessageCircle size={18} /> WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-stone-200">
              <h2 className="font-semibold text-lg text-stone-900">Pedidos de {est.nombre}</h2>
              <button onClick={() => setShowHistory(false)} className="p-2 rounded-lg hover:bg-stone-100">
                <X size={20} className="text-stone-600" />
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              {history.length === 0 ? (
                <div className="p-8 text-center text-stone-500">Aún no hay pedidos guardados</div>
              ) : (
                history.map(h => (
                  <div key={h.id} className="border-b border-stone-100 p-4 flex items-center gap-3">
                    <div className="flex-1 cursor-pointer" onClick={() => { setViewingHistoric(h); setShowHistory(false); setShowSummary(true); }}>
                      <div className="font-medium text-stone-900">{h.name}</div>
                      <div className="text-sm text-stone-500">{new Date(h.timestamp).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                      <div className="text-xs mt-0.5">
                        <span className={`font-medium ${h.total > 0 ? 'text-red-600' : 'text-stone-400'}`}>
                          {h.total} producto{h.total !== 1 ? 's' : ''} a pedir
                        </span>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteHistoric(h.id); }} className="p-2 text-stone-400 hover:text-red-600">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
