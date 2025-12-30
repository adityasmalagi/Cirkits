import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

export function NotificationsDropdown() {
  const { user } = useAuth();
  const { notifications, isLoading, unreadCount, markAsRead, markAllAsRead, getRelativeTime } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs gradient-primary border-0"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 bg-popover text-popover-foreground border border-border" align="end">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h4 className="font-semibold text-foreground">Notifications</h4>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {!user ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground text-sm mb-3">Sign in to view notifications</p>
              <Button asChild size="sm" variant="outline">
                <Link to="/auth">Sign In</Link>
              </Button>
            </div>
          ) : isLoading ? (
            <div className="p-3 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 p-2">
                  <Skeleton className="h-2.5 w-2.5 rounded-full mt-1 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex flex-col items-start gap-1 p-3 cursor-pointer hover:bg-accent/50 transition-colors ${
                  !notification.read ? 'bg-primary/10' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3 w-full">
                  {!notification.read && (
                    <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1 flex-shrink-0" />
                  )}
                  <div className={`flex-1 ${notification.read ? 'ml-5' : ''}`}>
                    <p className="font-semibold text-sm text-foreground leading-tight">{notification.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{notification.message}</p>
                    <p className="text-xs text-muted-foreground/70 mt-1.5">{getRelativeTime(notification.created_at)}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-muted-foreground text-sm">
              No notifications yet
            </div>
          )}
        </ScrollArea>
        {user && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button 
                variant="ghost" 
                className="w-full text-sm text-foreground hover:text-foreground hover:bg-accent/50" 
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                Mark all as read
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
