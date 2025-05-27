const axios = require("axios");

async function testDelete() {
  const email = "shovang112233@gmail.com";
  const encodedEmail = encodeURIComponent(email);
  const url = `http://localhost:4000/users/${encodedEmail}`; // ✅ fixed path

  try {
    const res = await axios.delete(url);
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

testDelete();
