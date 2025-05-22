export const basePath = '/sistemacpa';

export const routes = {
  // Rotas principais
  home: `${basePath}/`,
  about: `${basePath}/#about`,
  benefits: `${basePath}/#benefits`,
  contact: `${basePath}/#contact`,

  // Rotas de autenticação
  auth: {
    login: `${basePath}/login`,
    register: `${basePath}/register`,
    forgotPassword: `${basePath}/forgot-password`,
    resetPassword: `${basePath}/reset-password`,
    accountInactive: `${basePath}/conta-inativada`,
  },
  
  // Rotas do dashboard
  dashboard: {
    home: `${basePath}/dashboard`,
    profile: `${basePath}/dashboard/perfil`,
    settings: `${basePath}/dashboard/configuracoes`,
    
    // Avaliações
    evaluations: {
      home: `${basePath}/dashboard/avaliacoes`,
      respond: (id: string) => `${basePath}/dashboard/avaliacoes/responder/${id}`,
      view: (id: string) => `${basePath}/dashboard/avaliacoes/${id}`,
    },
    
    // Administração
    admin: {
      home: `${basePath}/dashboard/admin`,
      
      // Formulários (Admin)
      forms: {
        home: `${basePath}/dashboard/admin/formularios`,
        new: `${basePath}/dashboard/admin/formularios/novo`,
        edit: (id: string) => `${basePath}/dashboard/admin/formularios/${id}/editar`,
        view: (id: string) => `${basePath}/dashboard/admin/formularios/${id}`,
        responses: (id: string) => `${basePath}/dashboard/admin/formularios/${id}/respostas`,
      },
      
      // Relatórios (Admin)
      reports: {
        home: `${basePath}/dashboard/admin/relatorios`,
        view: (id: string) => `${basePath}/dashboard/admin/relatorios/${id}`,
        generate: `${basePath}/dashboard/admin/relatorios/gerar`,
      },
      
      // Usuários (Admin)
      users: {
        home: `${basePath}/dashboard/admin/usuarios`,
        new: `${basePath}/dashboard/admin/usuarios/novo`,
        edit: (id: string) => `${basePath}/dashboard/admin/usuarios/${id}/editar`,
        view: (id: string) => `${basePath}/dashboard/admin/usuarios/${id}`,
      },
      
      // Configurações (Admin)
      settings: {
        home: `${basePath}/dashboard/admin/configuracoes`,
        general: `${basePath}/dashboard/admin/configuracoes/geral`,
        email: `${basePath}/dashboard/admin/configuracoes/email`,
        notifications: `${basePath}/dashboard/admin/configuracoes/notificacoes`,
      },
    },
  },
} as const
