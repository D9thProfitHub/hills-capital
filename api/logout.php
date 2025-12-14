<?php
// --- CORS headers ---
header("Access-Control-Allow-Origin: https://your-vercel-project.vercel.app"); // replace with your actual Vercel domain
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// --- Handle preflight OPTIONS request ---
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

session_start();

// --- Clear session data ---
$_SESSION = [];
session_unset();
session_destroy();

// --- Clear any cookies (optional, if you set cookies for auth) ---
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// --- Return success response ---
http_response_code(200);
echo json_encode(["message" => "Logout successful"]);
?>