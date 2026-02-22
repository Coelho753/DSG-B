import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Footer() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.get('/settings').then(({ data }) => setSettings(data)).catch(() => setSettings(null));
  }, []);

  const nomeSite = settings?.gerais?.nomeSite || 'Marketplace';
  const email = settings?.gerais?.emailSuporte || 'suporte@marketplace.com';
  const whatsapp = settings?.gerais?.whatsapp || '+55 11 00000-0000';

  return (
    <footer style={{ marginTop: 30, borderTop: '1px solid #ddd', paddingTop: 16 }}>
      <p>{nomeSite} - marketplace com produtos selecionados e entrega para todo o Brasil.</p>
      <p>Email: {email}</p>
      <p>WhatsApp: {whatsapp}</p>
      <p>Links úteis: Produtos • Categorias • Carrinho • Configurações</p>
    </footer>
  );
}
