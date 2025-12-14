<?php
// --- CORS headers ---
header("Access-Control-Allow-Origin: https://hills-capital.vercel.app"); // replace with your actual Vercel domain
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

// --- Decode JSON input (Axios sends JSON) ---
$input = json_decode(file_get_contents("php://input"), true);

$name     = trim($input['name'] ?? '');
$email    = trim($input['email'] ?? '');
$phone    = trim($input['phone'] ?? '');
$password = trim($input['password'] ?? '');

// --- Validate required fields ---
if (empty($name) || empty($email) || empty($phone) || empty($password)) {
    http_response_code(400);
    echo json_encode(["error" => "Name, email, phone, and password are required"]);
    exit;
}

// --- Hash password securely ---
$hash = password_hash($password, PASSWORD_BCRYPT);

// --- Insert into database ---
try {
    $stmt = $pdo->prepare("INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)");
    $stmt->execute([$name, $email, $phone, $hash]);

    http_response_code(200);
    echo json_encode(["message" => "User registered successfully"]);
} catch (PDOException $e) {
    // Handle duplicate email or other DB errors
    http_response_code(400);
    echo json_encode(["error" => "Registration failed: " . $e->getMessage()]);
}
?>