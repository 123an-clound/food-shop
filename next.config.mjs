/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
  images: {
    qualities: [60, 75],
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
};

export default nextConfig;
