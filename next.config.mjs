/** @type {import('next').NextConfig} */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

let supabaseHostname;
try {
  supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;
} catch {
  supabaseHostname = undefined;
}

const nextConfig = {
  reactStrictMode: true,
  images: {
    // Les photos sont déjà compressées en WebP à l'upload (voir src/lib/image.ts),
    // donc on sert les fichiers tels quels au lieu de passer par le pipeline
    // d'optimisation d'images de Vercel (payant au-delà d'un quota mensuel
    // sur le plan gratuit -> erreur 402 sur certaines tailles une fois dépassé).
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Supabase Storage public objects
      ...(supabaseHostname
        ? [
            {
              protocol: "https",
              hostname: supabaseHostname,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
      // Fallback: allow any *.supabase.co storage bucket (safe: public objects only)
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
