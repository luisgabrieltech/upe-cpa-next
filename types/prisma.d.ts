import { Prisma } from '@prisma/client';

export type QuestionType = 'MULTIPLE_CHOICE' | 'CHECKBOX' | 'TEXT' | 'SCALE' | 'GRID' | 'DROPDOWN' | 'SECTION';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
  options: string[];
  rows: string[];
  columns: string[];
  order: number;
  conditional: Prisma.JsonValue | null;
  formId: string;
  createdAt: Date;
  updatedAt: Date;
} 