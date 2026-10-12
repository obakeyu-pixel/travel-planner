import { startTunnel } from 'untun';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function run() {
  console.log('⚡ Starting Cloudflare Tunnel for port 5173...');
  try {
    const tunnel = await startTunnel({
      url: 'http://localhost:5173',
      acceptCloudflareNotice: true,
    });

    const url = await tunnel.getURL();
    console.log('\n======================================================');
    console.log(`📱 スマホ用 トンネルURL: ${url}`);
    console.log('  （同じWi-Fiにいなくても、4G/5GでもこのURLで開けます！）');
    console.log('======================================================\n');

    const configDir = path.resolve(projectRoot, 'src/config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    const configPath = path.join(configDir, 'tunnelUrl.ts');
    fs.writeFileSync(configPath, `// 自動生成されるトンネルURL設定\nexport const TUNNEL_URL = '${url}';\n`, 'utf-8');

    // プロセス維持
    process.on('SIGINT', () => {
      console.log('トンネルを停止します...');
      process.exit(0);
    });
  } catch (err) {
    console.error('トンネルの起動に失敗しました:', err);
  }
}

run();
