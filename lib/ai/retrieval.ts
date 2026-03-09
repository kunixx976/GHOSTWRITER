import { queryVectorStore } from "./vectorStore";

export const getRelevantContext = async (query: string, k = 5) => {
    console.log(`Searching for context relevant to: ${query}`);
    return await queryVectorStore(query, k);
};
