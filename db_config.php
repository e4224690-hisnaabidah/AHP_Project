<?php
// db_config.php
$servername = "localhost";
$username = "root";
$password = ""; // laragon default: kosong
$dbname = "ahp_from_sheet";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Koneksi gagal: " . $conn->connect_error);
}
$conn->set_charset("utf8mb4");
?>
