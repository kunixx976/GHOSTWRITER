/** @type {import('next').NextConfig} */
const nextConfig = {
  // This is the most important part for pdfjs-dist
  transpilePackages: ['mermaid', 'framer-motion'],
  serverExternalPackages: ['pdfjs-dist', 'pdf-parse', '@langchain/core', '@langchain/openai', '@langchain/community', '@langchain/textsplitters', 'langchain', '@langchain/classic', 'officeparser', 'katex'],
};

export default nextConfig;