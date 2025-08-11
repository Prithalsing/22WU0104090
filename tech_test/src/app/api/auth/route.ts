import { NextResponse } from 'next/server'

export async function POST() {
  const body = {
    email: "prithalsing.vilas_2026@woxsen.edu.in",
    name: "prithalsing more",
    rollNo: "22wu0104090",
    accessCode: "UMXVQT",
    clientID: "92ef4864-10be-4ebd-b1c5-0aa7ea4606c2",
    clientSecret: "xafjxmwstzksjAQa"
  }

  try {
    const response = await fetch('http://20.244.56.144/evaluation-service/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    const token = data.access_token

    return NextResponse.json({ access_token: token }) 
  } catch (err) {
    console.error('Error fetching auth token:', err)
    return NextResponse.json(
      { error: 'Failed to fetch auth token' },
      { status: 500 }
    )
  }
}
