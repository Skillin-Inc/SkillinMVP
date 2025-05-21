import { COLORS } from "./colors";
import { SPACINGS } from "./spacings";
import { TYPOGRAPHY } from "./typography";

const base = {
  ...TYPOGRAPHY.buttonText,
  alignItems: "center",
  justifyContent: "center",
  marginHorizontal: SPACINGS.base,
  marginVertical: SPACINGS.base,
};

const rounded = {
  borderRadius: 8,
};

export const ButtonStyles = {
  small: {
    paddingHorizontal: SPACINGS.small,
    paddingVertical: SPACINGS.small + 2,
    width: 75,
  },
  large: {
    paddingHorizontal: SPACINGS.large,
    paddingVertical: SPACINGS.large + 4,
  },
  primary: {
    ...base,
    ...rounded,
    backgroundColor: COLORS.black,
    marginVertical: SPACINGS.smallest,
  },
  facebookSignIn: {
    ...base,
    ...rounded,
    backgroundColor: "#3b5998",
  },
  googleSignIn: {
    ...base,
    ...rounded,
    backgroundColor: "#4c8bf5",
  },
  appleSignIn: {
    ...base,
    ...rounded,
    backgroundColor: COLORS.black,
  },
  disabled: {
    ...base,
    ...rounded,
    backgroundColor: "rgba(60, 67, 97, 0.2)",
  },
  textOnly: {
    ...base,
    backgroundColor: "transparent",
    shadowColor: "transparent",
  },
};
