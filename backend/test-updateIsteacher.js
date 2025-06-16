// node test-updateIsteacher.js

const axios = require("axios");

async function toggleIsTeacher() {
  const email = "student@email.com";
  const encodedEmail = encodeURIComponent(email);
  const url = `http://localhost:4000/users/${encodedEmail}`;

  try {
    const res = await axios.patch(url);
    console.log(`Status: ${res.status}`);
    console.log("Body:", res.data);
  } catch (err) {
    if (err.response) {
      console.error(`Error Status: ${err.response.status}`);
      console.error("Error Body:", err.response.data);
    } else {
      console.error("Request Error:", err.message);
    }
  }
}

toggleIsTeacher();
