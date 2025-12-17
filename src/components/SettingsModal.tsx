import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Camera, User, Briefcase, Trash2, Plus, Pencil, Tag, Key, HardDrive, Download, Upload } from 'lucide-react';
import { UserProfile, CategoryItem, CATEGORY_COLORS } from '../types';
import { getStorageInfo, getChronicleStorageInfo, exportAllData, importData } from '../services/storageService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSave: (user: UserProfile) => void;
  onClearData: () => void;
  categories: CategoryItem[];
  onSaveCategories: (categories: CategoryItem[]) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
  onClearData,
  categories,
  onSaveCategories
}) => {
  const [formData, setFormData] = useState<UserProfile>(user);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [localCategories, setLocalCategories] = useState<CategoryItem[]>(categories);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(CATEGORY_COLORS[0].value);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [storageInfo, setStorageInfo] = useState(getStorageInfo());
  const [chronicleStorage, setChronicleStorage] = useState(getChronicleStorageInfo());
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(user);
      setLocalCategories(categories);
      setShowClearConfirm(false);
      setEditingCategory(null);
      setShowAddCategory(false);
      setStorageInfo(getStorageInfo());
      setChronicleStorage(getChronicleStorageInfo());
      setImportError(null);
      setImportSuccess(false);
    }
  }, [isOpen, user, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSave(formData);
      onSaveCategories(localCategories);
      onClose();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) {
        alert('Image too large. Please use an image under 500KB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearData = () => {
    if (showClearConfirm) {
      onClearData();
      setShowClearConfirm(false);
      onClose();
    } else {
      setShowClearConfirm(true);
    }
  };

  const removePhoto = () => {
    setFormData({ ...formData, avatarUrl: '' });
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: CategoryItem = {
        id: crypto.randomUUID(),
        name: newCategoryName.trim(),
        color: newCategoryColor
      };
      setLocalCategories([...localCategories, newCategory]);
      setNewCategoryName('');
      setNewCategoryColor(CATEGORY_COLORS[0].value);
      setShowAddCategory(false);
    }
  };

  const handleDeleteCategory = (id: string) => {
    if (localCategories.length > 1) {
      setLocalCategories(localCategories.filter(c => c.id !== id));
    }
  };

  const handleEditCategory = (category: CategoryItem) => {
    setEditingCategory(category);
  };

  const handleSaveEditCategory = () => {
    if (editingCategory && editingCategory.name.trim()) {
      setLocalCategories(localCategories.map(c =>
        c.id === editingCategory.id ? editingCategory : c
      ));
      setEditingCategory(null);
    }
  };

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

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = importData(content);
      if (result.success) {
        setImportSuccess(true);
        setImportError(null);
        // Refresh storage info
        setStorageInfo(getStorageInfo());
        setChronicleStorage(getChronicleStorageInfo());
        // Reload after a short delay to show success message
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setImportError(result.message || 'Failed to import data');
        setImportSuccess(false);
      }
    };
    reader.readAsText(file);
    // Reset input
    if (importInputRef.current) {
      importInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-charcoal/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-bone/90 backdrop-blur-2xl rounded-[2rem] w-full max-w-lg shadow-2xl border border-white/60 overflow-hidden relative">
        <div className="p-8 pb-6 overflow-y-auto max-h-[90vh]">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black text-charcoal">Settings</h2>
            <button
              onClick={onClose}
              className="p-2 bg-white/50 hover:bg-terra hover:text-white rounded-full transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo Section */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative group">
                <div className="w-28 h-28 rounded-3xl bg-peach/30 overflow-hidden border-4 border-white shadow-lg">
                  {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-peach/50">
                      <User size={48} className="text-charcoal/40" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-charcoal/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Camera size={28} className="text-white" />
                </button>
                {formData.avatarUrl && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute -top-2 -right-2 p-1.5 bg-terra text-white rounded-full shadow-lg hover:bg-terra/80 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 bg-peach/60 hover:bg-peach text-charcoal px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                <Camera size={18} />
                {formData.avatarUrl ? 'Change Photo' : 'Upload Photo'}
              </button>
              <p className="text-xs text-charcoal/40 mt-2">Max size: 500KB</p>
            </div>

            {/* Name Input */}
            <div className="bg-white/40 p-4 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <User size={16} className="text-charcoal/50" />
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal/50">Display Name</label>
              </div>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/60 p-4 rounded-xl text-lg font-bold text-charcoal outline-none focus:ring-4 focus:ring-peach/30"
                placeholder="Your name"
              />
            </div>

            {/* Role Input */}
            <div className="bg-white/40 p-4 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase size={16} className="text-charcoal/50" />
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal/50">Role / Title</label>
              </div>
              <input
                type="text"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-white/60 p-4 rounded-xl text-lg font-medium text-charcoal outline-none focus:ring-4 focus:ring-peach/30"
                placeholder="e.g., Product Designer"
              />
            </div>

            {/* Categories Section */}
            <div className="bg-white/40 p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-charcoal/50" />
                  <label className="text-xs font-bold uppercase tracking-wider text-charcoal/50">Categories</label>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddCategory(!showAddCategory)}
                  className="p-2 bg-peach/50 hover:bg-peach rounded-lg transition-colors"
                >
                  <Plus size={16} className="text-charcoal" />
                </button>
              </div>

              {/* Add New Category */}
              {showAddCategory && (
                <div className="bg-white/50 p-4 rounded-xl mb-4 space-y-3">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    placeholder="Category name"
                    className="w-full bg-white/80 p-3 rounded-lg text-sm font-medium text-charcoal outline-none focus:ring-2 focus:ring-peach/50"
                  />
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_COLORS.map(color => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setNewCategoryColor(color.value)}
                        className={`w-8 h-8 rounded-lg ${color.value} ${newCategoryColor === color.value ? 'ring-2 ring-charcoal ring-offset-2' : ''}`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="flex-1 bg-charcoal text-white py-2 rounded-lg font-bold text-sm"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddCategory(false)}
                      className="px-4 bg-white/50 text-charcoal py-2 rounded-lg font-bold text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Category List */}
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {localCategories.map(category => (
                  <div key={category.id} className="bg-white/50 p-3 rounded-xl flex items-center gap-3">
                    {editingCategory?.id === category.id ? (
                      <>
                        <div className={`w-8 h-8 rounded-lg ${editingCategory.color} shrink-0`} />
                        <input
                          type="text"
                          value={editingCategory.name}
                          onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                          className="flex-1 bg-white/80 p-2 rounded-lg text-sm font-medium outline-none"
                        />
                        <div className="flex gap-1">
                          {CATEGORY_COLORS.slice(0, 5).map(color => (
                            <button
                              key={color.value}
                              type="button"
                              onClick={() => setEditingCategory({ ...editingCategory, color: color.value })}
                              className={`w-6 h-6 rounded ${color.value} ${editingCategory.color === color.value ? 'ring-2 ring-charcoal' : ''}`}
                            />
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={handleSaveEditCategory}
                          className="p-2 bg-sage text-white rounded-lg"
                        >
                          <Save size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <div className={`w-8 h-8 rounded-lg ${category.color} shrink-0`} />
                        <span className="flex-1 font-medium text-charcoal">{category.name}</span>
                        <button
                          type="button"
                          onClick={() => handleEditCategory(category)}
                          className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                        >
                          <Pencil size={14} className="text-charcoal/50" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(category.id)}
                          disabled={localCategories.length <= 1}
                          className="p-2 hover:bg-terra/20 rounded-lg transition-colors disabled:opacity-30"
                        >
                          <Trash2 size={14} className="text-terra" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* AI Settings */}
            <div className="bg-white/40 p-4 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Key size={16} className="text-charcoal/50" />
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal/50">AI Settings</label>
              </div>
              <input
                type="password"
                value={formData.aiApiKey || ''}
                onChange={e => setFormData({ ...formData, aiApiKey: e.target.value })}
                className="w-full bg-white/60 p-4 rounded-xl text-sm font-medium text-charcoal outline-none focus:ring-4 focus:ring-peach/30"
                placeholder="Enter Gemini API Key"
              />
              <p className="text-[10px] text-charcoal/40 mt-2">Stored locally only. Not shared or synced.</p>
            </div>

            {/* Storage Section */}
            <div className="bg-white/40 p-4 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <HardDrive size={16} className="text-charcoal/50" />
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal/50">Local Storage</label>
              </div>

              {/* Storage Usage Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-charcoal/70 mb-1">
                  <span>Used: {storageInfo.usedFormatted}</span>
                  <span>Total: {storageInfo.totalFormatted}</span>
                </div>
                <div className="bg-white/50 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      storageInfo.percentage >= 90 ? 'bg-terra' :
                      storageInfo.percentage >= 70 ? 'bg-amber-500' : 'bg-sage'
                    }`}
                    style={{ width: `${storageInfo.percentage}%` }}
                  />
                </div>
                <p className="text-[10px] text-charcoal/50 mt-1 text-right">{storageInfo.percentage}% used</p>
              </div>

              {/* Storage Breakdown */}
              <div className="bg-white/30 rounded-xl p-3 mb-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal/50 mb-2">Storage Breakdown</p>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-charcoal/70">
                    <span>Events & Notes</span>
                    <span className="font-medium">{chronicleStorage.EVENTS}</span>
                  </div>
                  <div className="flex justify-between text-charcoal/70">
                    <span>Credentials</span>
                    <span className="font-medium">{chronicleStorage.CREDENTIALS}</span>
                  </div>
                  <div className="flex justify-between text-charcoal/70">
                    <span>Profile</span>
                    <span className="font-medium">{chronicleStorage.USER_PROFILE}</span>
                  </div>
                  <div className="flex justify-between text-charcoal/70">
                    <span>Categories</span>
                    <span className="font-medium">{chronicleStorage.CATEGORIES}</span>
                  </div>
                </div>
              </div>

              {/* Backup & Restore */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleExportData}
                  className="flex-1 flex items-center justify-center gap-2 bg-sage/20 hover:bg-sage/30 text-charcoal py-3 rounded-xl font-bold text-sm transition-colors"
                >
                  <Download size={16} />
                  <span>Export Backup</span>
                </button>
                <button
                  type="button"
                  onClick={() => importInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 bg-peach/30 hover:bg-peach/50 text-charcoal py-3 rounded-xl font-bold text-sm transition-colors"
                >
                  <Upload size={16} />
                  <span>Import Backup</span>
                </button>
                <input
                  ref={importInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </div>

              {/* Import Status Messages */}
              {importError && (
                <p className="text-xs text-terra mt-2 text-center">{importError}</p>
              )}
              {importSuccess && (
                <p className="text-xs text-sage mt-2 text-center font-medium">Data imported successfully! Reloading...</p>
              )}

              <p className="text-[10px] text-charcoal/40 mt-3 text-center">
                All data is stored locally in your browser. Export regularly to keep backups.
              </p>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full bg-charcoal/90 text-white font-bold py-4 px-6 rounded-2xl hover:bg-charcoal flex items-center justify-center gap-3 shadow-lg transition-all"
            >
              <Save size={20} />
              <span>Save Changes</span>
            </button>

            {/* Danger Zone */}
            <div className="border-t border-charcoal/10 pt-6 mt-6">
              <h3 className="text-sm font-bold text-charcoal/50 uppercase tracking-wider mb-4">Danger Zone</h3>
              <button
                type="button"
                onClick={handleClearData}
                className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${
                  showClearConfirm ? 'bg-terra text-white' : 'bg-terra/10 text-terra hover:bg-terra/20'
                }`}
              >
                <Trash2 size={20} />
                <span>{showClearConfirm ? 'Click again to confirm' : 'Clear All Data'}</span>
              </button>
              {showClearConfirm && (
                <p className="text-xs text-terra mt-2 text-center">
                  This will delete all events, credentials, and reset your profile.
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
