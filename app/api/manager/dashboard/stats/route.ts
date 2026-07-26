import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

export async function GET() {
  try {
    const leads = await prisma.application.count({ where: { isLead: true } })
    const applications = await prisma.application.count()

    return NextResponse.json({
      success: true,
      data: {
        totalLeads: leads,
        totalApplications: applications,
        totalPendingFollowup: 0,
        todayPendingFollowup: 0,
        totalCallTime: 0,
        todayLoginTime: '0:00',
        lineChartData: [],
        bdmData: []
      }
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
