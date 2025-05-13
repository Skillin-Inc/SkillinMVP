// App.tsx
<<<<<<< HEAD
import Navigation from './navigation/Navigation';

import { AuthProvider } from './/src/features/auth/AuthContext';
=======
import Navigation from "./Navigation";
>>>>>>> 185aa2b (Applied Prettier and ESLint)

export default function App() {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}