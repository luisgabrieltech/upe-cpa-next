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

/**
 * Mapeia cargo selecionado para functional role
 * Usado no magic login para garantir consistência
 */
export const mapCargoToFunctionalRole = (cargo: string): string => {
  // Mapeamento direto - cargo já vem no formato correto do dropdown
  const validRoles = FUNCTIONAL_ROLES_OPTIONS.map(r => r.value)
  
  if (validRoles.includes(cargo)) {
    return cargo
  }
  
  // Fallback - se cargo não for reconhecido, retorna padrão
  console.warn(`Cargo não reconhecido: ${cargo}, usando TECNICO_COMPLEXO_HOSPITALAR como padrão`)
  return "TECNICO_COMPLEXO_HOSPITALAR"
}

/**
 * Valida se um cargo é válido
 */
export const isValidFunctionalRole = (cargo: string): boolean => {
  return FUNCTIONAL_ROLES_OPTIONS.some(role => role.value === cargo)
}
