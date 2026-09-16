import React from 'react';
import { X, BookOpen, Layers, Cpu, Flame, TrendingDown, Eye, Users } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const TheoreticalModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Cabecera del modal */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Corpus Teórico de Ciencias Sociales Computacionales (CSS)
              </h2>
              <p className="text-xs text-slate-400">
                Fundamentos epistemológicos del modelo basado en agentes y dinámicas de clase
              </p>
            </div>
          </div>
          <button
            id="btn-close-theory-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido scrolleable de teoría */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed">
          {/* 1. Simon & Cioffi-Revilla */}
          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-sm text-sky-400 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              1. Teoría de los Artefactos (Herbert Simon & Claudio Cioffi-Revilla)
            </h3>
            <p>
              En <em>The Sciences of the Artificial</em> (1969) y en los manuales contemporáneos de Ciencias Sociales Computacionales (Cioffi-Revilla, 2014), un sistema social se concibe como una interfaz entre un <strong>entorno interior</strong> (el habitus, las disposiciones psicosociales o la conciencia del sujeto) y un <strong>entorno exterior</strong> (las exigencias de la estructura o el Statu Quo).
            </p>
            <div className="p-2.5 bg-slate-900 font-mono text-[11px] rounded border border-slate-800 text-sky-300">
              Discrepancia = Exterior - Interior<br />
              Interior(t+1) = Interior(t) + [α × Discrepancia × (1 - Infrapoder)]
            </div>
            <p className="text-slate-400 text-[11px]">
              La discrepancia expresa el grado de desajuste o alienación. El parámetro α representa la presión de asimilación impuesta por el medio.
            </p>
          </div>

          {/* 2. James C. Scott */}
          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
              <Flame className="w-4 h-4" />
              2. Infrapoder y Armas de los Débiles (James C. Scott)
            </h3>
            <p>
              En <em>Weapons of the Weak</em> (1985) y <em>Domination and the Arts of Resistance</em> (1990), Scott postula que los grupos subalternos rara vez participan en insurrecciones abiertas debido al costo punitivo. En su lugar, despliegan <strong>infrapoder</strong>: resistencia microscópica, holgazanería calculada, desobediencia sutil, disimulo y sabotaje invisible.
            </p>
            <p className="text-slate-400 text-[11px]">
              En el modelo, el infrapoder actúa como un coeficiente estocástico que frena la domesticación del entorno interior frente a la presión exterior.
            </p>
          </div>

          {/* 3. Weber & Löwy: Afinidad Electiva */}
          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-sm text-amber-400 flex items-center gap-2">
              <Users className="w-4 h-4" />
              3. Afinidad Electiva y Resonancia de Red (Max Weber & Michael Löwy)
            </h3>
            <p>
              El concepto de <em>Wahlverwandtschaft</em> (afinidad electiva), rescatado por Michael Löwy en la sociología marxista heterodoxa, explica cómo dos formas culturales o clases no sólo se toleran, sino que se buscan y potencian recíprocamente:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li><strong>Resonancia (φ &gt; 0):</strong> Potenciación mutua del infrapoder. La resistencia colectiva de clase supera con creces la suma de actos individuales (Klasse für sich).</li>
              <li><strong>Disonancia (φ &lt; 0):</strong> Fragmentación, competencia inter-obrera o alienación ideológica; el poder efectivo se atrofia y la coerción sistémica triunfa.</li>
            </ul>
          </div>

          {/* 4. Karl Marx: Acumulación y Tasa de Ganancia */}
          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-sm text-rose-400 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              4. Acumulación y Tendencia Decreciente de la Ganancia (Karl Marx)
            </h3>
            <p>
              El circuito de valorización del capital ($M - C - M'$) depende de la extracción de plusvalía ($s$) sobre el capital variable ($v$). La competencia burguesa empuja al aumento incesante del capital constante ($c$, maquinaria/tecnología), elevando la <strong>Composición Orgánica del Capital</strong> ($c/v$).
            </p>
            <div className="p-2.5 bg-slate-900 font-mono text-[11px] rounded border border-slate-800 text-rose-300">
              Π = s / (c + v) &nbsp;&nbsp;(Tasa General de Ganancia de Marx)
            </div>
            <p className="text-slate-400 text-[11px]">
              Al descender Π, la clase capitalista intensifica la coerción laboral (aumenta α) para sostener la masa de ganancia, lo cual dispara la discrepancia y puede detonar huelgas resonantes.
            </p>
          </div>

          {/* 5. Antonio Gramsci: The Machine y Crisis Orgánica */}
          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-sm text-purple-400 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              5. Hegemonía, Bloque Histórico y Crisis Orgánica (Antonio Gramsci)
            </h3>
            <p>
              <em>The Machine</em> modela el aparato de dominación integral (Estado + Sociedad Civil). Cuando el infrapoder promedio es bajo, opera mediante <strong>Consenso Hegemónico</strong> (concesiones materiales, alfa relajado). Cuando el infrapoder subalterno se desborda, el sistema transmuta a <strong>Alarma Punitiva</strong>. Si la caída de la tasa de ganancia coincide con la resistencia obrera generalizada, se desata una <strong>Crisis Orgánica</strong> estructural.
            </p>
          </div>
        </div>

        {/* Pie del modal */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            id="btn-understand-theory"
            onClick={onClose}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow transition"
          >
            Comprendido
          </button>
        </div>
      </div>
    </div>
  );
};
