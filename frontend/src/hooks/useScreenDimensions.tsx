// /hooks/useScreenDimensions.tsx

import { useWindowDimensions } from "react-native";

export const useScreenDimensions = () => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  return { screenWidth, screenHeight };
};
