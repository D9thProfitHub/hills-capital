<?php
include 'db.php';

$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(["error" => "Email and password required"]);
    exit;
}

// Hash password securely
$hash = password_hash($password, PASSWORD_BCRYPT);

// Insert into DB
$stmt = $pdo->prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)");
try {
    $stmt->execute([$email, $hash]);
    echo json_encode(["message" => "User registered successfully"]);
} catch (PDOException $e) {
    http_response_code(400);
    echo json_encode(["error" => "Email already exists"]);
}
?>