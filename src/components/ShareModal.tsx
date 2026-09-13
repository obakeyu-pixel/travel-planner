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
  Upload
} from 'lucide-react';
import type { TripPlan } from '../types/travel';
import { TUNNEL_URL } from '../config/tunnelUrl';

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
  const [connectionMode, setConnectionMode] = useState<'tunnel' | 'local'>('tunnel');

  // クラウド・トンネルURL（現在のブラウザがローカル以外ならそのオリジン、そうでなければ最新トンネルURL）
  const currentOrigin = typeof window !== 'undefined' && window.location.origin && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')
    ? window.location.origin
    : TUNNEL_URL;
  const tunnelUrl = currentOrigin;

  // ローカルIP
  const initialHostIp = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? window.location.hostname
    : '192.168.2.116';

  const [hostIp, setHostIp] = useState(initialHostIp);
  const [showIpEdit, setShowIpEdit] = useState(false);

  if (!isOpen) return null;

  // 使用するURL（トンネルまたはローカル）
  const activeMobileUrl = connectionMode === 'tunnel' ? tunnelUrl : `http://${hostIp}:5173/`;

  // 旅行プランのデータを含めた共有リンク（ハッシュパラメータ）
  const generateShareUrl = () => {
    try {
      const jsonStr = JSON.stringify(tripPlan);
      // UTF-8対応のBase64エンコード
      const base64 = btoa(encodeURIComponent(jsonStr));
      return `${activeMobileUrl}#share=${base64}`;
    } catch (e) {
      return activeMobileUrl;
    }
  };

  const shareUrl = generateShareUrl();

  const handleCopyLocalUrl = () => {
    navigator.clipboard.writeText(activeMobileUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
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
      <div className="modal-dialog share-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Smartphone size={20} className="icon-primary" />
            <h3 className="modal-title">スマホで開く＆友達と共有</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>×</button>
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
            友達に送る・共有
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'mobile' ? (
            <div className="mobile-qr-section">
              {/* 接続モード切り替え */}
              <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', marginBottom: '12px' }}>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: connectionMode === 'tunnel' ? '#fff' : 'transparent',
                    color: connectionMode === 'tunnel' ? '#0284c7' : 'var(--text-muted)',
                    boxShadow: connectionMode === 'tunnel' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                  }}
                  onClick={() => setConnectionMode('tunnel')}
                >
                  🌐 クラウド接続（推奨・Wi-Fi不要）
                </button>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: connectionMode === 'local' ? '#fff' : 'transparent',
                    color: connectionMode === 'local' ? '#0284c7' : 'var(--text-muted)',
                    boxShadow: connectionMode === 'local' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                  }}
                  onClick={() => setConnectionMode('local')}
                >
                  📶 同一Wi-Fi接続（ローカル）
                </button>
              </div>

              <p className="modal-subtext">
                {connectionMode === 'tunnel' ? (
                  <>セキュアな専用URLを発行しました！<strong>Wi-Fi接続の制限やWindowsファイアウォールに関係なく、スマホのカメラですぐに開けます。</strong></>
                ) : (
                  <>お手持ちのスマートフォンのカメラを下の <strong>QRコード</strong> に向けると、ブラウザですぐに開きます！</>
                )}
              </p>

              <div className="qr-container-card">
                <div className="qr-box">
                  <QRCodeSVG 
                    value={activeMobileUrl} 
                    size={200}
                    level="M"
                    includeMargin={true}
                  />
                </div>
                {connectionMode === 'tunnel' ? (
                  <div className="wifi-notice" style={{ color: '#0369a1', background: '#e0f2fe' }}>
                    <span>✨ <strong>パスワード不要！</strong> スマホのカメラをかざすだけで直接安全に開きます。</span>
                  </div>
                ) : (
                  <div className="wifi-notice">
                    <Wifi size={16} className="wifi-icon" />
                    <span>※ PCと同じ自宅やオフィスのWi-Fiに接続したスマホで読み取ってください。</span>
                  </div>
                )}
              </div>

              <div className="url-copy-box">
                <span className="url-label">スマホ用URL:</span>
                <div className="url-input-group">
                  <input 
                    type="text" 
                    readOnly 
                    value={activeMobileUrl} 
                    className="form-control url-display-input"
                  />
                  <button className="btn btn-secondary btn-sm" onClick={handleCopyLocalUrl}>
                    {copiedUrl ? <Check size={16} color="#16a34a" /> : <Copy size={16} />}
                    {copiedUrl ? 'コピー済' : 'URLコピー'}
                  </button>
                </div>
              </div>

              {/* スマホで開けない場合の接続ガイド */}
              <div style={{ marginTop: '16px', background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.8rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Wifi size={14} className="icon-primary" /> スマホでページが開かない場合のチェック項目:
                </div>
                <ul style={{ paddingLeft: '18px', margin: '0 0 8px 0', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  <li><strong>Wi-Fiの確認:</strong> スマホのモバイル通信（4G/5G）ではなく、パソコンと<strong>同じWi-Fiルーター（SSID）</strong>にスマホが接続されていることを確認してください。</li>
                  <li><strong>IPアドレスの変更:</strong> 別のネットワークに移動した場合は、以下の設定からパソコンの新しいIPアドレスを入力できます。</li>
                </ul>
                <button
                  type="button"
                  className="link-btn-text"
                  style={{ fontSize: '0.76rem' }}
                  onClick={() => setShowIpEdit(!showIpEdit)}
                >
                  {showIpEdit ? '▲ IPアドレス設定を閉じる' : '⚙️ IPアドレスを手動変更する（上級者向け）'}
                </button>

                {showIpEdit && (
                  <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={hostIp}
                      onChange={(e) => setHostIp(e.target.value.trim())}
                      placeholder="例: 192.168.2.116"
                      style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => alert(`IPアドレスを ${hostIp} に更新しました！QRコードも再生成されました。`)}
                    >
                      更新
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="group-share-section">
              <p className="modal-subtext">
                この旅行プランのデータをリンクにして友達に送ることができます。友達のスマホでも全く同じしおりが表示されます！
              </p>

              <div className="share-link-card">
                <span className="share-card-title">
                  <Share2 size={16} /> プラン共有リンク（LINEやメールで送信）
                </span>
                <p className="share-sub">このリンクを開くと、友達の画面に現在の旅行内容が自動で読み込まれます。</p>
                <button className="btn btn-primary" onClick={handleCopyShareLink} style={{ width: '100%', marginTop: '10px' }}>
                  {copiedShareLink ? <Check size={18} /> : <Copy size={18} />}
                  {copiedShareLink ? '共有リンクをコピーしました！' : '共有リンクをコピーする'}
                </button>
              </div>

              <div className="file-backup-grid">
                <div className="backup-card">
                  <span className="backup-title"><Download size={16} /> しおりファイルを保存</span>
                  <p className="backup-desc">旅行の記録ファイル（JSON）としてPCやスマホにダウンロード保存できます。</p>
                  <button className="btn btn-secondary btn-sm" onClick={handleExportJson} style={{ marginTop: '8px' }}>
                    ファイルをダウンロード
                  </button>
                </div>

                <div className="backup-card">
                  <span className="backup-title"><Upload size={16} /> しおりファイルを復元</span>
                  <p className="backup-desc">保存したしおりファイルを読み込んでアプリに表示します。</p>
                  <label className="btn btn-outline btn-sm file-upload-btn" style={{ marginTop: '8px', cursor: 'pointer' }}>
                    ファイルを選択
                    <input type="file" accept=".json" onChange={handleFileImport} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>閉じる</button>
        </div>
      </div>
    </div>
  );
};
