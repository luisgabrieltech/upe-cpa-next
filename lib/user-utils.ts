import { FunctionalRole } from "@prisma/client"

/**
 * Extrai as roles funcionais do extraData do usuário
 */
export const getUserFunctionalRoles = (extraData: any): string[] => {
  return (extraData as any)?.functionalRoles || []
}

/**
 * Verifica se o usuário pode ver um formulário baseado nas roles funcionais
 */
export const canUserViewForm = (
  userFunctionalRoles: string[],
  formVisibleToRoles: string[]
): boolean => {
  // Se visibleToRoles estiver vazio, formulário é público
  if (!formVisibleToRoles || formVisibleToRoles.length === 0) {
    return true
  }
  
  // Verificar se usuário tem pelo menos uma role permitida
  return formVisibleToRoles.some(role => userFunctionalRoles.includes(role))
}

/**
 * Verifica se o usuário é admin ou CSA (acesso total)
 */
export const isAdminUser = (userRole: string): boolean => {
  return ["ADMIN", "CSA"].includes(userRole)
}

/**
 * Lista das roles funcionais disponíveis com labels
 */
export const FUNCTIONAL_ROLES_OPTIONS = [
  { value: "DOCENTE", label: "Docente" },
  { value: "DISCENTE", label: "Discente" },
  { value: "EGRESSO", label: "Egresso" },
  { value: "TECNICO_UNIDADES_ENSINO", label: "Técnico Unidades Ensino" },
  { value: "TECNICO_COMPLEXO_HOSPITALAR", label: "Técnico Complexo Hospitalar" },
] as const
