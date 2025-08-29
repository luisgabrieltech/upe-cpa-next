import { Role, FunctionalRole } from "@prisma/client"

export interface UserProfile {
  id: string
  name: string
  email: string
  role: Role
  extraData?: any
  functionalRoles: FunctionalRole[]
}

export interface UserWithFunctionalRoles {
  id: string
  name: string
  email: string
  role: Role
  functionalRoles: string[]
}
