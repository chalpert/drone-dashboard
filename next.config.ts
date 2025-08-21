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
        destination: '/fleet',
        permanent: false,
      },
      {
        source: '/operations', 
        destination: '/fleet',
        permanent: false,
      },
      {
        source: '/systems',
        destination: '/admin',
        permanent: false,
      },
      {
        source: '/missions',
        destination: '/fleet',
        permanent: false,
      },
      {
        source: '/logs',
        destination: '/fleet',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
