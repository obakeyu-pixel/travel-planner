import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Users, 
  QrCode, 
  UserCheck, 
  Copy, 
  Check, 
  Share2, 
  Crown, 
  X, 
  Sparkles, 
  Plus, 
  Trash2,
  AlertCircle,
  CalendarCheck
} from 'lucide-react';
import type { TripPlan } from '../types/travel';
import type { UserAccount, FriendProfile } from '../types/auth';
import { 
  getStoredFriends, 
  addStoredFriend, 
  removeStoredFriend 
} from '../utils/authStorage';
import { TUNNEL_URL } from '../config/tunnelUrl';
import './GroupManageModal.css';

interface GroupManageModalProps {
  tripPlan: TripPlan;
  currentUser: UserAccount | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTripMembers: (newMembers: string[]) => void;
  onOpenShareModal?: () => void;
}

type ModalTab = 'members' | 'qr' | 'friends';

export const GroupManageModal: React.FC<GroupManageModalProps> = ({
  tripPlan,
  currentUser,
  isOpen,
  onClose,
  onUpdateTripMembers,
  onOpenShareModal,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('members');
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [manualCode, setManualCode] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 友達リストの読み込み
  const reloadFriends = () => {
    setFriends(getStoredFriends());
  };

  useEffect(() => {
    if (isOpen) {
      reloadFriends();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlertInfo({ type, message });
    setTimeout(() => setAlertInfo(null), 3500);
  };

  // 自分のプロフィール情報
  const myName = currentUser?.username || '自分';
  const myAvatarColor = currentUser?.avatarColor || '#0284c7';
  const myId = currentUser?.id || `user-self`;

  // ベースとなるURL（トンネルURLまたは現在のオリジン）
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      if (!origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return origin;
      }
    }
    return TUNNEL_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173');
  };

  // 自分の友達追加QR用URLの生成
  const generateMyFriendQrUrl = () => {
    try {
      const myProfile = {
        id: myId,
        username: myName,
        avatarColor: myAvatarColor,
      };
      const jsonStr = JSON.stringify(myProfile);
      const base64 = btoa(encodeURIComponent(jsonStr));
      const baseUrl = getBaseUrl().replace(/\/$/, '');
      return `${baseUrl}/#add_friend=${base64}`;
    } catch (e) {
      return getBaseUrl();
    }
  };

  const friendQrUrl = generateMyFriendQrUrl();

  // 友達追加リンクのコピー
  const handleCopyLink = () => {
    navigator.clipboard.writeText(friendQrUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // 手動での友達コード/URL取り込み
  const handleImportManualCode = (e: React.FormEvent) => {
    e.preventDefault();
    const input = manualCode.trim();
    if (!input) return;

    try {
      let base64Part = input;
      if (input.includes('#add_friend=')) {
        base64Part = input.split('#add_friend=')[1];
      }
      const jsonStr = decodeURIComponent(atob(base64Part));
      const friendData = JSON.parse(jsonStr);

      if (friendData && friendData.username) {
        if (friendData.username === myName) {
          showAlert('error', '自分自身を友達に追加することはできません。');
          return;
        }

        const res = addStoredFriend({
          id: friendData.id || `friend-${Date.now()}`,
          username: friendData.username,
          avatarColor: friendData.avatarColor || '#10b981',
        });

        showAlert('success', res.message);
        setManualCode('');
        reloadFriends();
      } else {
        showAlert('error', '有効な友達追加コードではありません。');
      }
    } catch (err) {
      showAlert('error', 'コードの読み取りに失敗しました。正しいURLまたはコードを入力してください。');
    }
  };

  // 友達を現在の旅行メンバーに追加
  const handleAddFriendToTrip = (friendName: string) => {
    if (tripPlan.members.includes(friendName)) {
      showAlert('error', `${friendName} さんは既に参加しています。`);
      return;
    }
    const updated = [...tripPlan.members, friendName];
    onUpdateTripMembers(updated);
    showAlert('success', `「${friendName}」さんを旅行メンバーに追加しました！`);
  };

  // メンバーから解除
  const handleRemoveMember = (memberName: string) => {
    if (tripPlan.members.length <= 1) {
      showAlert('error', '最低1名のメンバーが必要です。');
      return;
    }
    if (window.confirm(`「${memberName}」をこの旅行グループから外しますか？`)) {
      const updated = tripPlan.members.filter((m) => m !== memberName);
      onUpdateTripMembers(updated);
      showAlert('success', `${memberName} をグループから解除しました。`);
    }
  };

  // 友達リストから削除
  const handleDeleteFriend = (friend: FriendProfile) => {
    if (window.confirm(`友達リストから「${friend.username}」さんを削除しますか？`)) {
      removeStoredFriend(friend.id);
      reloadFriends();
      showAlert('success', `${friend.username} さんを友達リストから削除しました。`);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog group-manage-dialog" onClick={(e) => e.stopPropagation()}>
        {/* モーダルヘッダー */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={22} className="icon-primary" />
            <div>
              <h3 className="modal-title">旅行グループ ＆ 友達QR管理</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {tripPlan.title}（{tripPlan.members.length}名参加中）
              </div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="閉じる">×</button>
        </div>

        {/* タブナビゲーション */}
        <div className="group-tabs">
          <button
            type="button"
            className={`group-tab-btn ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            <Users size={16} />
            <span>旅行メンバー ({tripPlan.members.length})</span>
          </button>
          <button
            type="button"
            className={`group-tab-btn ${activeTab === 'qr' ? 'active' : ''}`}
            onClick={() => setActiveTab('qr')}
          >
            <QrCode size={16} />
            <span>QRで友達追加</span>
          </button>
          <button
            type="button"
            className={`group-tab-btn ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => { setActiveTab('friends'); reloadFriends(); }}
          >
            <UserCheck size={16} />
            <span>友達リスト ({friends.length})</span>
          </button>
        </div>

        <div className="modal-body" style={{ padding: '16px 20px' }}>
          {/* 通知メッセージ */}
          {alertInfo && (
            <div className={`group-alert ${alertInfo.type}`}>
              {alertInfo.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
              <span>{alertInfo.message}</span>
            </div>
          )}

          {/* 1. 旅行グループメンバー・予定共有タブ */}
          {activeTab === 'members' && (
            <div className="group-tab-content">
              <div className="group-info-card">
                <div className="group-info-row">
                  <span className="group-info-label">旅行しおり:</span>
                  <span className="group-info-val">{tripPlan.title}</span>
                </div>
                <div className="group-info-row">
                  <span className="group-info-label">日程:</span>
                  <span className="group-info-val">{tripPlan.startDate} 〜 {tripPlan.endDate} ({tripPlan.totalDays}日間)</span>
                </div>
                <div className="group-info-row">
                  <span className="group-info-label">作成者:</span>
                  <span className="group-info-val" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Crown size={14} color="#f59e0b" />
                    {tripPlan.members[0] || '作成者'}
                  </span>
                </div>
              </div>

              {/* 予定共有バナー */}
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CalendarCheck size={20} color="#16a34a" />
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#15803d' }}>
                      メンバー全員にしおりの予定を共有
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#166534' }}>
                      タイムライン、持ち物、予算の全計画をスマホで共有できます
                    </div>
                  </div>
                </div>
                {onOpenShareModal && (
                  <button 
                    type="button" 
                    className="btn btn-primary btn-sm"
                    onClick={() => { onClose(); onOpenShareModal(); }}
                    style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}
                  >
                    <Share2 size={14} /> しおり共有
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 className="section-subheading" style={{ margin: 0 }}>
                  参加確定メンバー ({tripPlan.members.length}名)
                </h4>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setActiveTab('friends')}
                  style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={14} /> 友達から追加
                </button>
              </div>

              <div className="members-list-grid">
                {tripPlan.members.map((memberName, idx) => {
                  const isOwner = idx === 0;
                  const isMe = memberName === myName;
                  const friendMatch = friends.find((f) => f.username === memberName);
                  const avatarColor = isMe ? myAvatarColor : (friendMatch?.avatarColor || '#0d9488');

                  return (
                    <div key={memberName} className="member-item-row">
                      <div 
                        className="member-avatar"
                        style={{ backgroundColor: avatarColor }}
                      >
                        {memberName.slice(0, 1)}
                      </div>
                      <div className="member-info-col">
                        <div className="member-name-row">
                          <span className="member-name">{memberName}</span>
                          {isOwner && (
                            <span className="owner-chip"><Crown size={11} /> 作成者</span>
                          )}
                          {isMe && (
                            <span className="me-chip">あなた</span>
                          )}
                        </div>
                        <span className="member-status-text">
                          <UserCheck size={12} color="#16a34a" /> 参加中
                        </span>
                      </div>
                      {!isOwner && (
                        <button
                          type="button"
                          className="btn-remove-member"
                          onClick={() => handleRemoveMember(memberName)}
                          title="グループから外す"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setActiveTab('qr')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', width: '100%', justifyContent: 'center' }}
                >
                  <QrCode size={16} /> QRコードで新しい友達を追加する
                </button>
              </div>
            </div>
          )}

          {/* 2. QRコードで友達追加タブ（ユーザー要望のメイン機能） */}
          {activeTab === 'qr' && (
            <div className="group-tab-content">
              <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  <Sparkles size={16} color="#0284c7" /> QRコードをかざして一発友達追加
                </span>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  対面でスマホの標準カメラをかざすだけで、一瞬で友達に追加されます。
                </p>
              </div>

              {/* 自分のQRコードカード */}
              <div className="qr-container-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                {/* 自分のプロフィール表示 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div 
                    style={{ 
                      width: '38px', 
                      height: '38px', 
                      borderRadius: '50%', 
                      backgroundColor: myAvatarColor, 
                      color: '#fff', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontWeight: 800, 
                      fontSize: '1rem',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                    }}
                  >
                    {myName.slice(0, 1)}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {myName} の友達追加QR
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      相手のスマホカメラで読み取ってもらってください
                    </div>
                  </div>
                </div>

                <div className="qr-box" style={{ background: '#fff', padding: '14px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                  <QRCodeSVG 
                    value={friendQrUrl} 
                    size={200}
                    level="M"
                    includeMargin={true}
                  />
                </div>

                {/* リンクコピー */}
                <div style={{ marginTop: '14px', width: '100%', maxWidth: '340px' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm"
                    onClick={handleCopyLink}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    {copiedLink ? <Check size={16} color="#16a34a" /> : <Copy size={16} />}
                    {copiedLink ? '友達追加リンクをコピーしました！' : '友達追加リンクをコピー（LINE等で送信）'}
                  </button>
                </div>
              </div>

              {/* 手動入力アコーディオン */}
              <div style={{ marginTop: '16px', background: '#fff', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '12px 14px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  相手のQRコードリンクをお持ちの場合:
                </div>
                <form onSubmit={handleImportManualCode} style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="相手の友達URLまたはコードを貼り付け..."
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    style={{ fontSize: '0.8rem' }}
                  />
                  <button type="submit" className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>
                    追加
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* 3. 友達リストタブ（追加した友達からグループを作成/予定共有） */}
          {activeTab === 'friends' && (
            <div className="group-tab-content">
              <p className="modal-subtext" style={{ marginBottom: '14px', fontSize: '0.8rem' }}>
                QRコードで追加した友達の一覧です。<strong>「＋ この旅行に追加」</strong>を押すと、ワンタップでこの旅行のメンバー（グループ）に参加できます！
              </p>

              {friends.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed var(--border-light)' }}>
                  <QrCode size={36} color="#94a3b8" style={{ marginBottom: '8px' }} />
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    まだ友達が登録されていません
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                    「QRで友達追加」タブから、友達とQRコードを読み合って追加しましょう！
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-primary btn-sm"
                    onClick={() => setActiveTab('qr')}
                  >
                    <QrCode size={14} /> 自分のQRコードを表示する
                  </button>
                </div>
              ) : (
                <div className="members-list-grid">
                  {friends.map((friend) => {
                    const isAlreadyInTrip = tripPlan.members.includes(friend.username);

                    return (
                      <div key={friend.id} className="member-item-row" style={{ justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div 
                            className="member-avatar"
                            style={{ backgroundColor: friend.avatarColor || '#10b981' }}
                          >
                            {friend.username.slice(0, 1)}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)' }}>
                              {friend.username}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              QR登録日: {new Date(friend.addedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {isAlreadyInTrip ? (
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <UserCheck size={13} /> 参加中
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => handleAddFriendToTrip(friend.username)}
                              style={{ fontSize: '0.75rem', padding: '4px 12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Plus size={14} /> この旅行に追加
                            </button>
                          )}

                          <button
                            type="button"
                            className="btn-remove-member"
                            onClick={() => handleDeleteFriend(friend)}
                            title="友達リストから削除"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setActiveTab('qr')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={14} /> QRコードで新しい友達を追加
                </button>
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
