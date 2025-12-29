import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  {
    id: '1',
    title: 'Welcome to Cirkit!',
    message: 'Start exploring amazing electronics projects.',
    time: '2 hours ago',
    read: false,
  },
  {
    id: '2',
    title: 'New Project Added',
    message: 'Check out the latest Arduino weather station project.',
    time: '1 day ago',
    read: true,
  },
  {
    id: '3',
    title: 'Price Drop Alert',
    message: 'Components in your favorites are now on sale!',
    time: '3 days ago',
    read: true,
  },
];

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

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
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex flex-col items-start gap-1 p-3 cursor-pointer hover:bg-accent/50 transition-colors ${
                  !notification.read ? 'bg-primary/10' : ''
                }`}
                onClick={() => {
                  setNotifications(prev => 
                    prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
                  );
                }}
              >
                <div className="flex items-start gap-3 w-full">
                  {!notification.read && (
                    <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1 flex-shrink-0" />
                  )}
                  <div className={`flex-1 ${notification.read ? 'ml-5' : ''}`}>
                    <p className="font-semibold text-sm text-foreground leading-tight">{notification.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{notification.message}</p>
                    <p className="text-xs text-muted-foreground/70 mt-1.5">{notification.time}</p>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
