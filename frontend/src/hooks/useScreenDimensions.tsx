// /hooks/useScreenDimensions.tsx

import { useWindowDimensions } from "react-native";

export function useScreenDimensions() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  return { screenWidth, screenHeight };
}
