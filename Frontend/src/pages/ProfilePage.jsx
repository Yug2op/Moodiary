// src/pages/ProfilePage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { 
  LogOut, Flame, Trophy, Calendar, 
  Smile, Loader2, ShieldAlert, 
  Smartphone, Users, Edit2, Camera
} from "lucide-react";
import { analyticsAPI, authAPI, profileAPI } from "../apis"; 

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // New States for Profile Editing Engine Drawer
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Fetch comprehensive profile payload info
  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await profileAPI.getMe();
      if (data?.success) {
        setProfile(data.user);
        // Pre-populate edit form state variables
        setEditUsername(data.user?.username || "");
        setEditPhone(data.user?.phone || "");
        setAvatarPreview(data.user?.avatar || "");
      }
    } catch (err) {
      console.error("Failed to load user matrix logs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistoryData = useCallback(async () => {
    try {
      const data = await analyticsAPI.getLastUpdates();
      if (data?.success) {
        setHistory(data.history);
      }
    } catch (err) {
      console.error("Failed to load user matrix logs:", err);
    }
  }, []);

  useEffect(() => {
    fetchProfileData();
    fetchHistoryData();
  }, [fetchProfileData, fetchHistoryData]);

  // Handle systemic authentication breakdown and logout
  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.clear();
    } catch (err) {
      console.warn("Backend cookie clearance partial network drop:", err);
    } finally {
      localStorage.removeItem("isLoggedIn");
      setShowLogoutConfirm(false);
      navigate("/auth", { replace: true });
    }
  };

  // Handle local binary file picker mutations
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file)); // Generate instantaneous UI thumbnail trace
    }
  };

  // Dispatch multipart/form-data payload profile updates to backend API
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setUpdatingProfile(true);
      
      const formData = new FormData();
      formData.append("username", editUsername.trim());
      formData.append("phone", editPhone.trim());
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const res = await profileAPI.updateProfile(formData);
      if (res?.success) {
        // Optimistically update parent dashboard states without hard reloading the browser
        setProfile(res.user || { ...profile, username: editUsername, phone: editPhone, avatar: avatarPreview });
        setShowEditModal(false);
        setAvatarFile(null);
      }
    } catch (err) {
      console.error("Profile payload synchronization failed:", err);
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Helper calculation to color history metric pills dynamically
  const getRatingBorderClass = (rating) => {
    if (rating >= 8) return "border-emerald-500/30 text-emerald-400 bg-emerald-500/5";
    if (rating >= 5) return "border-amber-500/30 text-amber-400 bg-amber-500/5";
    return "border-rose-500/30 text-rose-400 bg-rose-500/5";
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center text-xs text-muted-foreground gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="font-light tracking-widest opacity-80">Synchronizing user identity...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground pb-28">
      <div className="max-w-md mx-auto px-4 pt-6 space-y-6">
        
        {/* UPPER METEOR BRANDED ROW ACCOMPANIED WITH SIGN OUT BUTTON TRIGGER */}
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <h1 className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
            Profile
          </h1>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="p-2.5 rounded-xl bg-card border border-border text-rose-400/90 hover:text-rose-400 active:scale-95 transition-all shadow-sm cursor-pointer"
            type="button"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* PROFILE HEADER CARD WITH INTEGRATED RADIAL GRADIENT GLOWS */}
        <div className="relative group overflow-hidden rounded-[1.5rem] border border-border bg-card/40 p-5 shadow-xl backdrop-blur-xl">
          <div className="absolute inset-0 h-full w-full scale-[0.85] transform rounded-full bg-gradient-to-br from-primary to-accent opacity-15 blur-3xl" />
          
          {/* Floating Edit Button Overlay Target */}
          <button 
            onClick={() => setShowEditModal(true)}
            className="absolute top-4 right-4 h-7 w-7 rounded-lg bg-secondary/80 border border-border/40 text-muted-foreground hover:text-foreground flex items-center justify-center transition-all active:scale-90 cursor-pointer z-20"
            type="button"
          >
            <Edit2 className="h-3 w-3" />
          </button>

          <div className="relative z-10 flex items-center gap-4">
            <img
              src={profile?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"}
              alt={profile?.username}
              className="h-14 w-14 rounded-2xl object-cover bg-muted border border-border"
            />
            <div>
              <h2 className="text-sm font-bold tracking-tight text-foreground">@{profile?.username || "yugank"}</h2>
              <p className="text-[10px] text-muted-foreground font-light mt-0.5 flex items-center gap-1.5">
                <Calendar className="h-2.5 w-2.5" />
                <span>Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "Unknown"}</span>
              </p>
              <p className="text-[10px] text-muted-foreground font-light mt-0.5 flex items-center gap-1.5">
                <Smartphone className="h-2.5 w-2.5" />
                <span>Phone Number: {profile?.phone || "Not provided"}</span>
              </p>
              <p className="text-[10px] text-muted-foreground font-light mt-0.5 flex items-center gap-1.5">
                <Smile className="h-2.5 w-2.5" />
                <span>Last Mood: {profile?.lastMoodDate ? new Date(profile.lastMoodDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Unknown"}</span>
              </p>
              <p className="text-[10px] text-muted-foreground font-light mt-0.5 flex items-center gap-1.5">
                <Users className="h-2.5 w-2.5" />
                <span>Friends Count: {profile?.friends?.length || 0}</span>
              </p>
            </div>
          </div>
        </div>

        {/* GRID STRUCTURE HOUSING GAMIFIED ANALYTICS METRIC INDICATORS */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border p-4 rounded-2xl flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Flame className="h-4 w-4 fill-current" />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block font-light leading-none">Active Streak</span>
              <span className="text-base font-black tracking-tight text-foreground mt-1 block">
                {profile?.currentStreak || 0} days
              </span>
            </div>
          </div>

          <div className="bg-card border border-border p-4 rounded-2xl flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Trophy className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block font-light leading-none">All-Time Peak</span>
              <span className="text-base font-black tracking-tight text-foreground mt-1 block">
                {profile?.longestStreak || 0} days
              </span>
            </div>
          </div>
        </div>

        {/* LOG TIMELINE NARRATIVE SEGMENT AREA */}
        <div className="space-y-3.5">
          <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase pl-1">
            Recent Mood
          </h3>

          {history.length === 0 ? (
            <div className="text-center py-10 bg-card/20 border border-border/80 rounded-2xl p-6">
              <p className="text-[11px] text-muted-foreground font-light">
                No past memory files found. Log a mood entry on the console to start tracking history.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {history.map((log) => (
                <div 
                  key={log._id} 
                  className="bg-card/40 border border-border/60 rounded-xl p-3.5 flex items-start justify-between gap-4 transition-colors hover:border-border"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-md">{log.emoji}</span>
                    </div>
                    {log.note && (
                      <p className="text-[11px] font-light text-foreground/75 leading-relaxed">
                        {log.note}
                      </p>
                    )}
                    <span className="text-[9px] text-muted-foreground/70 block pt-0.5 font-light">
                      {new Date(log.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="text-[7px] text-muted-foreground/70 block pt-0.5 font-light">
                      {log.reactions?.length || 0} reaction{log.reactions?.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border tracking-tighter shrink-0 ${getRatingBorderClass(log.rating)}`}>
                    {log.rating}.0
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* PORTAL A: LOGOUT CONFIRMATION DRAWER */}
      {createPortal(
        <AnimatePresence>
          {showLogoutConfirm && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-background/80 backdrop-blur-xs z-50"
                onClick={() => setShowLogoutConfirm(false)}
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.32 }}
                className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-popover border-t border-border rounded-t-[2rem] shadow-2xl z-50 overflow-hidden p-6 flex flex-col items-center text-center pb-safe"
              >
                <div className="w-10 h-1 bg-muted rounded-full mb-5" />
                <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 mb-3">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold tracking-tight text-foreground">Sever Connection?</h4>
                <p className="text-xs font-light text-muted-foreground max-w-[240px] mt-1 leading-relaxed">
                  This will wipe temporary caching tokens and sign you out of your current space session.
                </p>
                <div className="grid grid-cols-2 gap-3 w-full mt-6">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="h-10 text-xs font-medium rounded-xl border border-border bg-secondary/40 text-foreground hover:bg-secondary transition-colors cursor-pointer"
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    className="h-10 text-xs font-bold rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/10 cursor-pointer"
                    type="button"
                  >
                    Sign Out
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* PORTAL B: NEW HIGH-FIDELITY PROFILE UPDATE DRAWER */}
      {createPortal(
        <AnimatePresence>
          {showEditModal && (
            <>
              {/* Dim backdrop mesh */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-background/80 backdrop-blur-xs z-50"
                onClick={() => setShowEditModal(false)}
              />

              {/* Slidable bottom configuration panel sheet */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.35 }}
                className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-popover border-t border-border rounded-t-[2rem] shadow-2xl z-50 overflow-hidden p-6 pb-safe"
              >
                <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
                
                <div className="text-center pb-2">
                  <h4 className="text-sm font-black tracking-tight text-foreground">Update Profile</h4>
                  <p className="text-[10px] text-muted-foreground font-light mt-0.5">Update your profile information</p>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4 mt-2">
                  
                  {/* AVATAR INTERACTIVE FILE UPLOADER CONTROLLER */}
                  <div className="flex flex-col items-center justify-center pt-1">
                    <div className="relative group/avatar h-16 w-16 rounded-2xl overflow-hidden border border-border/80 bg-secondary">
                      <img 
                        src={avatarPreview || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"} 
                        alt="Preview" 
                        className="h-full w-full object-cover"
                      />
                      <label className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px] font-bold cursor-pointer gap-1">
                        <Camera className="h-3 w-3" />
                        <span>Upload</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleAvatarChange} 
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>

                  {/* USERNAME RAW ALIAS FIELD */}
                  <div className="bg-card/50 border border-border/80 rounded-xl p-3 space-y-0.5">
                    <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider">Username Handle</span>
                    <input 
                      type="text" 
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      required
                      placeholder="e.g. yugank"
                      className="w-full bg-transparent text-xs font-bold text-foreground focus:outline-hidden pb-0.5 lowercase"
                    />
                  </div>

                  {/* CONFIRMATION EVENT DISPATCH HANDLERS */}
                  <div className="grid grid-cols-2 gap-3 w-full pt-2">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="h-10 text-xs font-medium rounded-xl border border-border bg-secondary/40 text-foreground hover:bg-secondary transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updatingProfile}
                      className="h-10 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-95 transition-all shadow-lg shadow-primary/10 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {updatingProfile ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <span>Save Changes</span>
                      )}
                    </button>
                  </div>

                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}