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
    
    const extractedText = await new Promise<string>((resolve, reject) => {
      const pdfParser = new (PDFParser as any)();
      
      pdfParser.on('pdfParser_dataError', (errData: any) => reject(errData.parserError));
      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        let structuredText = '';
        
        // Loop through each page using its explicit index to retain absolute page structure
        pdfData.Pages.forEach((page: any, pageIdx: number) => {
          const absolutePageNumber = pageIdx + 1;
          let pageText = '';

          if (page.Texts && page.Texts.length > 0) {
            for (const textObj of page.Texts) {
              for (const textToken of textObj.R) {
                pageText += decodeURIComponent(textToken.T) + ' ';
              }
            }
          }

          // Append structured page delimiters to the text payload
          structuredText += `--- START OF PDF PAGE SHEET ${absolutePageNumber} ---\n${pageText.trim()}\n\n`;
        });

        resolve(structuredText);
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