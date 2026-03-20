import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Edit3, ChevronUp, ChevronDown,
  Type, Mail, Hash, Phone, AlignLeft, List, ToggleLeft, X, Check,
  GripVertical
} from 'lucide-react';

export interface FormField {
  id?: string;          // Set when field already exists in DB
  tempId: string;       // Local UI key (always set)
  label: string;
  field_type: string;
  placeholder: string;
  required: boolean;
  order: number;
  options: string[];
  isDefault?: boolean;  // Default fields (Name, Email, Phone) can't be deleted
}

interface FormFieldBuilderProps {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
}

const FIELD_TYPES = [
  { value: 'text',     label: 'Text',     icon: <Type size={14} /> },
  { value: 'email',    label: 'Email',    icon: <Mail size={14} /> },
  { value: 'number',   label: 'Number',   icon: <Hash size={14} /> },
  { value: 'phone',    label: 'Phone',    icon: <Phone size={14} /> },
  { value: 'textarea', label: 'Textarea', icon: <AlignLeft size={14} /> },
  { value: 'dropdown', label: 'Dropdown', icon: <List size={14} /> },
  { value: 'checkbox', label: 'Checkbox', icon: <ToggleLeft size={14} /> },
];

const TYPE_COLORS: Record<string, string> = {
  text:     'bg-blue-500/20 text-blue-400 border-blue-500/30',
  email:    'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  number:   'bg-green-500/20 text-green-400 border-green-500/30',
  phone:    'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  textarea: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  dropdown: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  checkbox: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const ICON_FOR = (type: string) => FIELD_TYPES.find(f => f.value === type)?.icon ?? <Type size={14} />;

function generateTempId() {
  return 'tmp_' + Math.random().toString(36).slice(2);
}

// ── Add / Edit modal ──────────────────────────────────────────────────────────
interface FieldModalProps {
  initial?: Partial<FormField>;
  onSave: (data: Omit<FormField, 'id' | 'order' | 'tempId'>) => void;
  onClose: () => void;
}

function FieldModal({ initial, onSave, onClose }: FieldModalProps) {
  const [label, setLabel]             = useState(initial?.label       ?? '');
  const [fieldType, setFieldType]     = useState(initial?.field_type  ?? 'text');
  const [placeholder, setPlaceholder] = useState(initial?.placeholder ?? '');
  const [required, setRequired]       = useState(initial?.required    ?? false);
  const [optionsRaw, setOptionsRaw]   = useState((initial?.options ?? []).join('\n'));
  const [error, setError]             = useState('');

  const handleSave = () => {
    if (!label.trim()) { setError('Label is required'); return; }
    if (fieldType === 'dropdown' && !optionsRaw.trim()) {
      setError('Dropdown fields must have at least one option');
      return;
    }
    const options = fieldType === 'dropdown'
      ? optionsRaw.split('\n').map(o => o.trim()).filter(Boolean)
      : [];
    onSave({ label: label.trim(), field_type: fieldType, placeholder, required, options });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#13132a] border border-white/10 rounded-2xl p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white">
            {initial?.label ? 'Edit Field' : 'Add New Field'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Field Label *</label>
            <input
              id="field-label-input"
              value={label}
              onChange={e => { setLabel(e.target.value); setError(''); }}
              placeholder="e.g. University, Team Name…"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4ff]/50 focus:bg-white/8 transition-all"
            />
          </div>

          {/* Field Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Field Type</label>
            <div className="grid grid-cols-4 gap-2">
              {FIELD_TYPES.map(ft => (
                <button
                  key={ft.value}
                  type="button"
                  onClick={() => setFieldType(ft.value)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-medium transition-all ${
                    fieldType === ft.value
                      ? 'bg-[#00d4ff]/20 border-[#00d4ff]/60 text-[#00d4ff]'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  {ft.icon}
                  {ft.label}
                </button>
              ))}
            </div>
          </div>

          {/* Placeholder */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Placeholder Text</label>
            <input
              value={placeholder}
              onChange={e => setPlaceholder(e.target.value)}
              placeholder="Helper text shown inside the input"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4ff]/50 transition-all"
            />
          </div>

          {/* Dropdown Options */}
          <AnimatePresence>
            {fieldType === 'dropdown' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Options <span className="text-gray-500">(one per line)</span>
                </label>
                <textarea
                  value={optionsRaw}
                  onChange={e => { setOptionsRaw(e.target.value); setError(''); }}
                  rows={4}
                  placeholder={"Option A\nOption B\nOption C"}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4ff]/50 transition-all resize-none font-mono text-sm"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Required toggle */}
          <div className="flex items-center justify-between py-2 border-t border-white/10">
            <div>
              <p className="text-sm font-medium text-white">Required Field</p>
              <p className="text-xs text-gray-500">Participants must fill this field</p>
            </div>
            <button
              type="button"
              id="field-required-toggle"
              onClick={() => setRequired(r => !r)}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${required ? 'bg-[#00d4ff]' : 'bg-white/10'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${required ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-sm flex items-center gap-1.5">
              <X size={14} /> {error}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            id="field-modal-save-btn"
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-white font-semibold hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all flex items-center justify-center gap-2"
          >
            <Check size={16} />
            {initial?.label ? 'Save Changes' : 'Add Field'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Delete confirmation modal ─────────────────────────────────────────────────
function DeleteModal({ label, onConfirm, onClose }: { label: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-sm bg-[#13132a] border border-white/10 rounded-2xl p-6 shadow-2xl"
      >
        <h3 className="text-lg font-bold text-white mb-2">Delete Field</h3>
        <p className="text-gray-400 text-sm mb-6">
          Are you sure you want to remove <span className="text-white font-medium">"{label}"</span>?
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all font-medium text-sm">
            Cancel
          </button>
          <button
            id="field-delete-confirm-btn"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500/80 hover:bg-red-500 text-white font-semibold transition-all text-sm"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
const FormFieldBuilder: React.FC<FormFieldBuilderProps> = ({ fields, onChange }) => {
  const [showAddModal, setShowAddModal]   = useState(false);
  const [editTarget, setEditTarget]       = useState<FormField | null>(null);
  const [deleteTarget, setDeleteTarget]   = useState<FormField | null>(null);

  const updateFields = (next: FormField[]) => {
    // Re-sync order numbers
    onChange(next.map((f, i) => ({ ...f, order: i + 1 })));
  };

  const handleAdd = (data: Omit<FormField, 'id' | 'order' | 'tempId'>) => {
    const newField: FormField = {
      ...data,
      tempId: generateTempId(),
      order: fields.length + 1,
    };
    updateFields([...fields, newField]);
    setShowAddModal(false);
  };

  const handleEdit = (data: Omit<FormField, 'id' | 'order' | 'tempId'>) => {
    if (!editTarget) return;
    updateFields(fields.map(f =>
      f.tempId === editTarget.tempId ? { ...f, ...data } : f
    ));
    setEditTarget(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    updateFields(fields.filter(f => f.tempId !== deleteTarget.tempId));
    setDeleteTarget(null);
  };

  const move = (tempId: string, dir: -1 | 1) => {
    const idx = fields.findIndex(f => f.tempId === tempId);
    if (idx === -1) return;
    const next = [...fields];
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= next.length) return;
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    updateFields(next);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white">Registration Form Fields</h2>
          <p className="text-sm text-gray-500">
            {fields.length} field{fields.length !== 1 ? 's' : ''} · drag to reorder
          </p>
        </div>
        <button
          type="button"
          id="add-form-field-btn"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00d4ff]/20 to-[#7c3aed]/20 border border-[#00d4ff]/30 text-[#00d4ff] rounded-xl hover:from-[#00d4ff]/30 hover:to-[#7c3aed]/30 transition-all text-sm font-medium"
        >
          <Plus size={16} />
          Add Field
        </button>
      </div>

      {/* Field List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        <AnimatePresence initial={false}>
          {fields.map((field, idx) => (
            <motion.div
              key={field.tempId}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.2 }}
              className="group flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/8 transition-all"
            >
              {/* Drag handle / order indicator */}
              <div className="flex flex-col items-center gap-0.5 text-gray-600 group-hover:text-gray-400 transition-colors shrink-0">
                <GripVertical size={16} />
              </div>

              {/* Field info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white text-sm truncate">{field.label}</span>
                  {field.required && (
                    <span className="text-red-400 text-xs font-bold shrink-0">*</span>
                  )}
                  {field.isDefault && (
                    <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-gray-500 text-[10px] rounded-full shrink-0">Default</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium ${TYPE_COLORS[field.field_type] ?? TYPE_COLORS.text}`}>
                    {ICON_FOR(field.field_type)}
                    {field.field_type}
                  </span>
                  {field.placeholder && (
                    <span className="text-gray-600 text-[11px] truncate">
                      · {field.placeholder}
                    </span>
                  )}
                </div>
                {field.field_type === 'dropdown' && field.options.length > 0 && (
                  <p className="text-[11px] text-gray-600 mt-1 truncate">
                    Options: {field.options.join(' · ')}
                  </p>
                )}
              </div>

              {/* Up / Down */}
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  type="button"
                  onClick={() => move(field.tempId, -1)}
                  disabled={idx === 0}
                  className="p-1 hover:bg-white/10 rounded-md transition-colors text-gray-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed"
                  title="Move up"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => move(field.tempId, 1)}
                  disabled={idx === fields.length - 1}
                  className="p-1 hover:bg-white/10 rounded-md transition-colors text-gray-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed"
                  title="Move down"
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              {/* Edit */}
              <button
                type="button"
                id={`edit-field-${field.tempId}`}
                onClick={() => setEditTarget(field)}
                className="p-2 text-gray-500 hover:text-[#00d4ff] hover:bg-[#00d4ff]/10 rounded-lg transition-all shrink-0"
                title="Edit field"
              >
                <Edit3 size={15} />
              </button>

              {/* Delete — disabled for default fields */}
              {!field.isDefault && (
                <button
                  type="button"
                  id={`delete-field-${field.tempId}`}
                  onClick={() => setDeleteTarget(field)}
                  className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all shrink-0"
                  title="Delete field"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {fields.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <List className="w-10 h-10 text-gray-600 mb-3" />
            <p className="text-gray-500 text-sm">No fields yet. Click "Add Field" to start.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && (
          <FieldModal onSave={handleAdd} onClose={() => setShowAddModal(false)} />
        )}
        {editTarget && (
          <FieldModal initial={editTarget} onSave={handleEdit} onClose={() => setEditTarget(null)} />
        )}
        {deleteTarget && (
          <DeleteModal
            label={deleteTarget.label}
            onConfirm={handleDelete}
            onClose={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FormFieldBuilder;
