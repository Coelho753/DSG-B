import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../hooks/useToast';

export default function SettingsPage() {
  const toast = useToast();
  const [profile, setProfile] = useState({
    nome: '',
    email: '',
    password: '',
    address: {},
    themePreference: 'light',
  });
  const { theme, setTheme, toggleTheme } = useTheme();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get('/users/profile');
        setProfile((prev) => ({
          ...prev,
          nome: data.nome || '',
          email: data.email || '',
          address: data.address || {},
          themePreference: data.themePreference || 'light',
        }));
        if (data.themePreference) setTheme(data.themePreference);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Erro ao carregar perfil');
      }
    };

    loadProfile();
  }, [setTheme, toast]);

  const save = async () => {
    try {
      const payload = {
        nome: profile.nome,
        email: profile.email,
        address: profile.address,
        themePreference: theme,
      };

      if (profile.password) payload.password = profile.password;

      const { data } = await api.put('/users/profile', payload);
      setProfile((prev) => ({
        ...prev,
        ...data.user,
        password: '',
      }));
      toast.success('Perfil salvo com sucesso');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao salvar perfil');
    }
  };

  return (
    <div style={{ maxWidth: 700, display: 'grid', gap: 12 }}>
      <h2>Configurações</h2>
      <button type="button" onClick={toggleTheme}>Alternar tema ({theme})</button>

      <h3>Conta</h3>
      <input placeholder="Nome" value={profile.nome || ''} onChange={(e) => setProfile({ ...profile, nome: e.target.value })} />
      <input placeholder="Email" value={profile.email || ''} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
      <input type="password" placeholder="Nova senha (opcional)" value={profile.password || ''} onChange={(e) => setProfile({ ...profile, password: e.target.value })} />

      <h3>Endereço de entrega</h3>
      <input placeholder="Rua" value={profile.address?.street || ''} onChange={(e) => setProfile({ ...profile, address: { ...profile.address, street: e.target.value } })} />
      <input placeholder="Número" value={profile.address?.number || ''} onChange={(e) => setProfile({ ...profile, address: { ...profile.address, number: e.target.value } })} />
      <input placeholder="Cidade" value={profile.address?.city || ''} onChange={(e) => setProfile({ ...profile, address: { ...profile.address, city: e.target.value } })} />
      <input placeholder="Estado" value={profile.address?.state || ''} onChange={(e) => setProfile({ ...profile, address: { ...profile.address, state: e.target.value } })} />
      <input placeholder="CEP" value={profile.address?.zipCode || ''} onChange={(e) => setProfile({ ...profile, address: { ...profile.address, zipCode: e.target.value } })} />
      <input placeholder="Complemento" value={profile.address?.complement || ''} onChange={(e) => setProfile({ ...profile, address: { ...profile.address, complement: e.target.value } })} />

      <button type="button" onClick={save}>Salvar perfil</button>
    </div>
  );
}
