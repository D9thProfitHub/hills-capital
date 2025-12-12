<?php
$host = "localhost"; // stays as localhost
$db   = "jbmkjshl_hills_capital_users";   // your actual database name
$user = "jbmkjshl_dbuser"; // your actual database user
$pass = "SmartTrader@3438#";    // the password you set

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("DB Connection failed: " . $e->getMessage());
}
?>