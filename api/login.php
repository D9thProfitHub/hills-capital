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

// --- Start session for token storage ---
session_start();

// --- Decode JSON input (Axios sends JSON) ---
$input = json_decode(file_get_contents("php://input"), true);

$email    = trim($input['email'] ?? '');
$password = trim($input['password'] ?? '');

// --- Validate required fields ---
if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(["error" => "Email and password are required"]);
    exit;
}

// --- Fetch user from DB (include subscription_level) ---
$stmt = $pdo->prepare("SELECT id, name, email, phone, password_hash, subscription_level FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid email or password"]);
    exit;
}

// --- Verify password ---
if (!password_verify($password, $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid email or password"]);
    exit;
}

// --- Generate a simple token (replace with JWT if needed) ---
$token = bin2hex(random_bytes(32));

// --- Store token and user ID in session ---
$_SESSION['token']   = $token;
$_SESSION['user_id'] = $user['id'];

// --- Return success response ---
http_response_code(200);
echo json_encode([
    "message" => "Login successful",
    "token"   => $token,
    "user"    => [
        "id"                 => $user['id'],
        "name"               => $user['name'],
        "email"              => $user['email'],
        "phone"              => $user['phone'],
        "subscription_level" => $user['subscription_level'] ?? 'free'
    ]
]);
?>