import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    const apiKey = process.env.PARALLEL_API_KEY;

    console.log('Search API - Key exists:', !!apiKey, 'Key length:', apiKey?.length);
    
    if (!apiKey) {
      console.error('No API key found in environment');
      return NextResponse.json(
        { error: 'API key not configured. Check .env.local file' },
        { status: 401 }
      );
    }

    console.log('Making request to Parallel AI...');
    const response = await fetch('https://api.parallel.ai/v1beta/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        objective: query,
        processor: 'base',
        max_results: 10,
        max_chars_per_result: 6000,
      }),
    });

    console.log('Parallel AI response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('Parallel API error:', error);
      return NextResponse.json(
        { error: `Parallel API error: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
