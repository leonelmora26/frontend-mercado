<?php
require_once 'config.php'; // Incluir el archivo de configuración del key de autorización y conexión a la base de datos

$data = json_decode(file_get_contents('php://input'), true);
header('Content-Type: application/json');

// Para verificar lo que recibes
file_put_contents('log.txt', print_r($data, TRUE));

if (empty($data)) {
    echo json_encode(["success" => false, "error" => "Datos de factura no recibidos."]);
    exit;
}

function enviarFactura($factura_data)
{
    global $alegra_api_key;

    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => "https://api.alegra.com/api/v1/invoices",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => "",
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => "POST",
        CURLOPT_POSTFIELDS => json_encode($factura_data),
        CURLOPT_HTTPHEADER => [
            "accept: application/json",
            "authorization: Basic $alegra_api_key",
            "Content-Type: application/json"
        ],
    ]);

    $response = curl_exec($curl);
    $err = curl_error($curl);

    curl_close($curl);

    if ($err) {
        return ["success" => false, "error" => "cURL Error: $err"];
    }

    $response_data = json_decode($response, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        return ["success" => false, "error" => "Error al decodificar la respuesta de Alegra: $response"];
    }

    if (isset($response_data['numberTemplate']['fullNumber'])) {
        return ["success" => true, "response" => $response_data, "fullNumber" => $response_data['numberTemplate']['fullNumber']];
    } else {
        return ["success" => false, "error" => "No fullNumber in response", "response" => $response_data];
    }
}

$result = enviarFactura($data);
echo json_encode($result);

?>
