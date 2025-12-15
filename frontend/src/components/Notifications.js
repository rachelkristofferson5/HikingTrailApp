import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react"; //icon library
import "./Notifications.css";

const API_URL = "https://hikingtrailapp-production.up.railway.app";

const Notifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch unread notifications count
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/notifications/unread/`, {
        headers: {
          "Authorization": `Token ${token}`
        }
      });
      const data = await response.json();
      setUnreadCount(data.length);
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/api/notifications/${notificationId}/mark_read/`, {
        method: "POST",
        headers: {
          "Authorization": `Token ${token}`
        }
      });
      fetchUnreadCount(); // Refresh count
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/api/notifications/mark_all_read/`, {
        method: "POST",
        headers: {
          "Authorization": `Token ${token}`
        }
      });
      fetchUnreadCount();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  return (
    <div className="notification-container">
      <button 
        className="notification-bell"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead}>Mark all read</button>
            )}
          </div>
          
          <div className="notification-list">
            {notifications.length === 0 ? (
              <p className="no-notifications">No new notifications</p>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.notification_id} 
                  className="notification-item"
                  onClick={() => markAsRead(notif.notification_id)}
                >
                  <p>{notif.message}</p>
                  <span className="notification-time">
                    {new Date(notif.created_at).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;