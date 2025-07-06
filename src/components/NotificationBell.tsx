import React, { useState } from "react";
import {
  Bell,
  Clock,
  Users,
  CircleDollarSign,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNotifications } from "@/hooks/useNotifications";
import { NOTIFICATION_TYPES } from "@/constants/notifications";
import { formatDistanceToNow } from "date-fns";

const notificationIcons = {
  [NOTIFICATION_TYPES.CONTRIBUTION_REMINDER]: CircleDollarSign,
  [NOTIFICATION_TYPES.PAYOUT_ALERT]: CircleDollarSign,
  [NOTIFICATION_TYPES.GROUP_MESSAGE]: MessageSquare,
  [NOTIFICATION_TYPES.MEMBER_JOINED]: Users,
  [NOTIFICATION_TYPES.PAYOUT_RECEIVED]: CircleDollarSign,
  [NOTIFICATION_TYPES.CONTRIBUTION_RECEIVED]: CircleDollarSign,
  [NOTIFICATION_TYPES.GROUP_FULL]: Users,
};

export const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const [open, setOpen] = useState(false);

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Notifications</h4>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {notifications.map((notification) => {
                const IconComponent =
                  notificationIcons[notification.type] || Bell;
                return (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors ${
                      !notification.read
                        ? "bg-primary/5 border-l-2 border-l-primary"
                        : ""
                    }`}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-1 rounded-full ${
                          !notification.read ? "bg-primary/20" : "bg-muted"
                        }`}
                      >
                        <IconComponent
                          className={`h-4 w-4 ${
                            !notification.read
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p
                            className={`text-sm font-medium ${
                              !notification.read
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="h-2 w-2 bg-primary rounded-full"></div>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground">
                          {notification.message}
                        </p>

                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(
                            new Date(notification.created_at),
                            { addSuffix: true }
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-xs"
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};
