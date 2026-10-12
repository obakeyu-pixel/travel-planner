import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Smartphone, 
  Share2, 
  Copy, 
  Check, 
  Wifi, 
  Users, 
  Download, 
  Upload, 
  ExternalLink,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import type { TripPlan } from '../types/travel';
import { TUNNEL_URL } from '../config/tunnelUrl';
import { NETWORK_CONFIG } from '../config/networkConfig';

interface ShareModalProps {
  tripPlan: TripPlan;
  isOpen: boolean;
  onClose: () => void;
  onImportPlan: (imported: TripPlan) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  tripPlan,
  isOpen,
  onClose,
  onImportPlan,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'mobile' | 'share'>('mobile');
  
  // トンネルURLが設定されている場合は、Wi-Fi環境に依存しないクラウドトンネルをデフォルト推奨
  const hasValidTunnel = Boolean(TUNNEL_URL && TUNNEL_URL.includes('trycloudflare.com'));
  const [connectionMode, setConnectionMode] = useState<'tunnel' | 'local'>(hasValidTunnel ? 'tunnel' : 'local');
  // QRコードが細かすぎてカメラで読めなくなる事故を防ぐため、デフォルトは高速・軽量接続（false）
  const [syncTripData, setSyncTripData] = useState(false);

  // クラウド・トンネルURL
  const currentOrigin = typeof window !== 'undefined' && window.location.origin && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')
    ? window.location.origin
    : TUNNEL_URL;
  const tunnelUrl = currentOrigin;

  // ローカルIP（ブラウザで既にIP接続していればそれ、ローカルホストならnetworkConfigに保存されたPCのWi-Fi IP）
  const detectedIp = NETWORK_CONFIG.localIp || '192.168.2.116';
  const initialHostIp = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? window.location.hostname
    : detectedIp;

  const [hostIp, setHostIp] = useState(initialHostIp);
  const [showHelp, setShowHelp] = useState(false);

  if (!isOpen) return null;

  // ベースとなるURL（ローカルまたはトンネル）
  const baseAppUrl = connectionMode === 'local' ? `http://${hostIp}:5173/` : tunnelUrl;

  // 旅行プランのデータを含めた共有ハッシュURL
  const generateShareUrl = (targetBaseUrl: string) => {
    try {
      const jsonStr = JSON.stringify(tripPlan);
      // UTF-8対応のBase64エンコード
      const base64 = btoa(encodeURIComponent(jsonStr));
      return `${targetBaseUrl}#share=${base64}`;
    } catch (e) {
      return targetBaseUrl;
    }
  };

  // QRコード用URL（スマホカメラでの読み取り性を最優先するため、syncTripDataがONでもBase64が長すぎる場合はクリーンURLを使用）
  const fullShareUrl = generateShareUrl(baseAppUrl);
  const isUrlTooLongForQr = syncTripData && fullShareUrl.length > 800;
  // QRコードは読み取りやすさを保証するURLを採用
  const qrDisplayUrl = (syncTripData && !isUrlTooLongForQr) ? fullShareUrl : baseAppUrl;
  const activeMobileUrl = syncTripData ? fullShareUrl : baseAppUrl;

  const handleCopyUrl = (urlToCopy: string) => {
    navigator.clipboard.writeText(urlToCopy);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyShareLink = () => {
    const fullShareUrl = generateShareUrl(baseAppUrl);
    navigator.clipboard.writeText(fullShareUrl);
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2000);
  };

