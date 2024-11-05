<?php
// Archivo config.php
$alegra_api_key = "b3NjYXJncm9kcmlAaG90bWFpbC5jb206M2Y0YjczNTIwNTU4ZmE2ZGFiYjM=";

// Configuración de la conexión a la base de datos
$servername = "localhost";
$username = "sensorsarduino";
$password = "123456";
$dbname = "sensorsarduino";
// Crear conexión
// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    die("Conexión fallida: {$conn->connect_error}");
}


// Establecer conjunto de caracteres a utf8mb4
if (!$conn->set_charset("utf8mb4")) {
    die("Error al cargar el conjunto de caracteres utf8mb4: " . $conn->error);
}
?>