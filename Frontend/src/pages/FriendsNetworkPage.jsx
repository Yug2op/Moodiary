// src/pages/FriendsNetworkPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    Search,
    UserPlus,
    UserCheck,
    UserX,
    Users,
    Loader2,
    Compass,
    Inbox,
    Check
} from "lucide-react";
import { friendsAPI } from "../apis/friends";

export default function FriendsNetworkPage() {
    const [activeTab, setActiveTab] = useState("discover"); // "discover" | "requests" | "network"
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Clean initialization values guarantee arrays are never undefined or raw objects
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [friendsList, setFriendsList] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);

    // Tracks inline loading state rows matching specific userIds or requestIds
    const [actioningId, setActioningId] = useState(null);


    const syncDiscoverTab = useCallback(async () => {
        try {
            setLoading(true);
            const res = await friendsAPI.getSuggested();
            const rawData = res?.users;
            setSuggestedUsers(Array.isArray(rawData) ? rawData : []);
        } catch (err) {
            console.error("Failed to fetch suggested users:", err);
            setSuggestedUsers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const syncSentRequests = useCallback(async () => {
        try {
            const res = await friendsAPI.getSentRequests();
            const rawData = res?.sendFriendRequest;
            setSentRequests(Array.isArray(rawData) ? rawData : []);
        } catch (err) {
            console.error("Failed to fetch sent requests:", err);
            setSentRequests([]);
        }
    }, []);

    const syncRequestsTab = useCallback(async () => {
        try {
            setLoading(true);
            const res = await friendsAPI.getPending();
            const rawData = res?.pendingRequests;
            setPendingRequests(Array.isArray(rawData) ? rawData : []);
        } catch (err) {
            console.error("Pending requests fetch failed:", err);
            setPendingRequests([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const syncNetworkTab = useCallback(async () => {
        try {
            setLoading(true);
            const res = await friendsAPI.getFriendsList();
            const rawData = res?.friends
            setFriendsList(Array.isArray(rawData) ? rawData : []);
        } catch (err) {
            console.error("Failed to fetch friends list:", err);
            setFriendsList([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // --- 2. CONDITIONAL TAB INITIALIZATION ROUTER ---

    useEffect(() => {
        if (activeTab === "discover") {
            if (searchQuery === "") syncDiscoverTab();
            syncSentRequests();
        }
        if (activeTab === "requests") syncRequestsTab();
        if (activeTab === "network") syncNetworkTab();
    }, [activeTab, searchQuery, syncDiscoverTab, syncSentRequests, syncRequestsTab, syncNetworkTab]);

    // --- 3. SECTOR NETWORK LOOKUPS ---

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        try {
            setLoading(true);
            const res = await friendsAPI.searchNetwork(searchQuery.trim());
            const rawData = res?.data || res?.users || res;
            setSearchResults(Array.isArray(rawData) ? rawData : []);
        } catch (err) {
            console.error("Search failed:", err);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    // --- 4. ACTION INTERACTORS ---

    const handleSendRequest = async (userId) => {
        try {
            setActioningId(userId);
            await friendsAPI.sendRequest(userId);
            setSentRequests((prev) => {
                const safePrev = Array.isArray(prev) ? prev : [];
                return [...safePrev, { receiver: userId, status: "pending" }];
            });
        } catch (err) {
            console.error("Failed to send friend request:", err);
        } finally {
            setActioningId(null);
        }
    };

    const handleRespondRequest = async (requestId, action) => {
        try {
            setActioningId(requestId);
            if (action === "accept") {
                await friendsAPI.respondToRequest(requestId, "accepted");
            } else {
                await friendsAPI.respondToRequest(requestId, "rejected");
            }

            // Safe filter arrays extraction wrap
            setPendingRequests((prev) => {
                const safePrev = Array.isArray(prev) ? prev : [];
                return safePrev.filter((req) => req._id !== requestId);
            });
        } catch (err) {
            console.error("Failed to respond to friend request:", err);
        } finally {
            setActioningId(null);
        }
    };

    // --- 5. MEMOIZED DISCOVER DATA MAPPERS ---

    const currentDiscoverItems = useMemo(() => {
        return searchQuery ? searchResults : suggestedUsers;
    }, [searchQuery, searchResults, suggestedUsers]);

    return (
        <div className="min-h-screen w-full bg-background text-foreground pb-24 select-none">
            <div className="max-w-md mx-auto px-4 pt-6 space-y-5">

                {/* HEADER BRANDING */}
                <div className="border-b border-border/40 pb-3">
                    <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" /> Friends Network
                    </h1>
                    <p className="text-[11px] text-muted-foreground font-light mt-0.5">
                        Review and manage your friend connections
                    </p>
                </div>

                {/* WORKSPACE TAB SWITCH SEGMENTS */}
                <div className="flex rounded-xl bg-secondary/50 p-0.5 border border-border/10 select-none">
                    <button
                        onClick={() => { setActiveTab("discover"); setSearchQuery(""); }}
                        className={`flex-1 rounded-lg py-2 text-[10px] font-bold uppercase tracking-wider transition-all active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === "discover" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                            }`}
                    >
                        <Compass className="h-3 w-3" /> Find Friend
                    </button>
                    <button
                        onClick={() => setActiveTab("requests")}
                        className={`flex-1 rounded-lg py-2 text-[10px] font-bold uppercase tracking-wider transition-all active:scale-98 flex items-center justify-center gap-1.5 relative cursor-pointer ${activeTab === "requests" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                            }`}
                    >
                        <Inbox className="h-3 w-3" /> Requests
                        {pendingRequests.length > 0 && (
                            <span className="absolute -top-1 right-2 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-[8px] font-black text-white flex items-center justify-center border border-background animate-pulse">
                                {pendingRequests.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("network")}
                        className={`flex-1 rounded-lg py-2 text-[10px] font-bold uppercase tracking-wider transition-all active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === "network" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                            }`}
                    >
                        <Users className="h-3 w-3" /> My Friends
                    </button>
                </div>

                {/* SEARCH BAR CONTAINER */}
                {activeTab === "discover" && (
                    <form onSubmit={handleSearchSubmit} className="relative w-full">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by username"
                            className="w-full h-10 bg-card border border-border rounded-xl pl-3 pr-10 text-xs font-light text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary/40 focus:border-transparent leading-none placeholder:text-muted-foreground/40"
                        />
                        <button
                            type="submit"
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-90 cursor-pointer"
                        >
                            <Search className="h-3.5 w-3.5" />
                        </button>
                    </form>
                )}

                {/* WORKSPACE DYNAMIC CONTENT CANVAS */}
                <div className="space-y-2.5 min-h-[300px]">
                    {loading && (
                        <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground text-[11px] font-light">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span>Searching...</span>
                        </div>
                    )}

                    {!loading && (
                        <>
                            {/* TAB CONTAINER 1: DISCOVER SYSTEM NODES */}
                            {activeTab === "discover" && (
                                <div className="space-y-2">
                                    <span className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground block px-1">
                                        {searchQuery ? "Search Results" : "Recommended Connections"}
                                    </span>

                                    {currentDiscoverItems.length === 0 ? (
                                        <div className="text-center py-10 bg-card border border-border/40 rounded-2xl text-[11px] text-muted-foreground font-light">
                                            No recommended users found.
                                        </div>
                                    ) : (
                                        currentDiscoverItems.map((user) => {
                                            // Compares user ID against loaded sentRequests values safely
                                            const isInvitedByMe = Array.isArray(sentRequests) && sentRequests.some(
                                                (req) => (req?.receiver?._id === user?._id || req?.receiver === user?._id) && req?.status === "pending"
                                            );

                                            return (
                                                <div key={user._id} className="bg-card border border-border/60 rounded-xl p-3 flex items-center justify-between gap-3 shadow-xs">
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 border border-primary/20 capitalize">
                                                            {user.username?.charAt(0) || "U"}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="text-xs font-bold text-foreground/90 truncate leading-tight">{user.username}</h3>
                                                            <p className="text-[9px] text-muted-foreground font-light truncate mt-0.5">{user.email || "Network Profile Node"}</p>
                                                        </div>
                                                    </div>

                                                    {isInvitedByMe ? (
                                                        <div className="h-7 px-3 rounded-lg bg-secondary text-muted-foreground/60 border border-border/50 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 select-none shrink-0">
                                                            <Check className="h-2.5 w-2.5 text-muted-foreground/40" /> Invited
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            disabled={actioningId === user._id}
                                                            onClick={() => handleSendRequest(user._id)}
                                                            className="h-7 px-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-[10px] flex items-center gap-1 active:scale-95 transition-all disabled:opacity-40 cursor-pointer shrink-0"
                                                        >
                                                            {actioningId === user._id ? (
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <UserPlus className="h-3 w-3" /> Connect
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}

                            {/* TAB CONTAINER 2: PENDING INCOMING REQUESTS */}
                            {activeTab === "requests" && (
                                <div className="space-y-2">
                                    <span className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground block px-1">Pending Requests</span>
                                    {pendingRequests.length === 0 ? (
                                        <div className="text-center py-10 bg-card border border-border/40 rounded-2xl text-[11px] text-muted-foreground font-light flex flex-col items-center justify-center gap-1.5">
                                            <span>📥</span>
                                            <span>Your inbox is clear. No verification invitations pending.</span>
                                        </div>
                                    ) : (
                                        pendingRequests.map((req) => {
                                            const sender = req.senderId || req.sender || {};
                                            return (
                                                <div key={req._id} className="bg-card border border-border rounded-xl p-3 flex flex-col gap-2.5 shadow-sm">
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className="h-8 w-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold shrink-0 border border-accent/20 capitalize">
                                                            {sender.username?.charAt(0) || "U"}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <h3 className="text-xs font-bold text-foreground/90 truncate leading-tight">{sender.username || "Anonymous Node"}</h3>
                                                            <p className="text-[9px] text-muted-foreground font-light truncate mt-0.5">Wants to connect with you</p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2 border-t border-border/30 pt-2">
                                                        <button
                                                            type="button"
                                                            disabled={actioningId === req._id}
                                                            onClick={() => handleRespondRequest(req._id, "accept")}
                                                            className="h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px] flex items-center justify-center gap-1 active:scale-95 disabled:opacity-40 cursor-pointer"
                                                        >
                                                            <UserCheck className="h-3 w-3" /> Accept
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={actioningId === req._id}
                                                            onClick={() => handleRespondRequest(req._id, "decline")}
                                                            className="h-7 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold text-[10px] flex items-center justify-center gap-1 active:scale-95 disabled:opacity-40 cursor-pointer"
                                                        >
                                                            <UserX className="h-3 w-3" /> Decline
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}

                            {/* TAB CONTAINER 3: ACTIVE NETWORK ROSTER */}
                            {activeTab === "network" && (
                                <div className="space-y-2">
                                    <span className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground block px-1">Your Connections({friendsList?.length})</span>
                                    {friendsList.length === 0 ? (
                                        <div className="text-center py-10 bg-card border border-border/40 rounded-2xl text-[11px] text-muted-foreground font-light">
                                            You have no connections yet. Discover new friends to expand your network.
                                        </div>
                                    ) : (
                                        friendsList.map((friend) => (
                                            <div key={friend._id} className="bg-card border border-border/60 rounded-xl p-3 flex items-center justify-between gap-3 shadow-xs">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className="relative shrink-0">
                                                        {/* ⚡ THE STREAK INDICATOR BADGE COMPONENT */}
                                                        {friend.currentStreak > 0 && (
                                                            <div className="absolute -top-1.5 -right-1.5 z-10 px-1 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-[7px] font-black text-white flex items-center justify-center min-w-4 h-4 shadow-sm border border-background animate-fade-in scale-105 select-none">
                                                                🔥{friend.currentStreak}
                                                            </div>
                                                        )}

                                                        {/* CORE AVATAR LAYOUT WITH IMAGE FALLBACK CAPABILITIES */}
                                                        <div className="h-8 w-8 rounded-full bg-secondary text-muted-foreground flex items-center justify-center text-xs font-bold shrink-0 border border-border capitalize overflow-hidden">
                                                            {friend.avatar ? (
                                                                <img
                                                                    src={friend.avatar}
                                                                    alt={friend.username}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                friend.username?.charAt(0) || "U"
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="text-xs font-bold text-foreground/90 truncate leading-tight">{friend.username}</h3>
                                                        <p className="text-[9px] text-muted-foreground font-light truncate mt-0.5">This friend have {friend.currentStreak} day streak</p>
                                                        <p className="text-[9px] text-muted-foreground font-light truncate mt-0.5">Can You Beat Them?</p>
                                                    </div>
                                                </div>
                                                <div className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 rounded-md text-[8px] uppercase tracking-wide font-bold">
                                                    Connected
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}