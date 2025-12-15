<?php
$host = "127.0.0.1"; 
$db   = "jbmkjshl_hills_capital_users"; 
$user = "jbmkjshl_dbuser"; 
$pass = "SmartTrader@3438#"; 

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    header("Content-Type: application/json");
    echo json_encode(["error" => "DB Connection failed", "details" => $e->getMessage()]);
    exit;
}
?>