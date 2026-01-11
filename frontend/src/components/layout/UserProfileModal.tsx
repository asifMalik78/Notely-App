import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, User, FileText, Save, X } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { DatePicker } from '../ui/DatePicker';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { user, updateProfile, updateAvatar } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [dob, setDob] = useState<Date | undefined>(user?.dob ? new Date(user.dob) : undefined);
  const [description, setDescription] = useState(user?.description || '');
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens with latest user data
  useEffect(() => {
    if (isOpen && user) {
      setName(user.name || '');
      setDob(user.dob ? new Date(user.dob) : undefined);
      setDescription(user.description || '');
      setAvatarPreview(user.avatarUrl || null);
    }
  }, [isOpen, user]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setAvatarPreview(base64);

      try {
        await updateAvatar(base64);
        toast.success('Avatar updated!');
      } catch {
        toast.error('Failed to update avatar');
        setAvatarPreview(user?.avatarUrl || null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile({
        name: name.trim(),
        dob: dob ? dob.toISOString().split('T')[0] : undefined,
        description: description.trim() || undefined
      });
      toast.success('Profile updated!');
      onClose();
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Profile" size="md">
      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative cursor-pointer group"
            onClick={handleAvatarClick}
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt={user?.name || 'User'}
                className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center border-4 border-primary/20">
                <span className="text-2xl font-bold text-primary-foreground">
                  {user?.name ? getInitials(user.name) : <User className="w-10 h-10" />}
                </span>
              </div>
            )}

            {/* Upload overlay */}
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </div>

            {/* Upload badge */}
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-background shadow-lg">
              <Camera className="w-4 h-4 text-primary-foreground" />
            </div>
          </motion.div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <p className="text-sm text-muted-foreground mt-2">
            Click to upload photo
          </p>
        </div>

        {/* User Info */}
        <div className="space-y-4">
          {/* Email (read-only) */}
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1.5">
              Email
              {user?.provider && (
                <span className="text-xs px-2 py-0.5 bg-secondary rounded-full">
                  via {user.provider}
                </span>
              )}
            </label>
            <div className="flex items-center gap-3 px-3 py-2.5 bg-secondary/50 rounded-lg text-muted-foreground">
              {user?.email}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1.5">
              <User className="w-4 h-4" />
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input w-full"
              placeholder="Your name"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1.5">
              Date of Birth
            </label>
            <DatePicker
              date={dob}
              onDateChange={setDob}
              placeholder="Select your date of birth"
              className="w-full"
            />
          </div>

          {/* Description/Bio */}
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1.5">
              <FileText className="w-4 h-4" />
              Bio
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input w-full min-h-[100px] resize-none"
              placeholder="Tell us about yourself..."
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {description.length}/500
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            isLoading={isLoading}
            className="flex-1"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
