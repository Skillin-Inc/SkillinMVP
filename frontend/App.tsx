// App.tsx
import Navigation from './Navigation';

import { AuthProvider } from './/src/features/auth/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}
