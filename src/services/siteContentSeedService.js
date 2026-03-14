const SiteContent = require("../models/SiteContent");

const defaultSiteContent = [
  {
    section_key: "sobre",
    title: "Sobre a GFI",
    content: "O Grupo Finix Investimento (GFI) é uma empresa moderna...",
  },
  {
    section_key: "missao",
    title: "Missão",
    content: "Oferecer soluções financeiras inteligentes...",
  },
  {
    section_key: "visao",
    title: "Visão",
    content: "Ser reconhecida como uma referência...",
  },
  {
    section_key: "valores",
    title: "Valores",
    content: "Transparência, Confiança, Cooperação e Inovação.",
  },
  {
    section_key: "como_funcionamos",
    title: "Como Funcionamos",
    content: "Os sócios do Grupo Finix realizam contribuições mensais...",
  },
  {
    section_key: "diferenciais",
    title: "Nossos Diferenciais",
    content: "✔ Modelo de investimento colaborativo...",
  },
  {
    section_key: "contatos",
    title: "Contatos",
    content: "contato@grupofinix.com.br\nwww.grupofinix.com.br...",
  },
];

async function seedSiteContent() {
  const count = await SiteContent.countDocuments();
  if (count > 0) return;
  await SiteContent.insertMany(defaultSiteContent);
}

module.exports = {
  seedSiteContent,
};
