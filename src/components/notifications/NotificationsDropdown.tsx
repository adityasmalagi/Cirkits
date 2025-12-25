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

// Mock notifications - in a real app, these would come from the database
const mockNotifications = [
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
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

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
          {mockNotifications.length > 0 ? (
            mockNotifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start gap-1 p-3 cursor-pointer focus:bg-accent focus:text-accent-foreground ${
                  !notification.read ? 'bg-primary/5' : ''
                }`}
              >
                <div className="flex items-start gap-2 w-full">
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  )}
                  <div className={!notification.read ? '' : 'ml-4'}>
                    <p className="font-medium text-sm text-foreground">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No notifications yet
            </div>
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <div className="p-2">
          <Button variant="ghost" className="w-full text-sm text-foreground hover:text-foreground" size="sm">
            Mark all as read
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
