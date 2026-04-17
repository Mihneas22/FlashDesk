/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  transpilePackages: ['remark-math', 'rehype-katex', 'react-markdown'],
};
export default nextConfig;
