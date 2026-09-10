import { PUT as typesPUT, DELETE as typesDELETE } from '../../types/[id]/route'
import { NextRequest } from 'next/server'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return typesPUT(request, context)
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return typesDELETE(request, context)
}
