import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";

export const processPDF = async (file: Blob) => {
    try {
        console.log("processPDF: Starting extraction");

        // Convert Blob to Buffer for better compatibility in Node.js
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        let rawDocs = [];
        try {
            const loader = new WebPDFLoader(new Blob([buffer], { type: "application/pdf" }));
            rawDocs = await loader.load();
        } catch (loaderError) {
            console.warn("PDFLoader failed, trying officeparser fallback:", loaderError);
            const officeParser = await import("officeparser") as any;
            const text = await (officeParser.parseOfficeAsync || officeParser.parseAsync || officeParser.default?.parseOfficeAsync)(buffer as any);
            rawDocs = [{ pageContent: text, metadata: {} }];
        }

        if (rawDocs.length === 0 || !rawDocs[0].pageContent) {
            console.warn("processPDF: No text extracted from PDFLoader, trying officeparser fallback");
            const officeParser = await import("officeparser") as any;
            const text = await (officeParser.parseOfficeAsync || officeParser.parseAsync || officeParser.default?.parseOfficeAsync)(buffer as any);
            rawDocs = [{ pageContent: text, metadata: {} }];
        }

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });

        const chunks = await splitter.splitDocuments(rawDocs);
        console.log(`processPDF: Split into ${chunks.length} chunks`);
        return chunks;
    } catch (error: any) {
        console.error("processPDF error details:", error);
        throw new Error(`PDF Processing Failed: ${error.message}`);
    }
};

