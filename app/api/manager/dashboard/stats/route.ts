import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

export async function GET() {
  try {
    const applicationCounts = await prisma.application.groupBy({ by: ['isLead'], _count: true });
    
    const leads = applicationCounts.find((a: any) => a.isLead === true)?._count || 0;
    const applications = applicationCounts.reduce((acc: number, curr: any) => acc + curr._count, 0);

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
