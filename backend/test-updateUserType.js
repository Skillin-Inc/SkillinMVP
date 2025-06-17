// node test-updateUserType.js

const axios = require("axios");

async function updateUserType() {
  const email = "student@email.com";
  const encodedEmail = encodeURIComponent(email);
  const url = `http://localhost:4000/users/${encodedEmail}/user-type`;

  try {
    // Test updating to teacher
    const res = await axios.patch(url, { userType: "teacher" });
    console.log(`Status: ${res.status}`);
    console.log("Body:", res.data);

    // Test updating to admin
    const res2 = await axios.patch(url, { userType: "admin" });
    console.log(`Status: ${res2.status}`);
    console.log("Body:", res2.data);

    // Test updating back to student
    const res3 = await axios.patch(url, { userType: "student" });
    console.log(`Status: ${res3.status}`);
    console.log("Body:", res3.data);
  } catch (err) {
    if (err.response) {
      console.error(`Error Status: ${err.response.status}`);
      console.error("Error Body:", err.response.data);
    } else {
      console.error("Request Error:", err.message);
    }
  }
}

updateUserType();
