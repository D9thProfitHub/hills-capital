<?php
// ✅ CORS headers (allow your Vercel frontend)
header("Access-Control-Allow-Origin: https://hills-capital.vercel.app");
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

// ✅ Get Authorization header
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';

if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(["error" => "Authorization token required"]);
    exit;
}

$token = $matches[1];

// ⚠️ NOTE: In the login.php we generated a random token. 
// For production, you’d normally store this token in DB or use JWT.
// Here we’ll just simulate token validation for demonstration.

session_start();
if (!isset($_SESSION['token']) || $_SESSION['token'] !== $token) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid or expired token"]);
    exit;
}

// ✅ Fetch user info (assuming you stored user ID in session)
$userId = $_SESSION['user_id'] ?? null;

if (!$userId) {
    http_response_code(401);
    echo json_encode(["error" => "User not authenticated"]);
    exit;
}

$stmt = $pdo->prepare("SELECT id, email FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    http_response_code(404);
    echo json_encode(["error" => "User not found"]);
    exit;
}

http_response_code(200);
echo json_encode([
    "message" => "User authenticated",
    "user" => $user
]);
?>