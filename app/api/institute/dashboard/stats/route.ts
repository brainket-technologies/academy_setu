import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

export async function GET() {
  try {
    // For now, aggregate simple DB queries
    const students = await prisma.application.count()
    const teachers = await prisma.user.count({ where: { role: 'INSTITUTE' } }) // Dummy representation
    const incomeAgg = await prisma.transaction.aggregate({ _sum: { amount: true }, where: { type: 'INCOME' } })
    const expenseAgg = await prisma.transaction.aggregate({ _sum: { amount: true }, where: { type: 'EXPENSE' } })

    const totalIncome = incomeAgg._sum.amount || 0
    const totalExpense = expenseAgg._sum.amount || 0

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
