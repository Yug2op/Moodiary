"use client";

import { useEffect, useState } from "react";
import { FloatingDock } from "@/components/ui/floating-dock";

import {
  IconHome,
  IconMoodSmile,
  IconFlame,
  IconChartBar,
  IconUser,
  IconLogout,
} from "@tabler/icons-react";
import { CircleUser, CircleUserRound, PlusCircle, UserRound, UserRoundPlus, UsersRound } from "lucide-react";

export default function BottomNavbar() {
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // show when scrolling down
      if (currentScrollY > lastScrollY) {
        setVisible(false);
      }

      // hide when scrolling up
      else {
        setVisible(true);
      }

      // always show near top
      if (currentScrollY < 50) {
        setVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  const links = [
    {
      title: "Home",
      icon: (
        <IconHome className="h-full w-full text-neutral-400" />
      ),
      href: "/feed",
    },

    {
      title: "Add Mood",
      icon: (
        <PlusCircle className="h-full w-full text-neutral-400" />
      ),
      href: "/mood",
    },

    {
      title: "See Insights",
      icon: (
        <IconChartBar className="h-full w-full text-neutral-400" />
      ),
      href: "/insights",
    },

    {
      title: "Add Friends",
      icon: (
        <UsersRound className="h-full w-full text-neutral-400" />
      ),
      href: "/friends",
    },

    {
      title: "Profile",
      icon: (
        <CircleUser className="h-full w-full text-neutral-400" />
      ),
      href: "/profile",
    },
  ];

  return (
    <div
      className={`
        fixed bottom-4 left-1/2 z-50
        -translate-x-1/2
        transition-all duration-500
        ${visible
          ? "translate-y-0 opacity-100"
          : "translate-y-24 opacity-0"
        }
      `}
    >
      <div>
        <FloatingDock
          items={links}
          desktopClassName="
            shadow-2xl
            backdrop-blur-2xl
            supports-[backdrop-filter]:bg-black/20
          "
          mobileClassName="
            bg-transparent
            shadow-none
            border-none
            
          "
        />
      </div>
    </div>
  );
}