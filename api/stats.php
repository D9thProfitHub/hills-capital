<?php
// --- CORS headers ---
header("Access-Control-Allow-Origin: https://hills-capital.vercel.app"); // must match your frontend domain
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// --- Handle preflight OPTIONS request ---
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include 'db.php';

// --- Configure session cookie for cross-origin ---
ini_set('session.cookie_secure', 1);        // only send over HTTPS
ini_set('session.cookie_samesite', 'None'); // allow cross-site requests
ini_set('session.cookie_httponly', 1);      // prevent JS access
ini_set('session.cookie_lifetime', 3600);   // 1 hour lifetime

session_start();

// --- Get user ID from session ---
$userId = $_SESSION['user_id'] ?? null;

if (!$userId) {
    http_response_code(401);
    echo json_encode(["error" => "User not authenticated"]);
    exit;
}

// --- Fetch user stats ---
$stmt = $pdo->prepare("SELECT balance, subscription_level FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    http_response_code(404);
    echo json_encode(["error" => "User not found"]);
    exit;
}

// --- Return JSON response ---
http_response_code(200);
echo json_encode([
    "stats" => [
        "balance" => $user['balance'] ?? 0,
        "totalInvestments" => 0 // add if you track investments
    ],
    "subscriptionStatus" => ($user['subscription_level'] ?? 'free') === 'free' ? 'inactive' : 'active',
    "currentPlan" => $user['subscription_level'] ?? 'free',
    "welcomeMessage" => "Welcome back!"
]);
?>