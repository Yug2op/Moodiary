// src/pages/FeedPage.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { feedAPI } from "../apis";
import FeedCard from "../components/FeedCard";

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeReactionTray, setActiveReactionTray] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const observer = useRef();

  const fetchFeed = useCallback(async (pageNum, isRefresh = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await feedAPI.getFriendsToday(pageNum, 10);
      if (data?.success) {
        setCurrentUserId(data?.currentUserId);
        setPosts((prev) => (isRefresh ? data.feed : [...prev, ...data.feed]));
        setHasMore(data.feed?.length === 10 && data.pagination?.hasNextPage !== false);
      }
    } catch (err) {
      console.error("Failed to load feed canvas:", err);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    fetchFeed(1, true);
  }, []);

  const lastPostElementRef = useCallback((node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prev) => {
          const nextPage = prev + 1;
          fetchFeed(nextPage);
          return nextPage;
        });
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, fetchFeed]);

  const handleRefresh = () => {
    setPage(1);
    setHasMore(true);
    fetchFeed(1, true);
  };

  const handleReactionToggle = async (moodId, emoji) => {
    try {
      // Optimistic client calculation patch
      setPosts((prev) =>
        prev.map((post) => {
          if (post._id !== moodId) return post;
          let updated = [...(post.reactions || [])];
          const existIdx = updated.findIndex((r) => r.emoji === emoji && (r.user === "me" || r.isOptimistic));

          if (existIdx > -1) {
            updated.splice(existIdx, 1);
          } else {
            updated.push({ emoji, user: "me", isOptimistic: true });
          }
          return { ...post, reactions: updated };
        })
      );

      const data = await feedAPI.toggleReaction(moodId, emoji);
      if (data?.success) {
        setPosts((prev) => prev.map((p) => (p._id === moodId ? { ...p, reactions: data.reactions } : p)));
      }
    } catch (err) {
      console.error("Network reaction failure rejection fallback:", err);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center text-xs text-muted-foreground gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="font-light tracking-widest opacity-80">Assembling your social matrix...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground pb-28">
      <div className="max-w-md mx-auto px-4 pt-6 space-y-6">
        
        {/* Header Branding Area */}
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
              Close Circles Feed
            </h1>
            <p className="text-[11px] text-muted-foreground font-light mt-0.5">
              Your close connections' today mood updates
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground active:scale-95 transition-all shadow-sm"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Empty State Layout Fallback */}
        {posts?.length === 0 && (
          <div className="text-center py-16 bg-card border border-border/80 rounded-[1.5rem] px-6 space-y-3">
            <p className="text-xs font-semibold text-foreground/90">Your network stream is quiet</p>
            <p className="text-[11px] text-muted-foreground font-light max-w-[240px] mx-auto leading-relaxed">
              Connect with friends in the Hub or look back tomorrow once they update their daily profiles.
            </p>
          </div>
        )}

        {/* Stream Stack Container */}
        <div className="space-y-3.5">
          {posts?.map((post, index) => (
            <div key={post._id} ref={posts.length === index + 1 ? lastPostElementRef : null}>
              <FeedCard
                post={post}
                currentUserId={currentUserId}
                activeReactionTray={activeReactionTray}
                setActiveReactionTray={setActiveReactionTray}
                onReactionToggle={handleReactionToggle}
              />
            </div>
          ))}
        </div>

        {/* Bottom Lazy Spinner Check */}
        {loading && page > 1 && (
          <div className="w-full flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
        )}
      </div>
    </div>
  );
}