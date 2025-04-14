let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  webpack: (config, { isServer }) => {
    // Handle binary files and problematic modules
    if (!isServer) {
      // Client-side bundle fallbacks
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        perf_hooks: false,
        stream: false,
        "pdfjs-dist": false,
      };
    }

    // Prevent webpack from processing binary files directly
    config.module.rules.push({
      test: /\.(node|bin|wasm)$/,
      use: 'file-loader',
      type: 'javascript/auto',
    });

    return config;
  },
  // Disable telemetry to avoid file access issues
  telemetry: {
    disableConsoleLog: true
  },
  // Disable instrumentation to avoid .next/trace file issues
  tracing: {
    ignoreRootSpan: true,
    disableInstrumentation: true
  }
}

mergeConfig(nextConfig, userConfig)

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      }
    } else {
      nextConfig[key] = userConfig[key]
    }
  }
}

export default nextConfig
