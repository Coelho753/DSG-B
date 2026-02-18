import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function SettingsPage() {
  const [profile, setProfile] = useState({ address: {}, themePreference: 'light' });
  const { theme, setTheme, toggleTheme } = useTheme();

  useEffect(() => {
    api.get('/users/profile').then(({ data }) => {
      setProfile(data);
      if (data.themePreference) setTheme(data.themePreference);
    });
  }, [setTheme]);

  const save = async () => {
    const { data } = await api.put('/users/profile', { address: profile.address, themePreference: theme });
    setProfile(data.user);
    window.alert('Perfil salvo');
  };

  return (
    <div style={{ maxWidth: 700, display: 'grid', gap: 12 }}>
      <h2>Settings</h2>
      <button onClick={toggleTheme}>Alternar tema ({theme})</button>

      <h3>Endereço</h3>
      <input placeholder="Rua" value={profile.address?.street || ''} onChange={(e) => setProfile({ ...profile, address: { ...profile.address, street: e.target.value } })} />
      <input placeholder="Número" value={profile.address?.number || ''} onChange={(e) => setProfile({ ...profile, address: { ...profile.address, number: e.target.value } })} />
      <input placeholder="Cidade" value={profile.address?.city || ''} onChange={(e) => setProfile({ ...profile, address: { ...profile.address, city: e.target.value } })} />
      <input placeholder="Estado" value={profile.address?.state || ''} onChange={(e) => setProfile({ ...profile, address: { ...profile.address, state: e.target.value } })} />
      <input placeholder="CEP" value={profile.address?.zipCode || ''} onChange={(e) => setProfile({ ...profile, address: { ...profile.address, zipCode: e.target.value } })} />
      <input placeholder="Complemento" value={profile.address?.complement || ''} onChange={(e) => setProfile({ ...profile, address: { ...profile.address, complement: e.target.value } })} />

      <button onClick={save}>Salvar perfil</button>
    </div>
  );
}
