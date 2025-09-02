import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getUserFunctionalRoles, canUserViewForm, isAdminUser } from "@/lib/user-utils"

// Função para converter tipos de questão para o formato esperado pelo Prisma
function convertQuestionType(type: string): string {
  const typeMap: { [key: string]: string } = {
    'multiple_choice': 'MULTIPLE_CHOICE',
    'checkbox': 'CHECKBOX',
    'text': 'TEXT',
    'scale': 'SCALE',
    'grid': 'GRID',
    'dropdown': 'DROPDOWN',
    'section': 'SECTION'
  };
  
  return typeMap[type] || type.toUpperCase();
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    
    // Obter sessão do usuário para verificar roles funcionais
    const session = await getServerSession(authOptions)
    
    if (id) {
      // Buscar formulário específico por ID
      const form = await prisma.form.findUnique({
        where: { id },
        include: { 
          questions: { 
            orderBy: { order: 'asc' } 
          }, 
          createdBy: { select: { name: true, email: true } }, 
          responses: true 
        },
      })
      if (!form) return NextResponse.json({ message: "Formulário não encontrado" }, { status: 404 })
      
      // Para formulário específico, verificar se usuário pode acessar
      if (session?.user?.id) {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { role: true, extraData: true }
        })
        
        // ADMIN e CSA podem ver qualquer formulário
        if (user && !isAdminUser(user.role)) {
          // Usuários comuns: verificar se podem ver este formulário
          const userFunctionalRoles = getUserFunctionalRoles(user.extraData)
          const hasPermission = canUserViewForm(userFunctionalRoles, form.visibleToRoles)
          
          if (!hasPermission) {
            return NextResponse.json({ message: "Formulário não encontrado" }, { status: 404 })
          }
        }
      }
      
      return NextResponse.json(form)
    }
    
    // Buscar todos os formulários
    let forms = await prisma.form.findMany({
      include: {
        questions: { 
          orderBy: { order: 'asc' } 
        },
        createdBy: { select: { name: true, email: true } },
        responses: true,
      },
      orderBy: { createdAt: "desc" },
    })
    
    // Aplicar filtro de roles funcionais se usuário não for ADMIN/CSA
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, extraData: true }
      })
      
      if (user && !isAdminUser(user.role)) {
        const userFunctionalRoles = getUserFunctionalRoles(user.extraData)
        
        forms = forms.filter(form => {
          return canUserViewForm(userFunctionalRoles, form.visibleToRoles)
        })
      }
    }
    
    return NextResponse.json(forms)
  } catch (error) {
    console.error("Erro ao buscar formulários:", error)
    return NextResponse.json({ message: "Erro ao buscar formulários" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    // Verificar se o usuário tem permissão (ADMIN ou CSA)
    if (!["ADMIN", "CSA"].includes(session.user.role)) {
      return NextResponse.json({ message: "Sem permissão para criar formulários" }, { status: 403 })
    }

    const data = await req.json()
    const { id, title, description, category, status, deadline, questions, estimatedTime, generatesCertificate, certificateHours } = data

    // Validar categoria
    const validCategories = ["DOCENTES", "DISCENTES", "EGRESSOS", "TECNICOS_UNIDADES", "TECNICOS_COMPLEXO"]
    if (!category || !validCategories.includes(category)) {
      return NextResponse.json({ 
        message: "Categoria inválida. Selecione uma das opções: Docentes, Discentes, Egressos, Técnicos das Unidades ou Técnicos do Complexo" 
      }, { status: 400 })
    }

    // Se tiver ID, é uma atualização
    if (id) {
      // EDIÇÃO INTELIGENTE: Preservar questões com respostas
      console.log('🔄 Iniciando edição inteligente do formulário', id)
      
      // 1. Buscar questões existentes
      const existingQuestions = await prisma.question.findMany({
        where: { formId: id },
        include: { responses: true }
      })
      
      // 2. Identificar questões que podem ser deletadas (sem respostas)
      const questionsWithResponses = existingQuestions.filter(q => q.responses.length > 0)
      const questionsWithoutResponses = existingQuestions.filter(q => q.responses.length === 0)
      
      console.log('📊 Questões com respostas:', questionsWithResponses.length)
      console.log('📊 Questões sem respostas:', questionsWithoutResponses.length)
      
      // 3. Deletar apenas questões sem respostas
      for (const question of questionsWithoutResponses) {
        await prisma.question.delete({
          where: { id: question.id }
        })
      }
      
      // 4. Preparar questões para atualização/criação
      const questionsToProcess = questions.map((q: any, idx: number) => {
        const existingQuestion = existingQuestions.find(eq => 
          eq.customId === q.id || eq.id === q.id
        )
        
        return {
          ...q,
          order: idx,
          isExisting: !!existingQuestion,
          existingId: existingQuestion?.id,
          hasResponses: existingQuestion ? existingQuestion.responses.length > 0 : false
        }
      })
      
      // 5. Atualizar formulário (metadados)
      const form = await prisma.form.update({
        where: { id },
        data: {
          title,
          description,
          category,
          status,
          deadline: deadline ? new Date(deadline) : null,
          estimatedTime,
          generatesCertificate: generatesCertificate || false,
        }
      })
      
      // 6. Processar questões uma por uma
      for (const q of questionsToProcess) {
        if (q.isExisting && q.hasResponses) {
          // Questão existente COM respostas: atualizar com cuidado
          const existingQuestion = existingQuestions.find(eq => eq.id === q.existingId)
          
          // Permitir adição de novas opções, mas preservar existentes
          let updatedOptions = q.options || []
          if (existingQuestion && Array.isArray(existingQuestion.options)) {
            // Mesclar opções: manter existentes + adicionar novas
            const existingOptions = existingQuestion.options
            const newOptions = updatedOptions.filter(opt => !existingOptions.includes(opt))
            updatedOptions = [...existingOptions, ...newOptions]
          }
          
          await prisma.question.update({
            where: { id: q.existingId },
            data: {
              text: q.text,
              order: q.order,
              options: updatedOptions, // Permite adição de opções
              rows: q.rows || existingQuestion?.rows || [], // Permite adição de linhas
              columns: q.columns || existingQuestion?.columns || [], // Permite adição de colunas
              conditional: q.conditional || existingQuestion?.conditional || null,
              // NÃO alteramos type e required para preservar integridade
            }
          })
          console.log('🔄 Questão atualizada (preservando dados):', q.text.substring(0, 30))
          console.log('📝 Opções atualizadas:', updatedOptions)
        } else if (q.isExisting && !q.hasResponses) {
          // Questão existente SEM respostas: atualizar completamente
          await prisma.question.update({
            where: { id: q.existingId },
            data: {
              customId: q.id || null,
              text: q.text,
              type: convertQuestionType(q.type),
              required: q.required,
              options: q.options || [],
              rows: q.rows || [],
              columns: q.columns || [],
              order: q.order,
              conditional: q.conditional || null,
            }
          })
          console.log('🔄 Questão atualizada (sem respostas):', q.text.substring(0, 30))
        } else {
          // Questão nova: criar
          await prisma.question.create({
            data: {
              customId: q.id || null,
              text: q.text,
              type: convertQuestionType(q.type),
              required: q.required,
              options: q.options || [],
              rows: q.rows || [],
              columns: q.columns || [],
              order: q.order,
              conditional: q.conditional || null,
              formId: id,
            }
          })
          console.log('✨ Nova questão criada:', q.text.substring(0, 30))
        }
      }
      
      // 7. Buscar formulário atualizado
      const updatedForm = await prisma.form.findUnique({
        where: { id },
        include: { questions: { orderBy: { order: 'asc' } } }
      })
      
      console.log('🎉 Edição inteligente concluída com sucesso!')
      return NextResponse.json(updatedForm)
    }

    // Se não tiver ID, é uma criação
    const form = await prisma.form.create({
      data: {
        title,
        description,
        category,
        status,
        deadline: deadline ? new Date(deadline) : null,
        estimatedTime,
        generatesCertificate: generatesCertificate || false,
        createdBy: { connect: { id: session.user.id } },
        questions: {
          create: questions.map((q: any, idx: number) => ({
            customId: q.id || null, // Salva o ID personalizado se fornecido
            text: q.text,
            type: convertQuestionType(q.type),
            required: q.required,
            options: q.options || [],
            rows: q.rows || [],
            columns: q.columns || [],
            order: idx,
            conditional: q.conditional || null,
          })),
        },
      },
      include: { questions: true },
    })
    return NextResponse.json(form, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Erro ao salvar formulário" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    // Verificar se o usuário tem permissão (ADMIN ou CSA)
    if (!["ADMIN", "CSA"].includes(session.user.role)) {
      return NextResponse.json({ message: "Sem permissão para atualizar formulários" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const action = searchParams.get("action")
    const data = await req.json()

    if (action === "visibility") {
      const { id, visibleToRoles, status } = data
      if (!id) return NextResponse.json({ message: "ID do formulário é obrigatório" }, { status: 400 })
      
      // Dados para atualizar
      const updateData: any = {
        visibleToRoles: visibleToRoles || [],
      }
      
      // Se status foi fornecido, atualizar externalStatus
      if (status) {
        updateData.externalStatus = status
      }
      
      const form = await prisma.form.update({
        where: { id },
        data: updateData,
      })
      return NextResponse.json(form)
    } else if (action === "external-status") {
      const { id, status } = data
      if (!id) return NextResponse.json({ message: "ID do formulário é obrigatório" }, { status: 400 })
      const form = await prisma.form.update({
        where: { id },
        data: { externalStatus: status },
      })
      return NextResponse.json(form)
    } else {
      const { id, status } = data
      const form = await prisma.form.update({
        where: { id },
        data: { status },
      })
      return NextResponse.json(form)
    }
  } catch (error) {
    return NextResponse.json({ message: "Erro ao atualizar formulário" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    // Verificar se o usuário tem permissão (ADMIN ou CSA)
    if (!["ADMIN", "CSA"].includes(session.user.role)) {
      return NextResponse.json({ message: "Sem permissão para excluir formulários" }, { status: 403 })
    }

    const { id } = await req.json()
    console.log("Tentando excluir formulário com id:", id)
    // Deletar respostas associadas ao formulário
    await prisma.response.deleteMany({ where: { formId: id } })
    // Deletar perguntas associadas ao formulário
    await prisma.question.deleteMany({ where: { formId: id } })
    // Agora sim, deletar o formulário
    await prisma.form.delete({ where: { id } })
    return NextResponse.json({ message: "Formulário excluído" })
  } catch (error) {
    console.error("Erro ao excluir formulário:", error)
    return NextResponse.json({ message: "Erro ao excluir formulário", error: String(error) }, { status: 500 })
  }
} 