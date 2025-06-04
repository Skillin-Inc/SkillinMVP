import { useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { websocketService } from "../services/websocket";

export function useWebSocket() {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      // Connect and register user when logged in
      websocketService.connect();
      websocketService.registerUser(user.id);
    } else {
      // Disconnect when logged out
      websocketService.disconnect();
    }

    // Cleanup on unmount
    return () => {
      if (!user) {
        websocketService.disconnect();
      }
    };
  }, [user]);

  return {
    isConnected: websocketService.isConnected(),
    websocketService,
  };
}
