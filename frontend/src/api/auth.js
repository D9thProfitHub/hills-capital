// src/api/auth.js

// Register a new user
export async function register(email, password) {
  const res = await fetch("https://d9thprofithub.com.ng/api/register.php", {
    method: "POST",
    body: new URLSearchParams({ email, password })
  });
  return res.json();
}

// Login user
export async function login(email, password) {
  const res = await fetch("https://d9thprofithub.com.ng/api/login.php", {
    method: "POST",
    body: new URLSearchParams({ email, password })
  });
  const data = await res.json();
  if (data.token) {
    localStorage.setItem("token", data.token); // store token
  }
  return data;
}

// Get current user
export async function getMe() {
  const token = localStorage.getItem("token");
  const res = await fetch("https://d9thprofithub.com.ng/api/me.php", {
    headers: { Authorization: token }
  });
  return res.json();
}