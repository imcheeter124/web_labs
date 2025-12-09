<?php
// Очищує логи перед новим запуском
file_put_contents('log_immediate.json', '[]');
file_put_contents('log_batch.json', '[]');
echo json_encode(['status' => 'cleared']);
?>