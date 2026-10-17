import React, { useState, useEffect } from 'react';
import { Company } from '../../types';
import { api } from '../../services/api';
import { PlusIcon } from '../common/Icons';

export const CompanyMaster: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  // Form State
  const [code, setCode] = useState<string>('');
  const [legalName, setLegalName] = useState<string>('');
  const [tradeName, setTradeName] = useState<string>('');
  const [cinNumber, setCinNumber] = useState<string>('');
  const [gstin, setGstin] = useState<string>('');
  const [panNumber, setPanNumber] = useState<string>('');
  const [fssaiLicense, setFssaiLicense] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('Coimbatore');
  const [state, setState] = useState<string>('Tamil Nadu');
  const [pincode, setPincode] = useState<string>('641002');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [website, setWebsite] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    const data = await api.getCompanies();
    setCompanies(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingCompany(null);
    setCode(`COMP-${Date.now().toString().slice(-4)}`);
    setLegalName('');
    setTradeName('');
    setCinNumber('');
    setGstin('33AAAAA0000A1Z5');
    setPanNumber('AAAAA0000A');
    setFssaiLicense('10024042000889');
    setAddress('');
    setCity('Coimbatore');
    setState('Tamil Nadu');
    setPincode('641002');
    setPhone('+91 98422 12345');
    setEmail('');
    setWebsite('https://www.meanomeen.com');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (comp: Company) => {
    setEditingCompany(comp);
    setCode(comp.code);
    setLegalName(comp.legal_name);
    setTradeName(comp.trade_name);
    setCinNumber(comp.cin_number || '');
    setGstin(comp.gstin);
    setPanNumber(comp.pan_number || '');
    setFssaiLicense(comp.fssai_central_license || '');
    setAddress(comp.registered_address || '');
    setCity(comp.city);
    setState(comp.state);
    setPincode(comp.pincode);
    setPhone(comp.phone || '');
    setEmail(comp.email || '');
    setWebsite(comp.website || '');
    setIsActive(comp.is_active);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingCompany) {
        await api.updateCompany(editingCompany.id, {
          legal_name: legalName,
          trade_name: tradeName,
          cin_number: cinNumber,
          gstin,
          pan_number: panNumber,
          fssai_central_license: fssaiLicense,
          registered_address: address,
          city,
          state,
          pincode,
          phone,
          email,
          website,
          is_active: isActive
        });
      } else {
        await api.createCompany({
          code,
          legal_name: legalName,
          trade_name: tradeName,
          cin_number: cinNumber,
          gstin,
          pan_number: panNumber,
          fssai_central_license: fssaiLicense,
          registered_address: address,
          city,
          state,
          pincode,
          phone,
          email,
          website,
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
            🏢 Company Master (Enterprise Organizations)
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Configure parent corporate entities, legal compliance, CIN, GSTIN & Central FSSAI registrations.
          </p>
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
          <span>+ Add New Company</span>
        </button>
      </div>

      {/* Companies Grid */}
      {isLoading ? (
        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Company Master...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '16px' }}>
          {companies.map(comp => (
            <div
              key={comp.id}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>🏢</span>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                      {comp.trade_name}
                    </h4>
                    <span className={`badge ${comp.is_active ? 'badge-emerald' : 'badge-rose'}`} style={{ fontSize: '0.65rem' }}>
                      {comp.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Legal: <strong>{comp.legal_name}</strong>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenEdit(comp)}
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

              {/* Tax & Compliance details */}
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
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>Company Code</span>
                  <strong className="mono-num" style={{ color: 'var(--accent-cyan)' }}>{comp.code}</strong>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>GSTIN</span>
                  <strong className="mono-num" style={{ color: '#ffffff' }}>{comp.gstin}</strong>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>CIN Number</span>
                  <strong className="mono-num" style={{ color: 'var(--text-secondary)' }}>{comp.cin_number || 'N/A'}</strong>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>Central FSSAI</span>
                  <strong className="mono-num" style={{ color: 'var(--accent-emerald)' }}>{comp.fssai_central_license || 'N/A'}</strong>
                </div>
              </div>

              {/* Location & Contacts */}
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div>📍 {comp.registered_address || `${comp.city}, ${comp.state} - ${comp.pincode}`}</div>
                {comp.phone && <div>📞 {comp.phone} {comp.email && `• ✉️ ${comp.email}`}</div>}
                {comp.website && <div>🌐 <a href={comp.website} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-cyan)' }}>{comp.website}</a></div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Company Modal */}
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
            maxWidth: '640px',
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
                {editingCompany ? '✏️ Edit Company Master' : '🏢 Add New Company Master'}
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
                    Company Code *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingCompany}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#ffffff', padding: '8px 10px', fontSize: '0.82rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                    Trade / Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. meanOmeen Seafoods"
                    value={tradeName}
                    onChange={(e) => setTradeName(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#ffffff', padding: '8px 10px', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                  Legal Registered Entity Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MeanOmeen Marine Foods & Retail Pvt Ltd"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#ffffff', padding: '8px 10px', fontSize: '0.82rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                    GSTIN *
                  </label>
                  <input
                    type="text"
                    required
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#ffffff', padding: '8px 10px', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                    PAN Number
                  </label>
                  <input
                    type="text"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#ffffff', padding: '8px 10px', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                    Central FSSAI Lic
                  </label>
                  <input
                    type="text"
                    value={fssaiLicense}
                    onChange={(e) => setFssaiLicense(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#ffffff', padding: '8px 10px', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                  Registered Office Address
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#ffffff', padding: '8px 10px', fontSize: '0.82rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                  {isSubmitting ? 'Saving...' : 'Save Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
