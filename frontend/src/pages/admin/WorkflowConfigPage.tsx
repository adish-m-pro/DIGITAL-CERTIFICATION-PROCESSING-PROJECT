import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Sliders,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react';

export const WorkflowConfigPage: React.FC = () => {
  const [docTypes, setDocTypes] = useState<any[]>([]);
  const [selectedDocType, setSelectedDocType] = useState<any | null>(null);
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchDocTypes();
  }, []);

  const fetchDocTypes = async () => {
    try {
      const res = await api.get('/admin/document-types');
      setDocTypes(res.data);
      if (res.data.length > 0 && !selectedDocType) {
        setSelectedDocType(res.data[0]);
        setStages(res.data[0].workflows || []);
      }
    } catch (err) {
      console.error('Failed to load document types', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDoc = (doc: any) => {
    setSelectedDocType(doc);
    setStages(doc.workflows || []);
    setSuccessMsg(null);
  };

  const addStage = () => {
    const nextOrder = stages.length + 1;
    setStages([
      ...stages,
      {
        stageOrder: nextOrder,
        stageName: 'New Review Stage',
        roleRequired: 'FACULTY',
        description: 'Verification step'
      }
    ]);
  };

  const removeStage = (index: number) => {
    const updated = stages.filter((_, i) => i !== index);
    // Reorder stage numbers
    const reordered = updated.map((s, idx) => ({ ...s, stageOrder: idx + 1 }));
    setStages(reordered);
  };

  const updateStage = (index: number, field: string, value: string) => {
    const updated = [...stages];
    updated[index] = { ...updated[index], [field]: value };
    setStages(updated);
  };

  const handleSave = async () => {
    if (!selectedDocType) return;
    setSaving(true);
    setSuccessMsg(null);

    try {
      await api.put(`/admin/document-types/${selectedDocType.id}/workflows`, {
        workflows: stages
      });
      setSuccessMsg(`Workflow stages for ${selectedDocType.name} updated successfully!`);
      await fetchDocTypes();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save workflow stages');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Sliders className="w-6 h-6 text-purple-600" />
          Dynamic Workflow Stage Engine
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure multi-level approval hierarchies for individual academic document types without changing codebase.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: Document Type Selector */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
            Select Document Type
          </span>
          <div className="space-y-1.5">
            {docTypes.map((doc) => (
              <button
                key={doc.id}
                onClick={() => handleSelectDoc(doc)}
                className={`w-full text-left p-3 rounded-2xl text-xs font-semibold transition-all flex items-center justify-between ${
                  selectedDocType?.id === doc.id
                    ? 'bg-purple-50 text-purple-900 border border-purple-200 shadow-sm font-bold'
                    : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <span>{doc.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                  {doc.workflows?.length || 0} Stages
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right 2 Cols: Interactive Workflow Stages Builder */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {selectedDocType?.name} Workflow
              </h2>
              <p className="text-xs text-slate-500">
                Documents of this type will sequentially pass through the stages defined below.
              </p>
            </div>
            <button
              onClick={addStage}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold transition-all shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Workflow Stage
            </button>
          </div>

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Sequential Stages List */}
          <div className="space-y-4">
            {stages.map((st, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 relative group hover:border-purple-300 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-purple-700 flex items-center gap-1.5 font-mono">
                    <span className="w-5 h-5 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    Stage {idx + 1}
                  </span>
                  <button
                    onClick={() => removeStage(idx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Remove Stage"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Stage Label / Name
                    </label>
                    <input
                      type="text"
                      value={st.stageName}
                      onChange={(e) => updateStage(idx, 'stageName', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Role Required for Approval
                    </label>
                    <select
                      value={st.roleRequired}
                      onChange={(e) => updateStage(idx, 'roleRequired', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 font-semibold focus:outline-none"
                    >
                      <option value="FACULTY">Faculty / Class Advisor</option>
                      <option value="HOD">Head of Department (HOD)</option>
                      <option value="OFFICE">Academic Office / Registrar</option>
                      <option value="ADMIN">University Administrator</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Stage Description / Verification Rules
                    </label>
                    <input
                      type="text"
                      value={st.description || ''}
                      onChange={(e) => updateStage(idx, 'description', e.target.value)}
                      placeholder="e.g. Verify lab clearance and semester marks..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving Changes...' : 'Save Workflow Hierarchy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
