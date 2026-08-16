import { Link } from "@tanstack/react-router";
import { memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { UserChipHoverCard } from "@/components/user/ProfileCard";
import { DateTooltip } from "./date-tooltip";

interface HeaderProps {
    user: {
        user_id: string;
        username: string;
        displayName: string;
        avatarUrl?: string | null;
        accentColor?: string | null;
        isPremium: boolean;
    };
    dateLabel: string;
    fullDateString: string;
    stats?: {
        views_total: number;
        unique_viewers: number;
        last_view_at: string | null;
    };
    animateGate?: boolean;
}

export const Header = memo(function Header({
    user,
    dateLabel,
    fullDateString,
}: HeaderProps) {
    return (
        <div className="pointer-events-auto absolute top-2 right-2 left-2 z-30 text-white sm:top-3 sm:right-3 sm:left-3">
            <div className="flex w-full min-w-0 items-start justify-between gap-2 overflow-hidden">
                {/* User Card - with flexible width and truncation */}
                <div className="min-w-0 max-w-[calc(100%-120px)] shrink">
                    <div className="truncate">
                        <Link
                            to="/{-$locale}/user/$username"
                            params={{ username: user.username }}
                            className="flex items-center gap-2 rounded-full bg-black/50 px-2 py-1 transition-colors hover:bg-black/70"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Avatar className="size-6">
                                <AvatarImage
                                    src={user.avatarUrl || undefined}
                                    alt={user.displayName}
                                />
                                <AvatarFallback>
                                    {user.displayName.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span className="truncate text-xs font-medium">
                                {user.displayName}
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Date and Views - right aligned, fixed width */}
                <div className="flex w-auto shrink-0 flex-col items-end gap-1">
                    {/* Date */}
                    <DateTooltip dateLabel={dateLabel} fullDateString={fullDateString} />
                </div>
            </div>
        </div>
    );
});
