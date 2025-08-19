import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: '/command-center',
        destination: '/',
        permanent: false, // 302 during transition
      },
      {
        source: '/agent-network',
        destination: '/fleet',
        permanent: false,
      },
      {
        source: '/intelligence',
        destination: '/logs',
        permanent: false,
      },
      {
        source: '/operations', 
        destination: '/missions',
        permanent: false,
      },
      {
        source: '/systems',
        destination: '/settings',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
