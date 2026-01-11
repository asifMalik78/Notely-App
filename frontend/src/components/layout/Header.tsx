import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ThemePicker from "./ThemePicker";
import UserProfileModal from "./UserProfileModal";
import toast from "react-hot-toast";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch {
      toast.error("Failed to logout");
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
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-background border-b sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link to="/dashboard" className="flex items-center gap-2">
              <motion.div
                whileHover={{ rotate: 10 }}
                className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"
              >
                <span className="text-primary-foreground font-bold text-lg">N</span>
              </motion.div>
              <span className="text-lg sm:text-xl font-bold">Notely</span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              <ThemePicker />

              {/* Desktop user button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsProfileModalOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                    {user?.name ? (
                      <span className="text-xs font-medium text-primary-foreground">
                        {getInitials(user.name)}
                      </span>
                    ) : (
                      <User className="w-4 h-4 text-primary-foreground" />
                    )}
                  </div>
                )}
                <span className="text-sm font-medium">{user?.name}</span>
              </motion.button>

              {/* Mobile user button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsProfileModalOpen(true)}
                className="sm:hidden w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    {user?.name ? (
                      <span className="text-xs font-medium text-primary-foreground">
                        {getInitials(user.name)}
                      </span>
                    ) : (
                      <User className="w-4 h-4 text-primary-foreground" />
                    )}
                  </div>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="p-2 rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
}
