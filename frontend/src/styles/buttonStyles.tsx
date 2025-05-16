import { Colors } from "./colors";
import { Spacing } from "./spacing";
import { Typography } from "./typography";

const base = {
  ...Typography.buttonText,
  alignItems: "center",
  justifyContent: "center", // Good to add this too
  marginHorizontal: Spacing.base,
  marginVertical: Spacing.base,
};

const rounded = {
  borderRadius: 8,
};

export const ButtonStyles = {
  small: {
    paddingHorizontal: Spacing.small,
    paddingVertical: Spacing.small + 2,
    width: 75,
  },
  large: {
    paddingHorizontal: Spacing.large,
    paddingVertical: Spacing.large + 4,
  },
  primary: {
    ...base,
    ...rounded,
    backgroundColor: Colors.primary,
    marginVertical: Spacing.smallest,
  },
  facebookSignIn: {
    ...base,
    ...rounded,
    backgroundColor: Colors.facebookBlue,
  },
  googleSignIn: {
    ...base,
    ...rounded,
    backgroundColor: Colors.googleBlue,
  },
  appleSignIn: {
    ...base,
    ...rounded,
    backgroundColor: Colors.black,
  },
  disabled: {
    ...base,
    ...rounded,
    backgroundColor: Colors.tertiary,
  },
  textOnly: {
    ...base,
    backgroundColor: "transparent",
    shadowColor: "transparent",
  },
};
