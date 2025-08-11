export async function POST(request: Request) {
  if (request.method !== 'POST') {
    return new Response(null, { status: 405 });
  }

  try {
    const body = await request.json();

    // Step 1: Get the access_token from /api/auth
    const authResp = await fetch('http://localhost:3000/api/auth', { 
      method: 'POST'
    });
    const authData = await authResp.json();
    const token = authData.access_token;

    // Step 2: Use the token to call the logs API
    const resp = await fetch('http://20.244.56.144/evaluation-service/logs', {
      method: 'POST',
      headers: {~
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json();
    console.log(data)
    return new Response(JSON.stringify(data), { status: resp.status, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to proxy log' }), { status: 500 });
  }
}