// App.tsx
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/hooks/AuthContext";
import { useWebSocket } from "./src/hooks/useWebSocket";

function AppContent() {
  // Initialize WebSocket connection
  useWebSocket();

  return <AppNavigator />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
