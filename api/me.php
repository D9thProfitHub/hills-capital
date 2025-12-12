<?php
include 'db.php';
include 'token.php'; // optional helper for token validation

$headers = getallheaders();
$token = $headers['Authorization'] ?? '';

if (!$token) {
    http_response_code(401);
    echo json_encode(["error" => "No token provided"]);
    exit;
}

// For now, decode token from DB or session (simple example)
$stmt = $pdo->prepare("SELECT id, email, created_at, subscription_status FROM users WHERE id = ?");
$stmt->execute([1]); // replace with logic to map token → userId
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    echo json_encode(["user" => $user]);
} else {
    http_response_code(401);
    echo json_encode(["error" => "Invalid token"]);
}
?>