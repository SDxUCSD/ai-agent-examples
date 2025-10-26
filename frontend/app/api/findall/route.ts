import { NextRequest, NextResponse } from 'next/server';

// Generate spec
export async function POST(request: NextRequest) {
  try {
    const { objective, executeNow } = await request.json();
    const apiKey = process.env.PARALLEL_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401 }
      );
    }

    // Step 1: Generate spec
    const ingestResponse = await fetch('https://api.parallel.ai/v1beta/findall/ingest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ query: objective }),
    });

    if (!ingestResponse.ok) {
      const error = await ingestResponse.text();
      return NextResponse.json(
        { error: `Parallel API error: ${error}` },
        { status: ingestResponse.status }
      );
    }

    const spec = await ingestResponse.json();

    // If executeNow is true, execute the spec
    if (executeNow) {
      const executeResponse = await fetch('https://api.parallel.ai/v1beta/findall/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify(spec),
      });

      if (!executeResponse.ok) {
        const error = await executeResponse.text();
        return NextResponse.json(
          { error: `Execution error: ${error}`, spec },
          { status: executeResponse.status }
        );
      }

      const results = await executeResponse.json();
      return NextResponse.json({ spec, results });
    }

    return NextResponse.json({ spec });
  } catch (error) {
    console.error('FindAll API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Execute existing spec
export async function PUT(request: NextRequest) {
  try {
    const spec = await request.json();
    const apiKey = process.env.PARALLEL_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401 }
      );
    }

    const response = await fetch('https://api.parallel.ai/v1beta/findall/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(spec),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `Parallel API error: ${error}` },
        { status: response.status }
      );
    }

    const results = await response.json();
    return NextResponse.json(results);
  } catch (error) {
    console.error('FindAll execute error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
