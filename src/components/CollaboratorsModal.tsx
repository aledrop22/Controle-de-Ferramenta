import React, { useState } from 'react';
import { Operator } from '../types';
import { Users, X, Search, Mail, Phone, Building2, Cpu, FileText, BadgeCheck, Plus, Pencil, Trash2, Camera } from 'lucide-react';
import { defaultAvatarUrl, getOperatorAvatarUrl } from '../utils/operatorAvatar';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  operators: Operator[];
  onAddOperator?: (newOp: Operator) => void;
  onUpdateOperator?: (operator: Operator) => void;
  onDeleteOperator?: (operatorId: string) => void;
}

export const CollaboratorsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  operators,
  onAddOperator,
  onUpdateOperator,
  onDeleteOperator
}) => {
  if (!isOpen) return null;

  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('Todos');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingOperatorId, setEditingOperatorId] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  // New Operator Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sector, setSector] = useState('Usinagem');
  const [machine, setMachine] = useState('CNC 01');
  const [notes, setNotes] = useState('');

  const sectors = ['Todos', 'Usinagem', 'Produção', 'Manutenção', 'Estoque', 'Expedição', 'PCP', 'Qualidade'];

  const filteredOperators = operators.filter((op) => {
    const matchesSector = selectedSector === 'Todos' || op.sector === selectedSector;
    const q = search.toLowerCase();
    const matchesSearch =
      op.name.toLowerCase().includes(q) ||
      (op.email && op.email.toLowerCase().includes(q)) ||
      (op.notes && op.notes.toLowerCase().includes(q)) ||
      op.badge.toLowerCase().includes(q) ||
      op.sector.toLowerCase().includes(q);
    return matchesSector && matchesSearch;
  });

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setSector('Usinagem');
    setMachine('CNC 01');
    setNotes('');
    setAvatarPreview('');
    setEditingOperatorId(null);
  };

  const handleEdit = (operator: Operator) => {
    setFirstName(operator.firstName);
    setLastName(operator.lastName);
    setEmail(operator.email || '');
    setPhone(operator.phone || '');
    setSector(operator.sector);
    setMachine(operator.machine);
    setNotes(operator.notes || '');
    setAvatarPreview(operator.avatarUrl || '');
    setEditingOperatorId(operator.id);
    setShowAddForm(true);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) return;

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const existingOperator = operators.find((operator) => operator.id === editingOperatorId);

    if (editingOperatorId && existingOperator) {
      onUpdateOperator?.({
        ...existingOperator,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: fullName,
        sector,
        machine: machine || 'Geral',
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        notes: notes.trim() || undefined,
        avatarUrl: avatarPreview || undefined
      });
      resetForm();
      setShowAddForm(false);
      return;
    }

    const newOp: Operator = {
      id: `op-custom-${Date.now()}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      name: fullName,
      sector,
      machine: machine || 'Geral',
      badge: `${sector.slice(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      notes: notes.trim() || undefined,
      avatarUrl: avatarPreview || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
    };

    if (onAddOperator) {
      onAddOperator(newOp);
    }

    resetForm();
    setShowAddForm(false);
  };

  const handleDelete = (operator: Operator) => {
    if (!window.confirm(`Deseja remover o colaborador ${operator.name}?`)) return;
    onDeleteOperator?.(operator.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative">

        {/* Modal Header */}
        <div className="bg-slate-800/80 px-6 py-4 border-b border-slate-700/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Gestão de Colaboradores &amp; Operadores
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {operators.length} Cadastrados
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Cadastro completo com nome, sobrenome, e-mail, telefone e observações técnicas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddForm ? 'Ver Lista' : 'Novo Colaborador'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form to Add New Collaborator */}
        {showAddForm ? (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
            <h4 className="text-sm font-bold text-white mb-2 pb-2 border-b border-slate-800">
              {editingOperatorId ? 'Editar Colaborador' : 'Cadastrar Novo Colaborador'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">First Name (Nome)</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Last Name (Sobrenome, opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Eduardo"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="Ex: carlos.eduardo@empresa.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number (Telefone)</label>
                <input
                  type="text"
                  placeholder="Ex: (11) 98765-4321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Setor</label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {sectors.filter((s) => s !== 'Todos').map((sec) => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Máquina / Posto Padrão</label>
                <input
                  type="text"
                  placeholder="Ex: CNC 02, TORNO 01"
                  value={machine}
                  onChange={(e) => setMachine(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Foto do colaborador</label>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                  {avatarPreview ? <img src={avatarPreview} alt="Pré-visualização" className="w-full h-full object-cover" /> : <Camera className="w-5 h-5 text-slate-500" />}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="w-full text-xs text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Notes (Observações Técnicas)</label>
              <textarea
                rows={3}
                placeholder="Ex: Certificação de calibração em dia; turno da manhã."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => { resetForm(); setShowAddForm(false); }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                {editingOperatorId ? 'Salvar Alterações' : 'Salvar Colaborador'}
              </button>
            </div>
          </form>
        ) : (
          /* Main Collaborator Search & Grid */
          <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">

            {/* Search & Sector Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, e-mail, crachá..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Sector Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {sectors.map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setSelectedSector(sec)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${selectedSector === sec
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400'
                      }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>
            </div>

            {/* Collaborators Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-2">
              {filteredOperators.map((op) => (
                <div
                  key={op.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleEdit(op)}
                  onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') handleEdit(op); }}
                  className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 transition-all hover:border-indigo-500/60 cursor-pointer flex items-start gap-3.5"
                >
                  <img
                    src={getOperatorAvatarUrl(op.id, op.name)}
                    alt={op.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-600 shrink-0"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = op.avatarUrl || defaultAvatarUrl;
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <h4 className="font-bold text-sm text-white truncate">{op.name}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shrink-0">
                          {op.badge}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(event) => { event.stopPropagation(); handleEdit(op); }}
                          title="Editar colaborador"
                          aria-label={`Editar ${op.name}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-indigo-600 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(event) => { event.stopPropagation(); handleDelete(op); }}
                          title="Remover colaborador"
                          aria-label={`Remover ${op.name}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Sector & Machine */}
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-500" />
                        {op.sector}
                      </span>
                      <span className="flex items-center gap-1">
                        <Cpu className="w-3 h-3 text-slate-500" />
                        {op.machine}
                      </span>
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-1 mt-2.5 pt-2 border-t border-slate-700/50 text-[11px] text-slate-300">
                      {op.email && (
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Mail className="w-3 h-3 text-indigo-400 shrink-0" />
                          <span className="truncate">{op.email}</span>
                        </div>
                      )}
                      {op.phone && (
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{op.phone}</span>
                        </div>
                      )}
                      {op.notes && (
                        <div className="flex items-start gap-1.5 text-slate-400 italic text-[11px] mt-1 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          <FileText className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{op.notes}</span>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
