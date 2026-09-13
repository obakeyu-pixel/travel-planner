import React from 'react';
import { 
  BookOpen, 
  Plus, 
  Copy, 
  Trash2, 
  Calendar, 
  MapPin, 
  CheckCircle2
} from 'lucide-react';
import type { TripPlan } from '../types/travel';

interface TripListModalProps {
  trips: TripPlan[];
  currentTripId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectTrip: (tripId: string) => void;
  onCreateNewTrip: () => void;
  onDuplicateTrip: (tripId: string) => void;
  onDeleteTrip: (tripId: string) => void;
}

export const TripListModal: React.FC<TripListModalProps> = ({
  trips,
  currentTripId,
  isOpen,
  onClose,
  onSelectTrip,
  onCreateNewTrip,
  onDuplicateTrip,
  onDeleteTrip,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog trip-list-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={20} className="icon-primary" />
            <h3 className="modal-title">旅行のしおり一覧（マイアルバム）</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <p className="modal-subtext" style={{ marginBottom: '16px' }}>
            過去の思い出の旅や、これから行く計画のしおりを何冊でも保存・切り替えできます。
          </p>

          <button 
            className="btn btn-primary create-trip-card-btn"
            onClick={() => {
              onCreateNewTrip();
              onClose();
            }}
          >
            <Plus size={18} />
            新しい旅行のしおりを作成する
          </button>

          <div className="trip-cards-list">
            {trips.map((trip) => {
              const isCurrent = trip.id === currentTripId;
              const scheduleCount = trip.schedules?.length || 0;
              const spotCount = trip.savedSpots?.length || 0;

              return (
                <div 
                  key={trip.id} 
                  className={`trip-album-card ${isCurrent ? 'current' : ''}`}
                  onClick={() => {
                    onSelectTrip(trip.id);
                    onClose();
                  }}
                >
                  <img 
                    src={trip.coverImage || 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80'} 
                    alt="" 
                    className="trip-album-thumb"
                  />
                  <div className="trip-album-info">
                    <div className="trip-album-top">
                      <h4 className="trip-album-title">{trip.title}</h4>
                      {isCurrent && (
                        <span className="current-badge">
                          <CheckCircle2 size={12} /> 開き中
                        </span>
                      )}
                    </div>

                    <div className="trip-album-meta">
                      <span><MapPin size={13} /> {trip.destination}</span>
                      <span><Calendar size={13} /> {trip.startDate} ({trip.totalDays}日間)</span>
                    </div>

                    <div className="trip-album-counts">
                      <span>予定: {scheduleCount} 件</span>
                      <span>スポット: {spotCount} 件</span>
                      <span>メンバー: {trip.members?.join('・') || '自分'}</span>
                    </div>
                  </div>

                  <div className="trip-album-actions" onClick={(e) => e.stopPropagation()}>
                    <button 
                      className="album-action-btn"
                      onClick={() => onDuplicateTrip(trip.id)}
                      title="この旅行を複製して新しいしおりを作成"
                    >
                      <Copy size={15} />
                    </button>
                    {trips.length > 1 && (
                      <button 
                        className="album-action-btn delete"
                        onClick={() => {
                          if (window.confirm(`「${trip.title}」を削除しますか？`)) {
                            onDeleteTrip(trip.id);
                          }
                        }}
                        title="削除"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>閉じる</button>
        </div>
      </div>
    </div>
  );
};
