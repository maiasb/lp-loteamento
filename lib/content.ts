// Textos de docs/tecnico/copy.md (sem os marcadores [PEND-xx]). RN-01: só o que a spec permite prometer.

export const NAV_LINKS = [
  { href: '#demonstracao', label: 'Demonstração' },
  { href: '#funcionalidades', label: 'Funcionalidades' },
  { href: '#perguntas', label: 'Perguntas' },
] as const;

// Rodapé (copy.md): âncoras absolutas, valem na home e na política.
export const FOOTER_LINKS = [
  { href: '/#demonstracao', label: 'Demonstração' },
  { href: '/#funcionalidades', label: 'Funcionalidades' },
  { href: '/#perguntas', label: 'Perguntas' },
  { href: '/#contato', label: 'Fale conosco' },
] as const;

export const NOT_FOUND = {
  title: 'Página não encontrada',
  text: 'O endereço não existe ou mudou de lugar. Volte ao início ou fale com a gente.',
  cta: 'Voltar ao início',
};

export const HERO = {
  eyebrow: 'Para loteadoras, incorporadoras e imobiliárias',
  title: 'Mapa, lotes e reservas do seu loteamento em um só sistema',
  lead: 'O Loteamento Inteligente reúne o mapa, as quadras e os lotes num lugar só. O vendedor reserva, o administrador confirma a venda, e todo mundo vê o mesmo status. Implantado na hospedagem da sua empresa.',
  cta: 'Falar com a gente',
  ctaNote: 'Sem cadastro e sem compromisso. Respondemos por WhatsApp ou e-mail.',
  secondary: 'Testar a demonstração',
  secondaryNote: 'Mapa de exemplo, com dados fictícios.',
  art: 'Mapa de um loteamento com quadras e lotes coloridos por status: disponível, reservado, vendido e bloqueado.',
};

export const DEMO = {
  title: 'Experimente o mapa na prática',
  lead: 'Clique num lote, veja os detalhes e faça uma reserva de teste. É um exemplo com dados fictícios, para você sentir como a sua equipe usaria o sistema.',
  notice: 'Dados fictícios, apenas demonstração.',
  name: 'Residencial Exemplo',
  mapLabel: 'Planta de demonstração do Residencial Exemplo, com lotes por quadra',
  steps: [
    'Clique em um lote para ver quadra, área, preço e status.',
    'Em um lote disponível, use "Reservar este lote" ou "Adicionar à seleção" para reservar vários de uma vez.',
    'Para voltar ao início, use "Recomeçar".',
  ],
  disclaimer: 'A demonstração ilustra a lógica de reserva do sistema e não reproduz a tela real.',
  keyboard:
    'Use Tab para entrar na planta, as setas para percorrer os lotes e Enter ou Espaço para abrir os detalhes. Esc fecha o painel.',
  empty: 'Clique em um lote da planta para ver os detalhes.',
  selectionEmpty:
    'Nenhum lote na seleção. Use "Adicionar à seleção" para reservar vários lotes juntos.',
  reserved:
    'Lote reservado na demonstração. No sistema, a reserva fica aguardando: só um administrador confirma a venda ou cancela a reserva.',
  alreadyReserved:
    'Lote já reservado. Só lotes disponíveis podem ser reservados. No sistema, o administrador decide se confirma a venda ou cancela a reserva.',
  alreadySold: 'Lote já vendido. Lotes vendidos não podem ser reservados.',
  alreadyBlocked: 'Lote bloqueado. Só um administrador libera lotes bloqueados.',
  restarted: 'Demonstração reiniciada. Todos os lotes voltaram ao estado inicial.',
  cta: 'Quero isso no meu loteamento',
  ctaNote: 'Fale com a gente por formulário, WhatsApp ou e-mail.',
};

export const FEATURES = {
  title: 'O que o sistema faz pelo seu tipo de operação',
  lead: 'Três perfis, o mesmo sistema. Veja o que muda no seu dia a dia.',
  cta: 'Ver como fica no meu caso',
  profiles: [
    {
      icon: 'layers',
      name: 'Loteadora / incorporadora',
      title: 'Para quem lota e organiza o empreendimento',
      items: [
        'Cadastre o loteamento com o mapa em imagem, PDF ou SVG sobre o Google Maps, com quadras e lotes.',
        'Cada lote com número, área, preço, descrição e características.',
        'Importe o loteamento completo por planilha Excel ou JSON, sem digitar lote por lote.',
        'Bloqueie, desbloqueie ou exclua quadras de uma vez, com proteção para lotes já reservados ou vendidos.',
        'Compartilhe um link público do mapa, somente leitura, sem login e sem preço.',
      ],
    },
    {
      icon: 'store',
      name: 'Imobiliária',
      title: 'Para quem vende e precisa de um estoque confiável',
      items: [
        'Veja o status de cada lote: disponível, reservado, vendido ou bloqueado, com cores por status.',
        'Reserve um ou mais lotes para o mesmo cliente, com preço acordado, entrada e parcelas por lote.',
        'O sistema não deixa reservar um lote que não está disponível.',
        'Cada vendedor vê apenas as próprias reservas.',
        'Use no celular e escolha entre tema claro e escuro.',
      ],
    },
    {
      icon: 'chart',
      name: 'Gestor comercial',
      title: 'Para quem acompanha a operação e decide',
      items: [
        'Painel com o total de mapas, lotes e reservas (para administradores).',
        'A venda só é confirmada, ou a reserva cancelada, por um administrador.',
        'Três papéis de acesso (dev, admin e vendedor), com permissões aplicadas no servidor.',
        'Todos trabalham sobre o mesmo mapa e o mesmo status de cada lote.',
      ],
    },
  ],
} as const;

