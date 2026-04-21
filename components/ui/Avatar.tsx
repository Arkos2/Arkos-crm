import { forwardRef, HTMLAttributes } from "react";
import { cn, getInitials } from "@/lib/utils";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
type StatusType = "online" | "offline" | "busy" | "away";

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  name?: string;
  size?: AvatarSize;
  status?: StatusType;
  ring?: boolean;
}

const sizes: Record<AvatarSize, string> = {
  xs: "w-6 h-6 text-2xs",
  sm: "w-8 h-8 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-11 h-11 text-base",
  xl: "w-14 h-14 text-lg",
};

const statusSizes: Record<AvatarSize, string> = {
  xs: "w-1.5 h-1.5",
  sm: "w-2 h-2",
  md: "w-2.5 h-2.5",
  lg: "w-3 h-3",
  xl: "w-3.5 h-3.5",
};

const statusColors: Record<StatusType, string> = {
  online: "bg-success",
  offline: "bg-text-muted",
  busy: "bg-danger",
  away: "bg-warning",
};

// Cores de avatar por inicial (determinístico)
const avatarColors = [
  "from-blue-600 to-blue-800",
  "from-purple-600 to-purple-800",
  "from-green-600 to-green-800",
  "from-orange-600 to-orange-800",
  "from-pink-600 to-pink-800",
  "from-indigo-600 to-indigo-800",
  "from-teal-600 to-teal-800",
  "from-red-600 to-red-800",
];

function getAvatarColor(name: string): string {
  const index =
    name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    avatarColors.length;
  return avatarColors[index];
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, name = "", size = "md", status, ring = false, className, ...props }, ref) => {
    const initials = getInitials(name);
    const gradientClass = getAvatarColor(name);

    return (
      <div
        ref={ref}
        className={cn("relative shrink-0 inline-flex", className)}
        {...props}
      >
        <div
          className={cn(
            "rounded-full overflow-hidden flex items-center justify-center",
            "font-semibold text-white select-none",
            sizes[size],
            ring &&
              "ring-2 ring-arkos-blue ring-offset-1 ring-offset-arkos-bg",
            !src && `bg-gradient-to-br ${gradientClass}`
          )}
        >
          {src ? (
            <img
              src={src}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{initials || "?"}</span>
          )}
        </div>

        {status && (
          <span
            className={cn(
              "absolute bottom-0 right-0 rounded-full border-2 border-arkos-bg",
              statusSizes[size],
              statusColors[status],
              status === "online" && "animate-pulse-slow"
            )}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

// Avatar Group
interface AvatarGroupProps {
  avatars: Array<{ src?: string; name: string }>;
  max?: number;
  size?: AvatarSize;
}

export function AvatarGroup({ avatars, max = 3, size = "sm" }: AvatarGroupProps) {
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className="flex -space-x-2">
      {visible.map((avatar, i) => (
        <Avatar
          key={i}
          src={avatar.src}
          name={avatar.name}
          size={size}
          className="ring-2 ring-arkos-bg"
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            "rounded-full bg-arkos-surface-3 border-2 border-arkos-bg",
            "flex items-center justify-center text-2xs font-medium text-text-secondary",
            sizes[size]
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
