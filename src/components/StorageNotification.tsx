import React, { useEffect, useState } from 'react';
import { AlertTriangle, X, HardDrive, Download } from 'lucide-react';
import { StorageResult, getStorageInfo, exportAllData } from '../services/storageService';

interface StorageNotificationProps {
  notification: StorageResult | null;
  onDismiss: () => void;
}

const StorageNotification: React.FC<StorageNotificationProps> = ({ notification, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification && !notification.success) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [notification]);

  const handleExportData = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chronicle-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isVisible || !notification) return null;

  const storageInfo = getStorageInfo();

  return (
    <div className="fixed bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-[200] animate-in slide-in-from-bottom duration-300">
      <div className={`rounded-2xl shadow-2xl border backdrop-blur-xl p-4 ${
        notification.error === 'QUOTA_EXCEEDED'
          ? 'bg-terra/95 border-terra/50 text-white'
          : 'bg-amber-500/95 border-amber-400/50 text-white'
      }`}>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/20 rounded-xl shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm mb-1">
              {notification.error === 'QUOTA_EXCEEDED' ? 'Storage Full' : 'Storage Warning'}
            </h4>
            <p className="text-xs opacity-90 leading-relaxed">
              {notification.message}
            </p>

            {/* Storage usage bar */}
            <div className="mt-3 bg-white/20 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-white/80 rounded-full transition-all"
                style={{ width: `${storageInfo.percentage}%` }}
              />
            </div>
            <p className="text-[10px] mt-1 opacity-75">
              {storageInfo.usedFormatted} / {storageInfo.totalFormatted} used ({storageInfo.percentage}%)
            </p>

            {/* Action buttons */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleExportData}
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
              >
                <Download size={14} />
                Backup Data
              </button>
            </div>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              onDismiss();
            }}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Storage Warning Banner (shown when storage is getting full)
interface StorageWarningBannerProps {
  show: boolean;
  percentage: number;
  onOpenSettings: () => void;
}

export const StorageWarningBanner: React.FC<StorageWarningBannerProps> = ({
  show,
  percentage,
  onOpenSettings
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (!show || dismissed) return null;

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-6 md:w-80 z-[150] animate-in slide-in-from-top duration-300">
      <div className="bg-amber-500/90 backdrop-blur-xl rounded-2xl shadow-xl border border-amber-400/50 p-3 text-white">
        <div className="flex items-center gap-3">
          <HardDrive size={18} className="shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium">
              Storage {percentage}% full
            </p>
            <p className="text-[10px] opacity-80">
              Consider clearing old data
            </p>
          </div>
          <button
            onClick={onOpenSettings}
            className="text-[10px] font-bold bg-white/20 hover:bg-white/30 px-2 py-1 rounded-lg transition-colors shrink-0"
          >
            Settings
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StorageNotification;
