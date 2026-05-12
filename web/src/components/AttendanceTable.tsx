import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, CheckCircle2, Clock, SlidersHorizontal, Eye, EyeOff, ClipboardList } from 'lucide-react';

export interface Registration {
  id: string;
  qr_code_id: string;
  form_data: Record<string, string>;
  email?: string;
  checked_in: boolean;
  checked_in_at: string | null;
  checked_out?: boolean;
  registered_at: string;
}

export interface FormField {
  id: string;
  label: string;
  field_type: string;
  required: boolean;
}

type SortKey = 'name' | 'status' | 'checked_in_at' | 'registered_at';
type SortDir = 'asc' | 'desc';

interface AttendanceTableProps {
  registrations: Registration[];
  fields: FormField[];
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />;
  return dir === 'asc'
    ? <ArrowUp className="w-3.5 h-3.5 text-[#00d4ff]" />
    : <ArrowDown className="w-3.5 h-3.5 text-[#00d4ff]" />;
}

export default function AttendanceTable({ registrations, fields }: AttendanceTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('registered_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [showColMenu, setShowColMenu] = useState(false);

  // Extra columns (exclude Name since it's always shown)
  const extraFields = fields.filter(f => f.label !== 'Full Name' && f.label !== 'full_name');
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set());

  const toggleCol = (id: string) => {
    setHiddenCols(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const visibleExtraFields = extraFields.filter(f => !hiddenCols.has(f.id));

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = [...registrations].sort((a, b) => {
    let av: string | number | boolean = '';
    let bv: string | number | boolean = '';

    if (sortKey === 'name') {
      av = (a.form_data['Full Name'] || a.form_data['full_name'] || a.email || '').toLowerCase();
      bv = (b.form_data['Full Name'] || b.form_data['full_name'] || b.email || '').toLowerCase();
    } else if (sortKey === 'status') {
      av = a.checked_in ? 1 : 0;
      bv = b.checked_in ? 1 : 0;
    } else if (sortKey === 'checked_in_at') {
      av = a.checked_in_at ? new Date(a.checked_in_at).getTime() : 0;
      bv = b.checked_in_at ? new Date(b.checked_in_at).getTime() : 0;
    } else if (sortKey === 'registered_at') {
      av = new Date(a.registered_at).getTime();
      bv = new Date(b.registered_at).getTime();
    }

    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const SortableHeader = ({ label, sortKeyVal }: { label: string; sortKeyVal: SortKey }) => (
    <th
      className="px-5 py-4 font-medium cursor-pointer hover:text-white transition-colors select-none"
      onClick={() => toggleSort(sortKeyVal)}
    >
      <div className="flex items-center gap-1.5">
        {label}
        <SortIcon active={sortKey === sortKeyVal} dir={sortDir} />
      </div>
    </th>
  );

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
      {/* Column visibility toolbar */}
      {extraFields.length > 0 && (
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/[0.02]">
          <p className="text-xs text-gray-500">{sorted.length} row{sorted.length !== 1 ? 's' : ''}</p>
          <div className="relative">
            <button
              onClick={() => setShowColMenu(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Columns
              {hiddenCols.size > 0 && (
                <span className="bg-[#7c3aed] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {hiddenCols.size}
                </span>
              )}
            </button>

            {showColMenu && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-[#13132b] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 px-4 pt-3 pb-2">Toggle Columns</p>
                {extraFields.map(f => (
                  <button
                    key={f.id}
                    onClick={() => toggleCol(f.id)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-sm text-left"
                  >
                    {hiddenCols.has(f.id)
                      ? <EyeOff className="w-4 h-4 text-gray-500 shrink-0" />
                      : <Eye className="w-4 h-4 text-[#00d4ff] shrink-0" />}
                    <span className={hiddenCols.has(f.id) ? 'text-gray-500' : 'text-gray-200'}>{f.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-gray-400">
              <th className="px-5 py-4 font-medium">#</th>
              <SortableHeader label="Name / Details" sortKeyVal="name" />
              {visibleExtraFields.map(f => (
                <th key={f.id} className="px-5 py-4 font-medium">{f.label}</th>
              ))}
              <SortableHeader label="Status" sortKeyVal="status" />
              <SortableHeader label="Check-In Time" sortKeyVal="checked_in_at" />
              <SortableHeader label="Registered At" sortKeyVal="registered_at" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {sorted.length > 0 ? (
              sorted.map((reg, idx) => {
                const nameField = fields.find(f => f.label === 'Full Name' || f.label.toLowerCase() === 'full name' || f.label.toLowerCase() === 'name');
                const name = nameField
                  ? (reg.form_data[nameField.label] || reg.form_data['Full Name'] || reg.form_data['full_name'] || '—')
                  : (reg.form_data['Full Name'] || reg.form_data['full_name'] || '—');
                return (
                  <tr key={reg.id} className="hover:bg-white/[0.04] transition-colors">
                    <td className="px-5 py-4 text-gray-500 font-mono text-xs">{idx + 1}</td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-100 truncate max-w-[160px]">{name}</p>
                      {reg.email && <p className="text-xs text-gray-500 truncate max-w-[160px]">{reg.email}</p>}
                    </td>
                    {visibleExtraFields.map(f => {
                      const val = reg.form_data[f.label] || reg.form_data[f.label.toLowerCase().replace(/ /g, '_')] || '—';
                      return (
                        <td key={f.id} className="px-5 py-4 text-gray-300 max-w-[160px] truncate">{val}</td>
                      );
                    })}
                    <td className="px-5 py-4">
                      {reg.checked_in ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-500/10 text-green-400 text-xs font-semibold border border-green-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Checked In
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 text-gray-400 text-xs font-medium border border-white/10">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs font-mono whitespace-nowrap">
                      {reg.checked_in_at ? new Date(reg.checked_in_at).toLocaleString() : '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs font-mono whitespace-nowrap">
                      {new Date(reg.registered_at).toLocaleString()}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={(visibleExtraFields?.length || 0) + 5} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <ClipboardList className="w-5 h-5 text-gray-600" />
                    </div>
                    <p className="text-gray-500 text-sm">No registrations match your filter.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
