import { GET as typesGET, POST as typesPOST } from '../types/route'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  return typesGET(request)
}

export async function POST(request: NextRequest) {
  return typesPOST(request)
}
