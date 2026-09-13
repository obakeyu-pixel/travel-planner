import { startTunnel } from 'untun';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('⚡ Starting Cloudflare Quick Tunnel for port 5173...');
  try {
    const tunnel = await startTunnel({ port: 5173 });
    const url = await tunnel.getURL();
    console.log('\n======================================================');
    console.log(`📱 Smartphone Tunnel URL: ${url}`);
    console.log('======================================================\n');

    const configDir = path.resolve('src/config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    const configPath = path.join(configDir, 'tunnelUrl.ts');
    fs.writeFileSync(configPath, `// 自動生成されるトンネルURL設定\nexport const TUNNEL_URL = '${url}';\n`);
  } catch (err) {
    console.error('Failed to start tunnel:', err);
  }
}

main();
