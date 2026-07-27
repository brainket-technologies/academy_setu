import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

export async function GET() {
  try {
    // For now, aggregate simple DB queries
    const [
      students,
      teachers,
      transactionSums
    ] = await Promise.all([
      prisma.application.count(),
      prisma.user.count({ where: { role: 'INSTITUTE' } }),
      prisma.transaction.groupBy({ by: ['type'], _sum: { amount: true } })
    ]);

    const totalIncome = transactionSums.find((t: any) => t.type === 'INCOME')?._sum.amount || 0;
    const totalExpense = transactionSums.find((t: any) => t.type === 'EXPENSE')?._sum.amount || 0;

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          sms: { used: 0, available: 0 },
          teachers: teachers,
          enquiries: 0,
          students: students,
          paidStudents: 0,
          unpaidStudents: 0,
          totalIncome: totalIncome,
          totalExpenses: totalExpense,
          appInstalls: 0,
        },
        feeOverview: {
          totalAmount: 0,
          totalHostel: 0,
          totalTution: 0,
          totalDayBoarding: 0
        },
        feeStatus: {
          paid: 0,
          pending: 0,
          overdue: 0
        },
        studentAttendance: {
          present: 0,
          absent: 0,
          halfDay: 0,
          holiday: 0
        }
      }
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
