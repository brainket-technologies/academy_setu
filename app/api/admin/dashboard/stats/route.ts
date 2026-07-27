import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

export async function GET() {
  try {
    const [
      institutionCounts,
      applicationCounts,
      plans,
      promos,
      transactionSums,
      distributers
    ] = await Promise.all([
      prisma.institution.groupBy({ by: ['segment'], _count: true }),
      prisma.application.groupBy({ by: ['isLead'], _count: true }),
      prisma.plan.count(),
      prisma.promoCode.count(),
      prisma.transaction.groupBy({ by: ['type'], _sum: { amount: true } }),
      prisma.distributor.count()
    ]);

    const schools = institutionCounts.find((i: any) => i.segment === 'SCHOOL')?._count || 0;
    const colleges = institutionCounts.find((i: any) => i.segment === 'COLLEGE')?._count || 0;
    const institutes = institutionCounts.find((i: any) => i.segment === 'INSTITUTE')?._count || 0;

    const leads = applicationCounts.find((a: any) => a.isLead === true)?._count || 0;
    const applications = applicationCounts.reduce((acc: number, curr: any) => acc + curr._count, 0);

    const totalIncome = transactionSums.find((t: any) => t.type === 'INCOME')?._sum.amount || 0;
    const totalExpense = transactionSums.find((t: any) => t.type === 'EXPENSE')?._sum.amount || 0;

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
