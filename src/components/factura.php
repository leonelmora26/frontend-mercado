<?php

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Verificar si el archivo ha sido subido
    if (isset($_FILES['archivo_csv'])) {
        $archivo = $_FILES['archivo_csv'];
        $nombreArchivo = $archivo['name'];
        $tipoArchivo = $archivo['type'];
        $rutaTemporal = $archivo['tmp_name'];
        $error = $archivo['error'];

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
                        $datosCSV = [];
                        while (($datos = fgetcsv($gestor, 1000, ",")) !== false) {
                            // Verificar que la fila tenga la cantidad esperada de columnas
                            if (count($datos) >= 6) {
                                // Almacenar cada fila en un array
                                $datosCSV[] = [
                                    'nombre' => $datos[0], // Primer campo del CSV
                                    'idenficicacion' => $datos[1],  // Segundo campo del CSV
                                    'codigo_producto' => $datos[2],
                                    'cantidadProducto' => $datos[3], // Tercer campo del CSV
                                    'valor_unitario' => $datos[4],
                                    'codigoImpuestoCargo' => $datos[5],
                                    'retencion' => $datos[6],
                                    'valorRetencion' => $datos[7],
                                    'reteica' => $datos[8],
                                    'valorReteica' => $datos[9],
                                    'porcentajeDescuento' => $datos[10],
                                    'fecha_vencimiento' => $datos[11],
                                    'fecha_elaboracion' => $datos[12],
                                    'total' => $datos[13],
                                    'anidar' => $datos[14]
                                ];
                            }
                        }
                        fclose($gestor);
                        // Devolver los datos procesados como JSON
                        echo json_encode(['mensaje' => 'Archivo procesado correctamente', 'data' => $datosCSV]);
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

require('./fpdf.php');

class PDF extends FPDF
{
    function AddHelloTable()
    {
        // Establecer el tamaño de la fuente
        $this->SetFont('Arial', 'B', 6);

        // Establecer la posición Y deseada (ajustada para estar dentro del área visible)
        $this->SetY(170);
        $this->SetX(0);

        // Dibujar una tabla de 2x2 con el texto "Hola"
        for ($i = 0; $i < 2; $i++) {
            for ($j = 0; $j < 2; $j++) {
                $this->Cell(70, 8, 'Hola', 1, 0, );
            }
            $this->Ln(); // Salto de línea para la siguiente fila
        }
    }

    // Función para dibujar la línea con tres puntos
    function DrawLineWithPoints($pageWidth)
    {
        // Coordenadas y propiedades de la línea
        $lineY = 36; // Posición Y de la línea (parte superior)
        $lineXStart = 32; // Comienzo de la línea en el borde izquierdo
        $lineXEnd = $pageWidth - 32; // Final de la línea en el borde derecho
        $lineColor = [226, 48, 9]; // Color para la línea

        // Fechas para colocar arriba de cada punto
        $dates = [
            "25/08",
            "30/08",
            "05/09"
        ];

        // Textos para colocar abajo de cada punto
        $texts = [
            "Inicio de periodo",
            "Fecha de suspension",
            "Fin de periodo"
        ];

        // Configuración de los puntos
        $circleRadius = 2; // Radio de los puntos

        // Posiciones de los puntos
        $points = [
            $lineXStart,
            ($lineXStart + $lineXEnd) / 2, // Punto medio de la línea
            $lineXEnd
        ];

        // Dibujar la línea
        $this->SetDrawColor($lineColor[0], $lineColor[1], $lineColor[2]); // Color de la línea
        $this->SetLineWidth(0.5); // Grosor de la línea
        $this->Line($lineXStart, $lineY, $lineXEnd, $lineY);

        // Configuración del color y fuente para los puntos
        $this->SetFillColor(255, 255, 255); // Relleno blanco para los puntos
        $this->SetDrawColor($lineColor[0], $lineColor[1], $lineColor[2]); // Color del borde
        $this->SetFont('Arial', '', 8); // Fuente para los textos

        foreach ($points as $index => $x) {
            // Dibujar el punto
            $this->Circle($x, $lineY, $circleRadius, 'DF'); // 'DF' para dibujar el borde y rellenar

            // Posicionar el texto de las fechas arriba de cada punto
            $date = $dates[$index];
            $dateWidth = $this->GetStringWidth($date);
            $this->SetXY($x - $dateWidth / 2, $lineY - $circleRadius - 5); // Centrar el texto de la fecha arriba del punto
            $this->Cell($dateWidth, 5, $date, 0, 0, 'C');

            // Posicionar el texto descriptivo abajo de cada punto
            $text = $texts[$index];
            $textWidth = $this->GetStringWidth($text);
            $this->SetXY($x - $textWidth / 2, $lineY + $circleRadius + 1); // Centrar el texto descriptivo debajo del punto
            $this->Cell($textWidth, 5, $text, 0, 0, 'C');
        }
    }

    // Función para dibujar un círculo
    function Circle($x, $y, $r, $style = 'D')
    {
        $this->Ellipse($x, $y, $r, $r, $style);
    }


    // Función para dibujar una elipse (círculo)
    function Ellipse($x, $y, $rx, $ry, $style = 'D')
    {
        if ($style == 'F') {
            $op = 'f';
        } elseif ($style == 'DF' || $style == 'FD') {
            $op = 'B';
        } else {
            $op = 'S';
        }
        $lx = 4 / 3 * (M_SQRT2 - 1) * $rx;
        $ly = 4 / 3 * (M_SQRT2 - 1) * $ry;
        $this->_out(sprintf('%.2F %.2F m', ($x + $rx) * $this->k, ($this->h - $y) * $this->k));
        $this->_Arc($x + $rx, $y - $ly, $x + $lx, $y - $ry, $x, $y - $ry);
        $this->_Arc($x - $lx, $y - $ry, $x - $rx, $y - $ly, $x - $rx, $y);
        $this->_Arc($x - $rx, $y + $ly, $x - $lx, $y + $ry, $x, $y + $ry);
        $this->_Arc($x + $lx, $y + $ry, $x + $rx, $y + $ly, $x + $rx, $y);
        $this->_out($op);
    }

    // Función auxiliar para dibujar arcos
    function _Arc($x1, $y1, $x2, $y2, $x3, $y3)
    {
        $h = $this->h;
        $this->_out(sprintf(
            '%.2F %.2F %.2F %.2F %.2F %.2F c',
            $x1 * $this->k,
            ($h - $y1) * $this->k,
            $x2 * $this->k,
            ($h - $y2) * $this->k,
            $x3 * $this->k,
            ($h - $y3) * $this->k
        ));
    }

    // Función para dibujar un rectángulo con fondo blanco y borde
    function DrawWhiteRectangle($y, $text, $height = 10, $fontSize = 10)
    {
        $pageWidth = 140; // Ancho de la página
        $margin = 0; // Margen izquierdo para el rectángulo
        $rectWidth = $pageWidth - 2 * $margin; // Ancho del rectángulo

        $borderColor = [0, 0, 0]; // Color del borde negro
        $fillColor = [255, 255, 255]; // Color de fondo blanco

        // Establecer color de relleno y dibujar el rectángulo
        $this->SetFillColor($fillColor[0], $fillColor[1], $fillColor[2]);
        $this->Rect($margin, $y, $rectWidth, $height, 'F'); // Rellenar el rectángulo

        // Establecer color del borde y dibujar el borde
        $this->SetDrawColor($borderColor[0], $borderColor[1], $borderColor[2]);
        $this->Rect($margin, $y, $rectWidth, $height); // Dibujar el borde

        // Establecer color y fuente para el texto
        $this->SetTextColor(0, 0, 0); // Color del texto negro
        $this->SetFont('Arial', 'B', $fontSize);

        // Calcular la posición del texto centrado
        $textWidth = $this->GetStringWidth($text);
        $textX = $margin + ($rectWidth - $textWidth) / 2;
        $textY = $y + ($height - $fontSize) / 2;

        // Establecer la posición y añadir el texto
        $this->SetXY($textX, $textY);
        $this->Cell($textWidth, $fontSize, $text, 0, 0, 'C');
    }
}

// Verifica si el formulario ha sido enviado
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Simulación de obtener los datos del archivo JSON
    $data = json_decode(file_get_contents('data.json'), true);

    $nombre = $data['nombre'] ?? 'Nombre no disponible';
    $cedula = $data['cedula'] ?? 'Cédula no disponible';
    $dire = $data['dire'] ?? 'Dirección no disponible';
    $correo = $data['correo'] ?? 'Correo no disponible';
    $telefono = $data['telefono'] ?? 'Teléfono no disponible';
    $descripcion = $data['Descripcion'] ?? 'Descripción no disponible';
    $cantidad = (float) ($data['cantidad'] ?? 0);
    $precio = (float) ($data['precio'] ?? 0);
    $iva = (float) ($data['iva'] ?? 0);
    $ret = (float) ($data['ret'] ?? 0);
    $rte_ica = (float) ($data['rte_ica'] ?? 0);
    $total = number_format($cantidad * $precio + $iva - $ret - $rte_ica, 0, ',', '.');

    // Crear instancia de FPDF
    $pdf = new PDF('P', 'mm', array(140, 216));
    $pdf->AddPage();

    // Ancho de la página
    $pageWidth = 140;

    // Agregar fondo
    $imgFile3 = 'fondo.png';
    if (file_exists($imgFile3)) {
        $pdf->Image($imgFile3, 0, 0, $pageWidth);
    }

    // Agregar logo
    $imgFile4 = 'logo.png';
    if (file_exists($imgFile4)) {
        $pdf->Image($imgFile4, 3, 2, 45); // Posición y tamaño del logo
    }
    // Añadir el cufe
    $cufe = 'cufe.png';
    if (file_exists($cufe)) {
        $pdf->Image($cufe, 65, 5, 16, 16);
    }

    // Añadir el CUFE
    $pdf->SetFont('Arial', 'B', 10);
    $pdf->SetXY(67, 19); // Establece la posición 
    $pdf->Cell(0, 10, 'CUFE', 0, 1);
    // Añadir título
    $pdf->SetFont('Arial', 'B', 10);
    $pdf->SetXY(92, 4); // Establece la posición
    $pdf->Cell(0, 10, 'FACTURA ELECTRONICA', 0, 1);

    // Dibujar la línea con tres puntos en la parte superior
    $pdf->DrawLineWithPoints($pageWidth);

    // Añadir tabla de cliente primero, luego texto
    $imgFile7 = 'cliente.png';
    if (file_exists($imgFile7)) {
        $pdf->Image($imgFile7, 4, 63, 130, 23); // Insertamos la tabla antes del texto
    }

    // Dibujar el rectángulo blanco con borde para el detalle del cliente
    $pdf->DrawWhiteRectangle(48, 'DETALLE DEL CLIENTE', 10, 12);

    // Posicionar directamente el texto "Nombre"
    $pdf->SetFont('Arial', '', 8);
    $pdf->SetXY(30, 65); // Establece la posición
    $pdf->Cell(0, 5, $nombre, 0, 1);

    // Posicionar el resto del contenido del cliente
    $pdf->SetXY(33, 74); // Cédula
    $pdf->Cell(0, 5, $cedula, 0, 1);

    $pdf->SetXY(100, 74); // Dirección
    $pdf->Cell(0, 5, $dire, 0, 1);

    $pdf->SetXY(30, 82); // Correo
    $pdf->Cell(0, 5, $correo, 0, 1);

    $pdf->SetXY(100, 82); // Teléfono
    $pdf->Cell(0, 5, $telefono, 0, 1);

    // Dibujar el rectángulo blanco con borde para el detalle de la compra
    $pdf->DrawWhiteRectangle(91, 'DETALLE DE LA COMPRA', 10, 12); // Usar la misma altura que el de cliente

    // Añadir tabla de pedido ANTES del contenido para evitar solapamiento
    $imgFile5 = 'tabla-de-pedido.png';
    if (file_exists($imgFile5)) {
        $pdf->Image($imgFile5, 0, 105, 140, 59); // Ajusta las coordenadas Y si es necesario
    }

    // Añadir detalles de la compra
    $pdf->SetFont('Arial', '', 8);
    $pdf->SetXY(8, 112); // Descripción
    $pdf->Cell(0, 5, $descripcion, 0, 1);

    $pdf->SetXY(47, 112); // Cantidad
    $pdf->Cell(0, 5, $cantidad, 0, 1);

    $pdf->SetXY(60, 112); // Precio
    $pdf->Cell(0, 5, number_format($precio, 0, ',', '.'), 0, 1);

    $pdf->SetXY(74, 112); // IVA
    $pdf->Cell(0, 5, number_format($iva, 0, ',', '.'), 0, 1);

    $pdf->SetXY(85, 112); // Retención
    $pdf->Cell(0, 5, number_format($ret, 0, ',', '.'), 0, 1);

    $pdf->SetXY(98, 112); // RTE ICA
    $pdf->Cell(0, 5, number_format($rte_ica, 0, ',', '.'), 0, 1);

    $pdf->SetXY(122, 158); // Total
    $pdf->Cell(0, 5, $total, 0, 1);

    // Añadir código de escaneo después del contenido
    $imgFile6 = 'escanear.png';
    if (file_exists($imgFile6)) {
        $pdf->Image($imgFile6, 1, 186, 138, 31);
    }

    // Añadir la tabla de 2x2
    $pdf->AddHelloTable();

    // Salida del PDF
    $pdf->Output('I', 'factura.pdf');
}
?>