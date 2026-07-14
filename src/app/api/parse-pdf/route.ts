import { NextRequest, NextResponse } from 'next/server';
import PDFParser from 'pdf2json';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Wrap the event-driven pdf2json listener in a Promise
    const extractedText = await new Promise<string>((resolve, reject) => {
      const pdfParser = new (PDFParser as any)();
      
      pdfParser.on('pdfParser_dataError', (errData: any) => reject(errData.parserError));
      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        // Parse raw text strings out of page layouts, decoding URL percentage variables safely
        let rawText = '';
        for (const page of pdfData.Pages) {
          for (const textObj of page.Texts) {
            for (const textToken of textObj.R) {
              rawText += decodeURIComponent(textToken.T) + ' ';
            }
          }
        }
        resolve(rawText);
      });

      pdfParser.parseBuffer(buffer);
    });

    if (!extractedText.trim()) {
      return NextResponse.json({ error: 'Failed to extract text from document layers' }, { status: 422 });
    }
    
    return NextResponse.json({ text: extractedText });
  } catch (error: any) {
    console.error("Server-side PDF parsing failed:", error);
    return NextResponse.json(
      { error: error.message || 'Internal processing error on document layers' }, 
      { status: 500 }
    );
  }
}