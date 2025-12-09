<?php
// server-immediate.php
// Приймає дані кожного кроку миттєво
header("Content-Type: application/json");

$input = json_decode(file_get_contents("php://input"), true);

if ($input) {
    $logEntry = [
        'id' => $input['id'],
        'event' => $input['event'],
        'server_time' => microtime(true), // Точний час сервера
        'client_time' => $input['client_time']
    ];

    // Дописуємо у файл (імітація БД)
    $file = 'log_immediate.json';
    $currentData = file_exists($file) ? json_decode(file_get_contents($file), true) : [];
    $currentData[] = $logEntry;
    file_put_contents($file, json_encode($currentData));

    echo json_encode(['status' => 'saved', 'server_time' => $logEntry['server_time']]);
}
?>