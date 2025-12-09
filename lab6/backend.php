<?php
// backend.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$file = 'data.json';

// Якщо прийшов запит POST - зберігаємо дані
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    // Валідація JSON
    $decoded = json_decode($input);
    if ($decoded !== null) {
        file_put_contents($file, $input);
        echo json_encode(["status" => "success", "message" => "Toasts saved"]);
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid JSON"]);
    }
} 
// Якщо прийшов запит GET - віддаємо дані
else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($file)) {
        echo file_get_contents($file);
    } else {
        echo json_encode([]); // Повертаємо пустий масив, якщо файлу ще немає
    }
}
?>