  // JSONファイルとしてバックアップ保存
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tripPlan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${tripPlan.title || '旅ぷらん'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // JSONファイルを読み込んで復元
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.title && parsed.schedules) {
          onImportPlan(parsed);
          alert('旅行しおりを正常に読み込みました！');
          onClose();
        } else {
          alert('有効な旅行しおりファイルではありませんでした。');
        }
      } catch (err) {
        alert('ファイルの読み込みに失敗しました。');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog share-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Smartphone size={22} className="icon-primary" />
            <h3 className="modal-title">スマホで開く＆しおり共有</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="閉じる">×</button>
        </div>

        {/* タブ切り替え */}
        <div className="share-modal-tabs">
          <button
            className={`share-tab-btn ${activeTab === 'mobile' ? 'active' : ''}`}
            onClick={() => setActiveTab('mobile')}
          >
            <Smartphone size={16} />
            スマホのカメラで開く（QRコード）
          </button>
          <button
            className={`share-tab-btn ${activeTab === 'share' ? 'active' : ''}`}
            onClick={() => setActiveTab('share')}
          >
            <Users size={16} />
            友達に送る・バックアップ
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px' }}>
          {activeTab === 'mobile' ? (
            <div className="mobile-qr-section">
              {/* 接続モード切り替えタブ */}
              <div style={{ display: 'flex', background: '#e2e8f0', padding: '4px', borderRadius: '10px', marginBottom: '16px' }}>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: connectionMode === 'local' ? '#fff' : 'transparent',
                    color: connectionMode === 'local' ? '#0284c7' : '#64748b',
                    boxShadow: connectionMode === 'local' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => setConnectionMode('local')}
                >
                  <Wifi size={15} />
                  📶 同じWi-Fiで開く（ローカル・推奨）
                </button>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: connectionMode === 'tunnel' ? '#fff' : 'transparent',
                    color: connectionMode === 'tunnel' ? '#0284c7' : '#64748b',
                    boxShadow: connectionMode === 'tunnel' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => setConnectionMode('tunnel')}
                >
                  <ExternalLink size={15} />
                  🌐 クラウド接続（トンネル）
                </button>
              </div>

              {/* かんたん3ステップ案内 */}
              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0369a1', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} /> スマホで開くかんたん3ステップ:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '0.75rem', color: '#0f172a' }}>
                  <div style={{ background: '#fff', padding: '8px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e0f2fe' }}>
                    <div style={{ fontWeight: 800, color: '#0284c7', marginBottom: '2px' }}>① Wi-Fi接続</div>
                    <div>スマホをPCと<strong>同じWi-Fi</strong>に接続</div>
                  </div>
                  <div style={{ background: '#fff', padding: '8px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e0f2fe' }}>
                    <div style={{ fontWeight: 800, color: '#0284c7', marginBottom: '2px' }}>② カメラ起動</div>
                    <div>標準カメラで下の<strong>QRをスキャン</strong></div>
                  </div>
                  <div style={{ background: '#fff', padding: '8px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e0f2fe' }}>
                    <div style={{ fontWeight: 800, color: '#0284c7', marginBottom: '2px' }}>③ タップ</div>
                    <div>通知をタップして<strong>スマホで即表示！</strong></div>
                  </div>
                </div>
              </div>

              {/* プランデータ同期スイッチ */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-light)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    ✨ 作成中の旅行しおり（「{tripPlan.title}」）をスマホに同期して開く
                  </span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    ONにすると、スマホで開いた瞬間にこの旅程がそのまま反映されます
                  </span>
                </div>
                <input
                  type="checkbox"
                  id="sync-plan-toggle"
                  checked={syncTripData}
                  onChange={(e) => setSyncTripData(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0284c7' }}
                />
              </div>

              {/* QRコード表示カード */}
              <div className="qr-container-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '18px', background: '#fafbfc', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <div className="qr-box" style={{ background: '#fff', padding: '16px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                  <QRCodeSVG 
                    value={qrDisplayUrl} 
                    size={210}
                    level="M"
                    includeMargin={true}
                  />
                </div>

                {isUrlTooLongForQr && (
                  <div style={{ marginTop: '10px', fontSize: '0.74rem', color: '#b45309', background: '#fef3c7', padding: '6px 12px', borderRadius: '8px', textAlign: 'center', maxWidth: '380px' }}>
                    ⚠️ 旅行プランデータが大きいため、QRコードは確実に開けるアクセスURLを表示しています。データ共有は下の「URLコピー」でLINE等に貼り付けてお送りください。
                  </div>
                )}

                {connectionMode === 'local' ? (
                  <div style={{ marginTop: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 700, color: '#0f766e', background: '#ccfbf1', padding: '4px 12px', borderRadius: '20px' }}>
                      <Wifi size={14} /> パソコンのローカルIPで待受中 ({hostIp}:5173)
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#0369a1', background: '#e0f2fe', padding: '4px 12px', borderRadius: '20px' }}>
                      🌐 クラウド経由（4G/5G・別Wi-Fiからでも開けます）
                    </div>
                  </div>
                )}
              </div>

              {/* URL表示＆コピー */}
              <div className="url-copy-box" style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span className="url-label" style={{ margin: 0 }}>スマホから直接開くURL:</span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Safari / Chrome等に入力可能</span>
                </div>
                <div className="url-input-group">
                  <input 
                    type="text" 
                    readOnly 
                    value={activeMobileUrl} 
                    className="form-control url-display-input"
                    style={{ fontSize: '0.82rem', background: '#fff' }}
                  />
                  <button className="btn btn-secondary btn-sm" onClick={() => handleCopyUrl(activeMobileUrl)}>
                    {copiedUrl ? <Check size={16} color="#16a34a" /> : <Copy size={16} />}
                    {copiedUrl ? 'コピー完了' : 'URLコピー'}
                  </button>
                </div>
              </div>

              {/* トラブルシューティング（開けない時の対策） */}
              <div style={{ marginTop: '16px', background: '#fff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #fed7aa', fontSize: '0.8rem' }}>
                <div 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                  onClick={() => setShowHelp(!showHelp)}
                >
                  <div style={{ fontWeight: 800, color: '#c2410c', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <HelpCircle size={15} /> スマホでページが開かない・読み込めない時は？
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#c2410c', textDecoration: 'underline' }}>
                    {showHelp ? '閉じる ▲' : '解決方法を見る ▼'}
                  </span>
                </div>

                {showHelp && (
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #fed7aa', lineHeight: 1.6 }}>
                    <div style={{ marginBottom: '8px' }}>
                      <strong style={{ color: '#0f172a' }}>1. スマホのWi-Fiを確認</strong>
                      <div style={{ color: '#475569', fontSize: '0.76rem', paddingLeft: '8px' }}>
                        スマホが4G/5G通信になっていませんか？PCと同じ自宅ルーター（Wi-Fi）に接続してください。
                      </div>
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                      <strong style={{ color: '#0f172a' }}>2. Windowsファイアウォールを許可</strong>
                      <div style={{ color: '#475569', fontSize: '0.76rem', paddingLeft: '8px' }}>
                        Windowsがポート5173へのアクセスを遮断していることがあります。<br />
                        プロジェクトフォルダにある <code>setup-firewall.bat</code> をダブルクリックして実行すると一発で許可されます。
                      </div>
                    </div>

                    <div>
                      <strong style={{ color: '#0f172a' }}>3. パソコンのIPアドレスが違う場合</strong>
                      <div style={{ color: '#475569', fontSize: '0.76rem', paddingLeft: '8px' }}>
                        別のWi-Fiに切り替えた場合は、下の入力欄からIPアドレスを手動修正できます。
                        <div style={{ marginTop: '6px', display: 'flex', gap: '6px' }}>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={hostIp}
                            onChange={(e) => setHostIp(e.target.value.trim())}
                            placeholder="例: 192.168.2.116"
                            style={{ fontSize: '0.8rem', padding: '4px 8px', maxWidth: '200px' }}
                          />
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => alert(`IPアドレスを ${hostIp} に設定しました！QRコードを更新しました。`)}
                          >
                            IP更新
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="group-share-section">
              <p className="modal-subtext" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                この旅行プランのデータをリンクにして友達に送ることができます。友達のスマホでも全く同じしおりが表示されます！
              </p>

              <div className="share-link-card" style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                <span className="share-card-title" style={{ fontSize: '0.92rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
                  <Share2 size={16} /> プラン共有リンク（LINEやメールで送信）
                </span>
                <p className="share-sub" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', marginBottom: '12px' }}>
                  このリンクを開くと、友達の画面に現在の旅行内容が自動で読み込まれます。
                </p>
                <button className="btn btn-primary" onClick={handleCopyShareLink} style={{ width: '100%' }}>
                  {copiedShareLink ? <Check size={18} /> : <Copy size={18} />}
                  {copiedShareLink ? '共有リンクをコピーしました！' : '共有リンクをコピーする'}
                </button>
              </div>

              <div className="file-backup-grid" style={{ marginTop: '16px' }}>
                <div className="backup-card" style={{ padding: '14px', borderRadius: '8px', border: '1px solid var(--border-light)', background: '#fff' }}>
                  <span className="backup-title" style={{ fontWeight: 800, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Download size={16} /> しおりファイルを保存
                  </span>
                  <p className="backup-desc" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', marginBottom: '10px' }}>
                    旅行の記録ファイル（JSON）としてPCやスマホにダウンロード保存できます。
                  </p>
                  <button className="btn btn-secondary btn-sm" onClick={handleExportJson} style={{ width: '100%' }}>
                    ファイルを保存
                  </button>
                </div>

                <div className="backup-card" style={{ padding: '14px', borderRadius: '8px', border: '1px solid var(--border-light)', background: '#fff' }}>
                  <span className="backup-title" style={{ fontWeight: 800, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Upload size={16} /> しおりファイルを復元
                  </span>
                  <p className="backup-desc" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', marginBottom: '10px' }}>
                    保存したしおりファイルを読み込んでアプリに復元します。
                  </p>
                  <label className="btn btn-outline btn-sm file-upload-btn" style={{ width: '100%', cursor: 'pointer', textAlign: 'center', display: 'block', margin: 0 }}>
                    ファイルを選択
                    <input type="file" accept=".json" onChange={handleFileImport} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>閉じる</button>
        </div>
      </div>
    </div>
  );
};
