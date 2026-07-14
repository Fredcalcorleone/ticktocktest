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
    
    // Inline require completely bypasses bundler checks and missing type errors
    const pdfParser = require('pdf-parse');
    const parsedData = await pdfParser(buffer);
    
    if (!parsedData || !parsedData.text) {
      return NextResponse.json({ error: 'Failed to extract text from document layers' }, { status: 422 });
    }
    
    return NextResponse.json({ text: parsedData.text });
  } catch (error: any) {
    console.error("Server-side PDF parsing failed:", error);
    return NextResponse.json(
      { error: error.message || 'Internal processing error on document layers' }, 
      { status: 500 }
    );
  }
}