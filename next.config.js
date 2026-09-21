/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Next 13.5.x nécessite ce flag pour utiliser les Server Actions
  // (formulaires connexion/inscription). Devient inutile si vous upgradez
  // vers Next 14+ où c'est stable par défaut.
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;