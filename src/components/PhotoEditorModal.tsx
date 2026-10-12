import React, { useState } from 'react';
import { 
  Camera, 
  Upload, 
  Link as LinkIcon, 
  Trash2, 
  Check, 
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import './PhotoEditorModal.css';

interface PhotoEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  currentImageUrl?: string;
  onSave: (newImageUrl?: string) => void;
}

// テーマ別の厳選プリセット写真
const PHOTO_PRESETS: { category: string; photos: { label: string; url: string }[] }[] = [
  {
    category: '寺院・歴史・和風',
    photos: [
      { label: '神社・鳥居', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80' },
      { label: '古都の街並み', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80' },
      { label: '竹林の小道', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80' },
    ]
  },
  {
    category: '海・自然・絶景',
    photos: [
      { label: '青い海とビーチ', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80' },
      { label: '雄大な山と森', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80' },
      { label: '夕暮れ・サンセット', url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80' },
    ]
  },
  {
    category: '温泉・宿・癒やし',
    photos: [
      { label: '温泉・露天風呂', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80' },
      { label: '和風旅館・庭園', url: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=800&q=80' },
    ]
  },
  {
    category: 'グルメ・カフェ',
    photos: [
      { label: 'カフェ・スイーツ', url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80' },
      { label: '海鮮料理・お刺身', url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80' },
      { label: 'お肉・BBQ料理', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80' },
    ]
  }
];

export const PhotoEditorModal: React.FC<PhotoEditorModalProps> = ({
  isOpen,
  onClose,
  title,
  currentImageUrl,
  onSave,
}) => {
  const [selectedUrl, setSelectedUrl] = useState<string | undefined>(currentImageUrl || '');
  const [urlInput, setUrlInput] = useState<string>(currentImageUrl || '');
  const [activeTab, setActiveTab] = useState<'upload' | 'preset' | 'url'>('upload');

  if (!isOpen) return null;

  // ファイルアップロード（画像をBase64に自動圧縮して保持）
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 画像ファイルかチェック
    if (!file.type.startsWith('image/')) {
      alert('画像ファイル（JPEG, PNG, WebPなど）を選択してください。');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // 最大幅800pxに自動リサイズして容量節約
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scaleSize = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
        canvas.width = img.width * scaleSize;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
        setSelectedUrl(compressedBase64);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // URL直接入力
  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      setSelectedUrl(urlInput.trim());
    }
  };

  // 写真なしにする
  const handleClearPhoto = () => {
    setSelectedUrl('');
    setUrlInput('');
  };

  const handleSave = () => {
    onSave(selectedUrl ? selectedUrl : undefined);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog photo-editor-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Camera size={20} className="icon-primary" />
            <div>
              <h3 className="modal-title">写真をカスタマイズ</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{title}</div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        {/* プレビュー表示 */}
        <div className="photo-preview-wrap">
          {selectedUrl ? (
            <div className="photo-preview-box">
              <img src={selectedUrl} alt="プレビュー" className="photo-preview-img" />
              <button 
                type="button" 
                className="btn-remove-photo" 
                onClick={handleClearPhoto}
                title="写真を外して「写真なし」にする"
              >
                <Trash2 size={14} /> 写真なしにする
              </button>
            </div>
          ) : (
            <div className="photo-no-image-box">
              <ImageIcon size={32} color="var(--text-muted)" />
              <p>【写真なし】</p>
              <span>無理に写真を設定せず、すっきりとしたアイコンと色合いで表示されます。</span>
            </div>
          )}
        </div>

        {/* タブ切り替え */}
        <div className="photo-tabs">
          <button
            type="button"
            className={`photo-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <Upload size={14} /> スマホ・PCから選択
          </button>
          <button
            type="button"
            className={`photo-tab-btn ${activeTab === 'preset' ? 'active' : ''}`}
            onClick={() => setActiveTab('preset')}
          >
            <Sparkles size={14} /> プリセットから選ぶ
          </button>
          <button
            type="button"
            className={`photo-tab-btn ${activeTab === 'url' ? 'active' : ''}`}
            onClick={() => setActiveTab('url')}
          >
            <LinkIcon size={14} /> URL直接入力
          </button>
        </div>

        <div className="modal-body">
          {/* 1. ファイルアップロード */}
          {activeTab === 'upload' && (
            <div className="photo-tab-pane">
              <p className="modal-subtext" style={{ marginBottom: '12px' }}>
                お手持ちのスマートフォンやパソコンに保存されている写真を設定できます。
              </p>
              <label className="upload-dropzone">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <Upload size={28} className="icon-primary" />
                <span className="dropzone-text">写真をここから選択</span>
                <span className="dropzone-sub">スマホのカメラ撮影・アルバム写真にも対応</span>
              </label>
            </div>
          )}

          {/* 2. プリセット写真選択 */}
          {activeTab === 'preset' && (
            <div className="photo-tab-pane">
              <p className="modal-subtext" style={{ marginBottom: '12px' }}>
                行き先にぴったりの写真を選んでタップしてください。
              </p>
              <div className="preset-categories-wrap">
                {PHOTO_PRESETS.map((cat) => (
                  <div key={cat.category} className="preset-category-block">
                    <div className="preset-cat-title">{cat.category}</div>
                    <div className="preset-photos-grid">
                      {cat.photos.map((p) => {
                        const isSelected = selectedUrl === p.url;
                        return (
                          <div
                            key={p.url}
                            className={`preset-photo-thumb ${isSelected ? 'selected' : ''}`}
                            onClick={() => setSelectedUrl(p.url)}
                          >
                            <img src={p.url} alt={p.label} loading="lazy" />
                            <span className="preset-photo-label">{p.label}</span>
                            {isSelected && <span className="check-badge"><Check size={12} /></span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. URL直接入力 */}
          {activeTab === 'url' && (
            <div className="photo-tab-pane">
              <p className="modal-subtext" style={{ marginBottom: '12px' }}>
                Webサイト上の画像URLを入力して設定できます。
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="form-control"
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleApplyUrl}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  プレビュー
                </button>
              </div>
            </div>
          )}

          {/* フッターアクション */}
          <div className="photo-modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClearPhoto}
              style={{ color: '#ef4444' }}
            >
              写真なしにする
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                キャンセル
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSave}>
                <Check size={16} /> 写真を決定・保存
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
