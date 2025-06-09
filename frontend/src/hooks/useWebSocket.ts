import { useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { websocketService } from "../services/websocket";

export function useWebSocket() {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      websocketService.connect();
      websocketService.registerUser(user.id);
    } else {
      websocketService.disconnect();
    }

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
