import React from 'react';

export interface Registration {
  id: string;
  qr_code_id: string;
  form_data: Record<string, any>;
  checked_in: boolean;
  checked_in_at: string | null;
  registered_at: string;
}

export interface FormField {
  id: string;
  label: string;
  field_type: string;
  required: boolean;
}

interface AttendanceTableProps {
  registrations: Registration[];
  fields: FormField[];
}

export default function AttendanceTable({ registrations, fields }: AttendanceTableProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-gray-400">
              <th className="px-6 py-4 font-medium">#</th>
              {fields.map(f => (
                <th key={f.id} className="px-6 py-4 font-medium">
                  <div className="flex items-center gap-2">
                    {f.label}
                  </div>
                </th>
              ))}
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Check-In Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {registrations.length > 0 ? (
              registrations.map((reg, idx) => (
                <tr key={reg.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-gray-500 font-mono">{idx + 1}</td>
                  {fields.map(f => {
                    const val = reg.form_data[f.label] || 
                                reg.form_data[f.label.toLowerCase().replace(/ /g, "_")] || 
                                '-';
                    return (
                      <td key={f.id} className="px-6 py-4 text-gray-200">
                        {val}
                      </td>
                    );
                  })}
                  <td className="px-6 py-4">
                    {reg.checked_in ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">
                        Checked In
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-white/5 text-gray-400 text-xs font-medium border border-white/10">
                        Not Yet
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                    {reg.checked_in_at ? new Date(reg.checked_in_at).toLocaleString() : '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={(fields?.length || 0) + 3} className="px-6 py-12 text-center text-gray-500">
                  No registrations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
