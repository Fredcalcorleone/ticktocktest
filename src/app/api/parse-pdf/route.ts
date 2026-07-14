import { NextRequest, NextResponse } from 'next/server';
import { readPdfText } from 'pdf-text-reader';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Pure JS parsing—no native Node compilation headaches
    const text = await readPdfText({ data: buffer });
    
    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Server-side PDF parsing failed:", error);
    return NextResponse.json(
      { error: error.message || 'Internal processing error on document layers' }, 
      { status: 500 }
    );
  }
}