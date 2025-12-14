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

// ✅ Get input safely
$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(["error" => "Email and password required"]);
    exit;
}

// ✅ Hash password securely
$hash = password_hash($password, PASSWORD_BCRYPT);

// ✅ Insert into DB
$stmt = $pdo->prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)");

try {
    $stmt->execute([$email, $hash]);
    http_response_code(200);
    echo json_encode(["message" => "User registered successfully"]);
} catch (PDOException $e) {
    http_response_code(400);
    echo json_encode(["error" => "Email already exists"]);
}
?>