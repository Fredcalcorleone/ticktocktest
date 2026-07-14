import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Dynamically require the module within execution scope to 
    // keep Next.js from evaluating binary dependencies out-of-bounds
    const pdf = require('pdf-parse');
    const parsedData = await pdf(buffer);
    
    return NextResponse.json({ text: parsedData.text });
  } catch (error: any) {
    console.error("Server-side PDF parsing failed:", error);
    return NextResponse.json(
      { error: error.message || 'Internal processing error on document layers' }, 
      { status: 500 }
    );
  }
}