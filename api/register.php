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
    // 👇 Default subscription_level is "free"
    $stmt = $pdo->prepare("INSERT INTO users (name, email, phone, password_hash, subscription_level) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$name, $email, $phone, $hash, 'free']);

    // Get the newly created user ID
    $userId = $pdo->lastInsertId();

    // Fetch the user back
    $stmt = $pdo->prepare("SELECT id, name, email, phone, subscription_level FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode([
        "message" => "User registered successfully",
        "user" => $user
    ]);
} catch (PDOException $e) {
    http_response_code(400);
    echo json_encode(["error" => "Registration failed: " . $e->getMessage()]);
}
?>