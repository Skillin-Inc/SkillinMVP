// frontend/src/services/payments.ts
// use the variable is_paid to check whether the user has made the payments or not

import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const checkIfPaid = async (userId: number): Promise<boolean> => {
  console.log("Calling:", `${BASE_URL}/users/check-paid-status`, "with", userId);

  const response = await axios.get(`${BASE_URL}/users/check-paid-status`, {
    params: { userId },
  });

  console.log("✅ Received response:", response.data);

  return response.data?.isPaid ?? false;
};
