// App.tsx
import AppNavigator from "./src/navigation/AppNavigator";

import { AuthProvider } from "./src/hooks/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
