import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

export async function GET() {
  try {
    const schools = await prisma.institution.count({ where: { segment: 'SCHOOL' } })
    const colleges = await prisma.institution.count({ where: { segment: 'COLLEGE' } })
    const institutes = await prisma.institution.count({ where: { segment: 'INSTITUTE' } })
    
    const applications = await prisma.application.count()
    const leads = await prisma.application.count({ where: { isLead: true } })
    
    const plans = await prisma.plan.count()
    const promos = await prisma.promoCode.count()
    
    const incomeAgg = await prisma.transaction.aggregate({ _sum: { amount: true }, where: { type: 'INCOME' } })
    const expenseAgg = await prisma.transaction.aggregate({ _sum: { amount: true }, where: { type: 'EXPENSE' } })
    const distributers = await prisma.distributor.count()

    const totalIncome = incomeAgg._sum.amount || 0
    const totalExpense = expenseAgg._sum.amount || 0

    return NextResponse.json({
      success: true,
      data: {
        kpiData: {
          school: schools,
          college: colleges,
          institute: institutes,
          applications: applications,
          plans: plans,
          promos: promos,
          totalIncome: totalIncome,
          totalExpense: totalExpense,
          distributers: distributers,
        },
        leadFollowup: {
          totalLead: leads,
          totalApplication: applications,
          pendingFollowup: 0,
          todayFollowup: 0,
        },
        callLogin: {
          totalCallTime: 0,
          totalLoginTime: 0,
          totalLoginDuration: 0,
          inactiveTime: 0,
        },
        collectionStatus: {
          paid: 0,
          pending: 0,
          overdue: 0,
        }
      }
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
