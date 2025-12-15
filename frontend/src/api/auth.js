// src/api/auth.js (Sessions)

export async function register({ name, email, phone, password }) {
  const res = await fetch("https://d9thprofithub.com.ng/api/register.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone, password }),
    credentials: "include" // 👈 send cookies
  });
  return res.json();
}

export async function login(email, password) {
  const res = await fetch("https://d9thprofithub.com.ng/api/login.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include" // 👈 send cookies
  });
  return res.json();
}

export async function getMe() {
  const res = await fetch("https://d9thprofithub.com.ng/api/me.php", {
    method: "GET",
    credentials: "include" // 👈 send cookies
  });
  return res.json();
}