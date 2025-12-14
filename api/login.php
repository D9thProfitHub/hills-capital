<?php
// ✅ CORS headers (allow your Vercel frontend)
header("Access-Control-Allow-Origin: https://hills-capital.vercel.app"); // replace with your actual Vercel domain
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// ✅ Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include 'db.php';

// ✅ Start session for token storage
session_start();

// ✅ Get input safely
$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(["error" => "Email and password required"]);
    exit;
}

// ✅ Fetch user from DB
$stmt = $pdo->prepare("SELECT id, email, password_hash FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid email or password"]);
    exit;
}

// ✅ Verify password
if (!password_verify($password, $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid email or password"]);
    exit;
}

// ✅ Generate a simple token (replace with JWT if needed)
$token = bin2hex(random_bytes(32));

// ✅ Store token and user ID in session
$_SESSION['token'] = $token;
$_SESSION['user_id'] = $user['id'];

// ✅ Return success response
http_response_code(200);
echo json_encode([
    "message" => "Login successful",
    "token" => $token,
    "user" => [
        "id" => $user['id'],
        "email" => $user['email']
    ]
]);
?>