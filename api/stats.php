<?php
header("Access-Control-Allow-Origin: https://hills-capital.vercel.app");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

include 'db.php';
session_start();

$userId = $_SESSION['user_id'] ?? null;
if (!$userId) {
    http_response_code(401);
    echo json_encode(["error" => "User not authenticated"]);
    exit;
}

$stmt = $pdo->prepare("SELECT balance, subscription_level FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    http_response_code(404);
    echo json_encode(["error" => "User not found"]);
    exit;
}

echo json_encode([
    "stats" => [
        "balance" => $user['balance'] ?? 0,
        "totalInvestments" => 0 // add if you track investments
    ],
    "subscriptionStatus" => $user['subscription_level'] === 'free' ? 'inactive' : 'active',
    "currentPlan" => $user['subscription_level'],
    "welcomeMessage" => "Welcome back!"
]);
?>