export const BENEFITS = {
  title: 'Reserva só de lote disponível, mais clareza para a equipe',
  items: [
    {
      icon: 'grid',
      title: 'Um estoque só, visível para todos.',
      text: 'Cada lote tem um status único no sistema, visível para toda a equipe: disponível, reservado, vendido ou bloqueado.',
      from: 'status por lote',
    },
    {
      icon: 'shield',
      title: 'Menos reserva em duplicidade.',
      text: 'O sistema impede reservar um lote que não está disponível.',
      from: 'regra de reserva',
    },
    {
      icon: 'key',
      title: 'Controle sobre a venda.',
      text: 'O vendedor reserva; só o administrador confirma a venda ou cancela. Cada vendedor vê apenas as próprias reservas.',
      from: 'papéis e permissões',
    },
    {
      icon: 'upload',
      title: 'Cadastro mais rápido.',
      text: 'Importe o loteamento por planilha Excel ou JSON em vez de cadastrar lote por lote.',
      from: 'importação',
    },
    {
      icon: 'list',
      title: 'Condições registradas por lote.',
      text: 'Preço acordado, entrada e parcelas ficam na reserva de cada lote.',
      from: 'reserva com condições',
    },
    {
      icon: 'chart',
      title: 'Visão geral rápida.',
      text: 'O painel mostra o total de mapas, lotes e reservas.',
      from: 'painel (dashboard)',
    },
  ],
} as const;

export const FAQ = {
  title: 'Perguntas frequentes',
  lead: 'Ainda ficou alguma dúvida? Chame a gente.',
  items: [
    {
      q: 'Como funciona a implantação?',
      a: 'O sistema é implantado sob demanda, na hospedagem da sua empresa. Você conversa com a gente, combinamos como será feito e entregamos o sistema funcionando com o seu loteamento.',
    },
    {
      q: 'Preciso instalar alguma coisa no computador da equipe?',
      a: 'Não. A equipe acessa o sistema pelo navegador, no computador ou no celular.',
    },
    {
      q: 'Tem mensalidade? Quanto custa?',
      a: 'O valor depende do tamanho da operação e da forma de implantação. Fale com a gente e enviamos uma proposta.',
    },
    {
      q: 'Qual o prazo de implantação?',
      a: 'O prazo depende do tamanho do loteamento e da hospedagem da sua empresa. Informamos na conversa, antes de qualquer compromisso.',
    },
    {
      q: 'Já tenho meus lotes em planilha. Preciso digitar tudo de novo?',
      a: 'Não. O sistema importa o loteamento completo por planilha Excel ou JSON.',
    },
    {
      q: 'Quem pode ver os preços?',
      a: 'Quem abre o link público do mapa não vê preço; o link é somente leitura e não pede login. Dentro do sistema, o acesso é por login, com permissões por papel (dev, admin e vendedor) aplicadas no servidor.',
    },
    {
      q: 'Quem confirma uma venda?',
      a: 'O vendedor reserva o lote. Só um administrador confirma a venda ou cancela a reserva.',
    },
    {
      q: 'Isso é um serviço por assinatura, com cadastro e teste grátis?',
      a: 'Não. O Loteamento Inteligente não é um serviço de cadastro automático nem tem teste grátis. Você experimenta a demonstração nesta página e, se fizer sentido, fala com a gente para combinar a implantação.',
    },
    {
      q: 'Como funciona o suporte?',
      a: 'Você fala diretamente com a gente por WhatsApp ou e-mail.',
    },
    {
      q: 'Funciona no celular?',
      a: 'Sim. O sistema pode ser usado no celular e tem tema claro e escuro.',
    },
  ],
} as const;

export const CONTACT = {
  title: 'Fale com a gente sobre o seu loteamento',
  lead: 'Deixe seus dados e entraremos em contato por WhatsApp ou e-mail. Sem cadastro e sem compromisso.',
  stepsTitle: 'Como é começar',
  steps: [
    { t: 'Você fala com a gente.', d: 'Pelo formulário, WhatsApp ou e-mail.' },
    {
      t: 'Conversamos sobre o seu loteamento.',
      d: 'Entendemos o tamanho da operação e como você controla os lotes hoje.',
    },
    {
      t: 'Combinamos a implantação.',
      d: 'O sistema é implantado na hospedagem da sua empresa, sob demanda.',
    },
  ],
  direct: 'Prefere falar agora?',
  whatsapp: 'Chamar no WhatsApp',
};

export const FOOTER = {
  description: 'Sistema para gestão e venda de loteamentos, implantado na hospedagem do cliente.',
  fictional: 'As imagens e valores da demonstração são fictícios.',
};

export const SEO = {
  title: 'Loteamento Inteligente: gestão de lotes e reservas',
  description:
    'Sistema para loteadoras e imobiliárias: mapa de lotes, quadras, status e reservas por vendedor. Veja a demonstração e fale com a gente.',
  ogDescription:
    'Mapa, lotes e reservas do seu loteamento num só sistema. Experimente a demonstração com dados fictícios.',
  privacyTitle: 'Política de Privacidade',
  privacyDescription:
    'Como o Loteamento Inteligente trata os dados enviados pelo formulário de contato e como pedir acesso ou exclusão.',
  softwareDescription:
    'Sistema web para gestão e venda de loteamentos: mapa, quadras, lotes e reservas.',
  ogAlt:
    'Loteamento Inteligente: mapa de lotes com quadras coloridas por status e o texto "Mapa, lotes e reservas em um só sistema".',
};
