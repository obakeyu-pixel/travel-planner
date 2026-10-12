import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import os from 'os'
import fs from 'fs'
import path from 'path'

function getLocalIp(): string {
  const nets = os.networkInterfaces()
  // Wi-Fi やイーサネットなどの有効なIPv4を探す
  for (const name of Object.keys(nets)) {
    const netList = nets[name]
    if (!netList) continue
    for (const net of netList) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address
      }
    }
  }
  return 'localhost'
}

function autoNetworkConfigPlugin(): Plugin {
  return {
    name: 'auto-network-config',
    configResolved() {
      const localIp = getLocalIp()
      const port = 5173
      const content = `// 自動生成されるローカルネットワーク設定
export const NETWORK_CONFIG = {
  localIp: '${localIp}',
  port: ${port},
  localUrl: 'http://${localIp}:${port}/',
};
`
      const configPath = path.resolve(import.meta.dirname, 'src/config/networkConfig.ts')
      try {
        fs.writeFileSync(configPath, content, 'utf-8')
        console.log(`\n======================================================`)
        console.log(`📱 スマホ用ローカルURL: http://${localIp}:${port}/`)
        console.log(`======================================================\n`)
      } catch (e) {
        console.error('Failed to write networkConfig.ts', e)
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), autoNetworkConfigPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  },
})

