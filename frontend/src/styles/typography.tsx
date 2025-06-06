import { Colors } from "./colors";

export const Typography = {
  buttonText: {
    color: Colors.white,
    fontWeight: "bold" as const,
    fontSize: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold" as const,
    color: Colors.darkText,
  },
  inputText: {
    fontSize: 16,
    color: Colors.darkGray,
  },
};
