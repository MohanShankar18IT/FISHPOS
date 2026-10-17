import React, { useState, useEffect } from 'react';
import { Branch, Company, BranchTypeEnum } from '../../types';
import { api } from '../../services/api';
import { PlusIcon } from '../common/Icons';

export const BranchMaster: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Filter
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');

  // Form State
  const [companyId, setCompanyId] = useState<string>('comp-001');
  const [code, setCode] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [branchType, setBranchType] = useState<BranchTypeEnum>('RETAIL_STORE');
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('Coimbatore');
  const [state, setState] = useState<string>('Tamil Nadu');
  const [pincode, setPincode] = useState<string>('641002');
  const [gstin, setGstin] = useState<string>('33AAAAA0000A1Z5');
  const [fssaiStateLicense, setFssaiStateLicense] = useState<string>('12423001000456');
  const [contactPerson, setContactPerson] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [numRegisters, setNumRegisters] = useState<number>(2);
  const [chillerCapacityKg, setChillerCapacityKg] = useState<number>(500.0);
  const [scaleIp, setScaleIp] = useState<string>('192.168.1.120');
  const [scalePort, setScalePort] = useState<number>(9100);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    const [branchData, compData] = await Promise.all([
      api.getBranches(),
      api.getCompanies()
    ]);
    setBranches(branchData);
    setCompanies(compData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingBranch(null);
    setCompanyId(companies[0]?.id || 'comp-001');
    setCode(`CBE-BR-${Date.now().toString().slice(-3)}`);
    setName('');
    setBranchType('RETAIL_STORE');
    setAddress('');
    setCity('Coimbatore');
    setState('Tamil Nadu');
    setPincode('641002');
    setGstin('33AAAAA0000A1Z5');
    setFssaiStateLicense('12423001000456');
    setContactPerson('Store Manager');
    setPhone('+91 98422 12345');
    setEmail('');
    setNumRegisters(2);
    setChillerCapacityKg(500.0);
    setScaleIp('192.168.1.120');
    setScalePort(9100);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setCompanyId(branch.company_id || companies[0]?.id || 'comp-001');
    setCode(branch.code);
    setName(branch.name);
    setBranchType(branch.branch_type);
    setAddress(branch.address || '');
    setCity(branch.city);
    setState(branch.state);
    setPincode(branch.pincode);
    setGstin(branch.gstin || '33AAAAA0000A1Z5');
    setFssaiStateLicense(branch.fssai_state_license || '');
    setContactPerson(branch.contact_person || '');
    setPhone(branch.phone || '');
    setEmail(branch.email || '');
    setNumRegisters(branch.num_registers || 2);
    setChillerCapacityKg(branch.chiller_capacity_kg || 500.0);
    setScaleIp(branch.scale_ip || '192.168.1.120');
    setScalePort(branch.scale_port || 9100);
    setIsActive(branch.is_active);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingBranch) {
        await api.updateBranch(editingBranch.id, {
          company_id: companyId,
          name,
          branch_type: branchType,
          address,
          city,
          state,
          pincode,
          gstin,
          fssai_state_license: fssaiStateLicense,
          contact_person: contactPerson,
          phone,
          email,
          num_registers: numRegisters,
          chiller_capacity_kg: chillerCapacityKg,
          scale_ip: scaleIp,
          scale_port: scalePort,
          is_active: isActive
        });
      } else {
        await api.createBranch({
          company_id: companyId,
          code,
          name,
          branch_type: branchType,
          address,
          city,
          state,
          pincode,
          gstin,
          fssai_state_license: fssaiStateLicense,
          contact_person: contactPerson,
          phone,
          email,
          num_registers: numRegisters,
          chiller_capacity_kg: chillerCapacityKg,
          scale_ip: scaleIp,
          scale_port: scalePort,
          is_active: isActive
        });
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBranches = branches.filter(b => {
    if (selectedTypeFilter === 'ALL') return true;
    return b.branch_type === selectedTypeFilter;
  });

  const getBranchBadge = (type: BranchTypeEnum) => {
    switch (type) {
      case 'RETAIL_STORE':
        return <span className="badge badge-emerald">RETAIL STORE</span>;
      case 'CENTRAL_COLD_HUB':
        return <span className="badge badge-purple">COLD STORAGE HUB</span>;
      case 'DARK_STORE_FULFILLMENT':
        return <span className="badge badge-cyan">ONLINE DARK STORE</span>;
      case 'HARBOR_WHARF':
        return <span className="badge badge-amber">HARBOR WHARF</span>;
      default:
        return <span className="badge badge-cyan">{type}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top action & filter bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
            🏪 Branch / Store Master (Multi-Outlet Management)
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Manage Coimbatore stores, central cold hubs, POS register assignments & weighing scale network interfaces.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Type Filter Buttons */}
          <div style={{ display: 'flex', background: 'var(--bg-input)', padding: '3px', borderRadius: 'var(--radius-md)', gap: '4px' }}>
            {[
              { id: 'ALL', label: 'All Outlets' },
              { id: 'RETAIL_STORE', label: 'Retail Stores' },
              { id: 'CENTRAL_COLD_HUB', label: 'Cold Hubs' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedTypeFilter(f.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: selectedTypeFilter === f.id ? 'var(--accent-cyan)' : 'transparent',
                  color: selectedTypeFilter === f.id ? '#000000' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleOpenAdd}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-cyan)',
              border: 'none',
              color: '#000000',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <PlusIcon size={16} />
            <span>+ Add New Branch</span>
          </button>
        </div>
      </div>

      {/* Branches Grid */}
      {isLoading ? (
        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Branch Master...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '16px' }}>
          {filteredBranches.map(branch => (
            <div
              key={branch.id}
              className="glass-panel"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1.2rem' }}>🏪</span>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                      {branch.name}
                    </h4>
                    {getBranchBadge(branch.branch_type)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                    Code: {branch.code}
                  </div>
                </div>

                <button
                  onClick={() => handleOpenEdit(branch)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--accent-cyan)',
                    color: 'var(--accent-cyan)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Edit
                </button>
              </div>

              {/* Hardware & Capacity Badges */}
              <div style={{
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                fontSize: '0.75rem'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>POS Terminals</span>
                  <strong style={{ color: '#ffffff' }}>🖥️ {branch.num_registers} Active Registers</strong>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>Cold Storage Chiller</span>
                  <strong className="mono-num" style={{ color: 'var(--accent-emerald)' }}>❄️ {branch.chiller_capacity_kg} KG</strong>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>Scale Interface IP</span>
                  <strong className="mono-num" style={{ color: 'var(--accent-cyan)' }}>{branch.scale_ip || '192.168.1.120'}:{branch.scale_port || 9100}</strong>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>State FSSAI</span>
                  <strong className="mono-num" style={{ color: 'var(--accent-amber)' }}>{branch.fssai_state_license || 'N/A'}</strong>
                </div>
              </div>

              {/* Location & Contact Info */}
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div>📍 {branch.address || `${branch.city}, ${branch.state} - ${branch.pincode}`}</div>
                {branch.contact_person && <div>👤 Lead: <strong>{branch.contact_person}</strong></div>}
                {branch.phone && <div>📞 {branch.phone} {branch.email && `• ✉️ ${branch.email}`}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Branch Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(3, 7, 18, 0.8)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: 'var(--bg-card)',
            border: '1.5px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                {editingBranch ? '✏️ Edit Branch Master' : '🏪 Add New Branch Master'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                    Parent Company Entity *
                  </label>
                  <select
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#ffffff', padding: '8px 10px', fontSize: '0.82rem' }}
                  >
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.trade_name} ({c.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                    Branch Type *
                  </label>
                  <select
                    value={branchType}
                    onChange={(e) => setBranchType(e.target.value as BranchTypeEnum)}
                    style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#ffffff', padding: '8px 10px', fontSize: '0.82rem' }}
                  >
                    <option value="RETAIL_STORE">🏪 Retail Store Counter</option>
                    <option value="CENTRAL_COLD_HUB">❄️ Central Cold Hub & Intake</option>
                    <option value="DARK_STORE_FULFILLMENT">🛵 Online Dark Store Fulfillment</option>
                    <option value="HARBOR_WHARF">⚓ Harbor Receiving Wharf</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                    Branch Code *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingBranch}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#ffffff', padding: '8px 10px', fontSize: '0.82rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                    Branch Outlet Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RS Puram Main Chiller Hub"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#ffffff', padding: '8px 10px', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                  Branch Location Address
                </label>
                <textarea
                  rows={2}
                  placeholder="142, DB Road, RS Puram, Coimbatore - 641002"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#ffffff', padding: '8px 10px', fontSize: '0.82rem', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#ffffff', padding: '8px 10px', fontSize: '0.82rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#ffffff', padding: '8px 10px', fontSize: '0.82rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#ffffff', padding: '8px 10px', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              {/* Hardware, Registers & Scale Setup */}
              <div style={{
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr',
                gap: '10px'
              }}>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                    POS Registers
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={numRegisters}
                    onChange={(e) => setNumRegisters(parseInt(e.target.value) || 1)}
                    style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#ffffff', padding: '6px 8px', fontSize: '0.8rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                    Chiller Cap (KG)
                  </label>
                  <input
                    type="number"
                    step="50"
                    value={chillerCapacityKg}
                    onChange={(e) => setChillerCapacityKg(parseFloat(e.target.value) || 100)}
                    style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#ffffff', padding: '6px 8px', fontSize: '0.8rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                    Scale IP Address
                  </label>
                  <input
                    type="text"
                    value={scaleIp}
                    onChange={(e) => setScaleIp(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#ffffff', padding: '6px 8px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                    Scale Port
                  </label>
                  <input
                    type="number"
                    value={scalePort}
                    onChange={(e) => setScalePort(parseInt(e.target.value) || 9100)}
                    style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#ffffff', padding: '6px 8px', fontSize: '0.8rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                    Branch Contact Person
                  </label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#ffffff', padding: '8px 10px', fontSize: '0.82rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                    Branch Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#ffffff', padding: '8px 10px', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '9px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '9px 20px', borderRadius: 'var(--radius-md)', background: 'var(--accent-cyan)', border: 'none', color: '#000000', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
