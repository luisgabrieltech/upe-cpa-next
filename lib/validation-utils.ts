/**
 * Valida o formato do código de validação
 */
export function isValidValidationCode(code: string): boolean {
  if (!code || typeof code !== 'string') {
    return false;
  }

  // Formato: UPE-CPA-XXXXX-YYYY
  const pattern = /^UPE-CPA-[A-Z0-9]{5}-[A-Z0-9]{4}$/;
  return pattern.test(code.toUpperCase());
} 