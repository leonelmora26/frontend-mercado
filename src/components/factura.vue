 <?php

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Verificar si el archivo ha sido subido
    if (isset($_FILES['archivo_csv'])) {
        $archivo = $_FILES['archivo_csv'];
        $nombreArchivo = $archivo['name'];
        $tipoArchivo = $archivo['type'];
        $rutaTemporal = $archivo['tmp_name'];
        $error = $archivo['error'];
        $tamañoArchivo = $archivo['size'];

        // Verificar si hay errores en la subida
        if ($error === UPLOAD_ERR_OK) {
            // Verificar que el archivo sea un CSV
            if ($tipoArchivo === 'text/csv' || $tipoArchivo === 'application/vnd.ms-excel') {
                // Ruta donde guardar el archivo subido
                $rutaDestino = 'uploads/' . $nombreArchivo;

                // Mover el archivo desde la carpeta temporal a la carpeta de destino
                if (move_uploaded_file($rutaTemporal, $rutaDestino)) {
                    echo json_encode(['mensaje' => 'Archivo subido correctamente', 'nombre' => $nombreArchivo]);

                    // Procesar el archivo CSV
                    if (($gestor = fopen($rutaDestino, "r")) !== false) {
                        // Leer las filas del CSV
                        while (($datos = fgetcsv($gestor, 1000, ",")) !== false) {
                            // Aquí puedes procesar cada fila del CSV (almacenar en la base de datos, etc.)
                            print_r($datos); // Mostrar cada fila (opcional)
                        }
                        fclose($gestor);
                    } else {
                        echo json_encode(['error' => 'Error al abrir el archivo']);
                    }
                } else {
                    echo json_encode(['error' => 'Error al mover el archivo subido']);
                }
            } else {
                echo json_encode(['error' => 'Solo se permiten archivos CSV']);
            }
        } else {
            echo json_encode(['error' => 'Error al subir el archivo: ' . $error]);
        }
    } else {
        echo json_encode(['error' => 'No se ha seleccionado ningún archivo']);
    }
} else {
    echo json_encode(['error' => 'Método no permitido']);
}

?>
