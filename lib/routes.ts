export const basePath = ''; // '/sistemacpa' ← Removido temporariamente

export const routes = {
  // Rotas principais
  home: `/`,
  about: `/#about`,
  benefits: `/#benefits`,
  contact: `/#contact`,

  // Rotas de autenticação
  auth: {
    login: `/login`,
    register: `/register`,
    forgotPassword: `/forgot-password`,
    resetPassword: `/reset-password`,
    accountInactive: `/conta-inativada`,
  },
  
  // Rotas do dashboard
  dashboard: {
    home: `/dashboard`,
    profile: `/dashboard/perfil`,
    settings: `/dashboard/configuracoes`,
    
    // Avaliações
    evaluations: {
      home: `/dashboard/avaliacoes`,
      respond: (id: string) => `/dashboard/avaliacoes/responder/${id}`,
      view: (id: string) => `/dashboard/avaliacoes/${id}`,
    },
    
    // Administração
    admin: {
      home: `/dashboard/admin`,
      
      // Formulários (Admin)
      forms: {
        home: `/dashboard/admin/formularios`,
        new: `/dashboard/admin/formularios/novo`,
        edit: (id: string) => `/dashboard/admin/formularios/${id}/editar`,
        view: (id: string) => `/dashboard/admin/formularios/${id}`,
        responses: (id: string) => `/dashboard/admin/formularios/${id}/respostas`,
      },
      
      // Relatórios (Admin)
      reports: {
        home: `/dashboard/admin/relatorios`,
        view: (id: string) => `/dashboard/admin/relatorios/${id}`,
        generate: `/dashboard/admin/relatorios/gerar`,
      },
      
      // Usuários (Admin)
      users: {
        home: `/dashboard/admin/usuarios`,
        new: `/dashboard/admin/usuarios/novo`,
        edit: (id: string) => `/dashboard/admin/usuarios/${id}/editar`,
        view: (id: string) => `/dashboard/admin/usuarios/${id}`,
      },
      
      // Configurações (Admin)
      settings: {
        home: `/dashboard/admin/configuracoes`,
        general: `/dashboard/admin/configuracoes/geral`,
        email: `/dashboard/admin/configuracoes/email`,
        notifications: `/dashboard/admin/configuracoes/notificacoes`,
      },
    },
  },
} as const
