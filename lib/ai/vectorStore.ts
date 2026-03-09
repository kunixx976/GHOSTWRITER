import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";

const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    configuration: {
        baseURL: process.env.OPENAI_BASE_URL || undefined,
    }
});

let vectorStore: MemoryVectorStore | null = null;

export const initializeVectorStore = async (chunks: Document[]) => {
    console.log(`Initializing MemoryVectorStore with ${chunks.length} chunks...`);
    vectorStore = await MemoryVectorStore.fromDocuments(chunks, embeddings);
    return vectorStore;
};

export const queryVectorStore = async (query: string, k = 5) => {
    if (!vectorStore) {
        console.warn("VectorStore not initialized. Returning empty context.");
        return "";
    }

    console.log(`Searching vector store for: ${query}`);
    const results = await vectorStore.similaritySearch(query, k);
    return results.map(r => r.pageContent).join("\n\n---\n\n");
};
