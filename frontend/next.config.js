/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_ID,
    AWS_SECRET_ACESS_KEY: process.env.AWS_SECRET_KEY,
    AWS_REGION: process.env.AWS_REGION,
  },
  images: {
    domains: ['fakeface.rest']
  },
}

module.exports = nextConfig
