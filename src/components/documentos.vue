<template>
    <div class="container">
        <div class="superior">
            <div class="titulo">Subir Archivo CSV</div>
            <div>Subir Archivo CSV:</div>
            <div>
                <div class="seleccionar">
                    <input type="file" accept=".csv" @change="procesarArchivo" style="display: none;" ref="fileInput">
                    <button @click="abrirSeleccionArchivo()" class="btn"
                        style="background-color: #007BFF; font-weight: bold; color: white; width: 25%; height: 30%;">
                        Seleccionar el archivo
                    </button>
                    <div v-if="nombreArchivo">{{ nombreArchivo }}</div>
                    <div v-else>Ningún archivo Seleccionado</div>
                </div>
            </div>

            <!-- Tabla -->
            <div style="width: 90vw;">
                <div class="btn-agregar">
                    <button @click="subir()" class="btn" style="color: white; width: 18%;">Enviar Facturas Anidadas a
                        Alegra</button>
                    <button @click="subir()" class="btn" style="color: white; width: 18%;">Enviar Facturas simples a
                        Alegra</button>
                    <button @click="subir()" class="btn" style="color: white; width: 18%;">Procesar Datos</button>
                    <button @click="subir()" class="btn" style="color: white; width: 18%;">Limpiar Base de
                        Datos</button>
                    <button @click="subir()" class="btn" style="color: white; width: 18%;">Subir</button>
                </div>

                <div class="q-pa-md">
                    <q-table class="my-sticky-virtscroll-table" virtual-scroll flat bordered
                        v-model:pagination="pagination" :rows-per-page-options="[0]"
                        :virtual-scroll-sticky-size-start="48" row-key="name" :rows="rows" :columns="columns">
                        <!-- Columna para el estado -->
                        <template v-slot:body-cell-estado="props">
                            <q-td :props="props">
                                <label v-if="props.row.estado == 1" style="color: green">Activo</label>
                                <label v-else style="color: red">Inactivo</label>
                            </q-td>
                        </template>

                        <!-- Columna para las opciones de editar/activar/inactivar -->
                        <template v-slot:body-cell-opciones="props">
                            <q-td :props="props" class="botones">
                                <button @click="imprimirticket(props.row)" class="edi">
                                    <i class="fa-solid fa-print"></i>
                                </button>
                            </q-td>
                        </template>
                    </q-table>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { jsPDF } from "jspdf";
import axios from "axios";
import { ref, onMounted } from "vue"
import { useUsuarioStore } from "../stores/usuario.js"
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import fondo from "../assets/fondo.png"
import logo from "../assets/logo.png"
import cufe from "../assets/cufe.png"
import cliente from "../assets/cliente.png"
import pedido from "../assets/tabla-de-pedido.png"
import escanear from "../assets/escanear.png"


const UsuarioStore = useUsuarioStore();
const $q = useQuasar();
const router = useRouter();
let rows = ref([]);
let pagination = ref({ rowsPerPage: 0 })
let usuarios = ref([]);


let nombreArchivo = ref("");

function abrirSeleccionArchivo() {
    const fileInput = document.querySelector('input[type="file"]');
    fileInput.click();
}

function procesarArchivo(event) {
    const archivo = event.target.files[0];
    if (archivo) {
        nombreArchivo.value = archivo.name;
    }
}


async function obtenerInfo() {
    try {
        await UsuarioStore.obtenerusuario();
        usuarios.value = UsuarioStore.usuario;
        rows.value = UsuarioStore.usuarios.reverse();
        console.log('llegan datos', UsuarioStore.usuarios);

    } catch (error) {
        console.log(error);
    };
};

const columns = [
    { name: 'nombre', label: 'Nombre Contacto', field: "nombre", sortable: true, align: 'left', },
    { name: 'identificacion', label: 'Identificación', field: "identificacion", sortable: true, align: 'left', },
    { name: 'correo', label: 'Correo', field: "correo", sortable: true, align: 'left', },
    { name: 'direccion', label: 'Dirección Contacto', field: "direccion", sortable: true, align: 'left', },
    { name: 'telefono', label: 'Telefono', field: "telefono", sortable: true, align: 'left', },
    {
        name: 'codigo_producto', label: 'Código Producto	', field: (row) => {
            return row.idProducto.codigo_producto ? row.idProducto.codigo_producto : 'Falta el nombre de este usuario '; // verificar si el nombre existe
        }, sortable: true, align: 'left',
    },
    {
        name: 'valor_unitario', label: 'Valor Uni', field: (row) => {
            return row.idProducto.valor_unitario ? row.idProducto.valor_unitario : 'Falta el nombre de este usuario '; // verificar si el nombre existe
        }, sortable: true, align: 'left',
    },
    {
        name: 'codigo_impuesto_cargo', label: 'Codigo impuesto cargo', field: (row) => {
            return row.idImpuesto.codigo_impuesto_cargo ? row.idImpuesto.codigo_impuesto_cargo : 'Falta el nombre de este usuario '; // verificar si el nombre existe
        }, sortable: true, align: 'left',
    },
    {
        name: 'retencion', label: 'Retención', field: (row) => {
            return row.idImpuesto.retencion ? row.idImpuesto.retencion : 'Falta el nombre de este usuario '; // verificar si el nombre existe
        }, sortable: true, align: 'left',
    },
    {
        name: 'valor_retencion', label: 'Valor Retención', field: (row) => {
            return row.idImpuesto.valor_retencion ? row.idImpuesto.valor_retencion : 'Falta el nombre de este usuario '; // verificar si el nombre existe
        }, sortable: true, align: 'left',
    },
    {
        name: 'reteica', label: 'Reteica', field: (row) => {
            return row.idImpuesto.reteica ? row.idImpuesto.reteica : 'Falta el nombre de este usuario '; // verificar si el nombre existe
        }, sortable: true, align: 'left',
    },
    {
        name: 'valor_reteica', label: 'Valor Reteica', field: (row) => {
            return row.idImpuesto.valor_reteica ? row.idImpuesto.valor_reteica : 'Falta el nombre de este usuario '; // verificar si el nombre existe
        }, sortable: true, align: 'left',
    },
    {
        name: 'porcentaje_descuento', label: 'Porcentaje Descuento', field: (row) => {
            return row.idImpuesto.porcentaje_descuento ? row.idImpuesto.porcentaje_descuento : 'Falta el nombre de este usuario '; // verificar si el nombre existe
        }, sortable: true, align: 'left',
    },
    {
        name: 'fecha_vencimiento', label: 'Fecha Vencimiento', field: (row) => {
            return row.idProducto.fecha_vencimiento ? row.idProducto.fecha_vencimiento : 'Falta el nombre de este usuario '; // verificar si el nombre existe
        }, sortable: true, align: 'left',
    },
    {
        name: 'fecha_elaboracion', label: 'Fecha Elaboración', field: (row) => {
            return row.idProducto.fecha_elaboracion ? row.idProducto.fecha_elaboracion : 'Falta el nombre de este usuario '; // verificar si el nombre existe
        }, sortable: true, align: 'left',
    },
    { name: 'iron', label: 'Anidar', sortable: true, align: 'left', },
    {
        name: "opciones",
        label: "Opciones",
        field: (row) => null,
        sortable: false,
        align: "center",
    }

];

onMounted(async () => {
    obtenerInfo(async () => {
        obtenerInfo();
    });
});

async function imprimirticket(factura) {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [140, 216],
    })

    // Dimensiones y colores
    const headerHeight = 18;
    const headerWidth = 136;
    const pageWidth = 140;
    const pageHeight = 216;
    const cornerRadius = 5;


    // Añadir las plantillas
    doc.addImage(fondo, "PNG", 0, 0, pageWidth, pageHeight);
    doc.addImage(logo, "PNG", 2, 1, 50, 25);
    doc.addImage(cliente, "PNG", 1, 60, 138, 24);
    doc.addImage(pedido, "PNG", 1, 104, 136, 56);
    doc.addImage(escanear, "PNG", -1, 162, 142, 32);
    // Añadir otras imágenes
    //   const imgFile4 = "logo.png";
    // //   const imgData4 = await (imgFile4);
    //   

    // Título "FACTURA ELECTRÓNICA" en negrita
    const title3 = "FACTURA ELECTRÓNICA";
    const titleFontSize3 = 10;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(titleFontSize3);
    doc.setTextColor(0, 0, 0);

    const title3Width =
        (doc.getStringUnitWidth(title3) * titleFontSize3) /
        doc.internal.scaleFactor;
    const title3X = headerWidth - title3Width - 2;
    const title3Y = headerHeight / 2 + titleFontSize3 / 2 - 7;

    doc.text(title3, title3X, title3Y);

    // Añadir la imagen PQR CUFE
    const pqrX = 65; // Posición horizontal (ajusta según sea necesario)
    const pqrY = 3; // 2 cm desde la parte superior
    const pqrWidth = 18; // Ancho de la imagen
    const pqrHeight = 16; // Altura de la imagen
    doc.addImage(cufe, "JPEG", pqrX, pqrY, pqrWidth, pqrHeight);

    // Texto "CUFE:" en negrita, centrado debajo de la imagen PQR
    const cufeTitle = "CUFE:";
    const cufeFontSize = 12;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(cufeFontSize);
    const cufeWidth =
        (doc.getStringUnitWidth(cufeTitle) * cufeFontSize) /
        doc.internal.scaleFactor;
    const cufeTitleX = pqrX + (pqrWidth - cufeWidth) / 2;
    const cufeTitleY = pqrY + pqrHeight + 5; // Ajustar la distancia debajo de la imagen PQR
    doc.text(cufeTitle, cufeTitleX, cufeTitleY);

    // Dibujar una barra de progreso de 3 puntos en la mitad de la hoja
    const progressBarY = pageHeight / 6; // Centrado verticalmente
    const progressBarXStart = (pageWidth - 90) / 2; // Ajustar para centrar horizontalmente
    const circleRadius = 2.5;
    const circleSpacing = 45; // distancia
    doc.setDrawColor(226, 48, 9); // Color del borde de los círculos
    doc.setFillColor(255, 255, 255); // Color de relleno de los círculos (blanco)

    for (let i = 0; i < 3; i++) {
        const circleX = progressBarXStart + i * circleSpacing;
        doc.circle(circleX, progressBarY, circleRadius, "FD"); // 'FD' para borde y relleno
        if (i < 2) {
            const nextCircleX = circleX + circleSpacing;
            doc.setLineWidth(0.5); // Reducir el grosor de la línea
            doc.line(
                circleX + circleRadius + 0.5,
                progressBarY,
                nextCircleX - circleRadius - 0.5,
                progressBarY
            ); // Ajustar para evitar superposición
        }
    }

    // Añadir las fechas sobre los puntos
    const fechas = ["25/08", "30/08", "05/09"];
    const fechaFontSize = 8;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(fechaFontSize);
    for (let i = 0; i < fechas.length; i++) {
        const fechaX = progressBarXStart + i * circleSpacing;
        const fechaY = progressBarY - 5; // Ajustar la posición vertical para colocar el texto sobre los puntos
        doc.text(
            fechas[i],
            fechaX -
            (doc.getStringUnitWidth(fechas[i]) * fechaFontSize) /
            (2 * doc.internal.scaleFactor),
            fechaY
        );
    }

    // Añadir el contenido de tiempo debajo de los puntos
    const tiempo = [
        "Inicio de período",
        "Fecha de suspensión",
        "Fin de período",
    ];
    const tiempoFontSize = 8;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(tiempoFontSize);
    for (let i = 0; i < tiempo.length; i++) {
        const tiempoX = progressBarXStart + i * circleSpacing;
        const tiempoY = progressBarY + 7; // Ajustar la posición vertical para colocar el texto debajo de los puntos
        doc.text(
            tiempo[i],
            tiempoX -
            (doc.getStringUnitWidth(tiempo[i]) * tiempoFontSize) /
            (2 * doc.internal.scaleFactor),
            tiempoY
        );
    }

    // Cuadro que ocupa todo el ancho con el texto "Hola Mundo" centrado
    const cuadroX = 0;
    const cuadroYy = progressBarY + 10;
    const cuadroWidtht = pageWidth;
    const cuadroHeightt = 10;

    doc.setDrawColor(0, 0, 0); // Color del borde
    doc.setFillColor(255, 255, 255); // Color de relleno
    doc.rect(cuadroX, cuadroYy, cuadroWidtht, cuadroHeightt, "FD"); // Dibuja el cuadro

    // Texto "DETALLE DEL CLIENTE" centrado dentro del cuadro
    const holaMundo = "DETALLE DEL CLIENTE";
    const holaFontSize = 15;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(holaFontSize);
    const holaWidth =
        (doc.getStringUnitWidth(holaMundo) * holaFontSize) /
        doc.internal.scaleFactor;
    const holaX = (pageWidth - holaWidth) / 2;
    const holaY = cuadroYy + cuadroHeightt / 5 + holaFontSize / 3; // Centrar verticalmente el texto
    doc.text(holaMundo, holaX, holaY);

    // Cuadro que ocupa todo el ancho con el texto centrado
    const cuadrox = 0;
    const cuadroy = progressBarY + 55;
    const cuadrowidtht = pageWidth;
    const cuadroheightt = 10;
    doc.setDrawColor(0, 0, 0); // Color del borde
    doc.setFillColor(255, 255, 255); // Color de relleno
    doc.rect(cuadrox, cuadroy, cuadrowidtht, cuadroheightt, "FD"); // Dibuja el cuadro

    // Texto "DETALLE DE LA COMPRA" centrado dentro del cuadro
    const compra = "DETALLE DE LA COMPRA";
    const compraFontSize = 15;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(compraFontSize);
    const compraWidth =
        (doc.getStringUnitWidth(compra) * compraFontSize) /
        doc.internal.scaleFactor;
    const compraX = (pageWidth - compraWidth) / 2;
    const compraY = cuadroYy + cuadroHeightt + 42; // Centrar verticalmente el texto
    doc.text(compra, compraX, compraY);

    // Dimensiones y posición del cuadro
    const cuadroY = pageHeight - 20.3; // Posición vertical del cuadro (ajustar según sea necesario)
    const cuadroHeight = 20; // Altura del cuadro
    const cuadroWidth = pageWidth; // Ancho del cuadro
    const cellHeightt = cuadroHeight / 2; // Altura de cada fila
    const cellWidtht = cuadroWidth / 2; // Ancho de cada columna

    // Dibujar el cuadro
    doc.setDrawColor(0, 0, 0); // Color del borde
    doc.setFillColor(255, 255, 255); // Color de relleno
    doc.rect(0, cuadroY, cuadroWidth, cuadroHeight, "FD"); // Dibuja el cuadro con borde y relleno

    // Textos para cada celda (2 filas y 2 columnas)
    const texto = [
        ["NOMBRE:", "VALOR TOTAL:"],
        ["CEDULA:", "MES:"],
    ];

    for (let i = 0; i < texto.length; i++) {
        for (let j = 0; j < texto[i].length; j++) {
            const text = texto[i][j];
            const textFontSize = 9;
            doc.setFont("Helvetica", "bold");
            doc.setFontSize(textFontSize);

            // Posicionar el texto en cada celda
            const textY =
                cuadroY + i * cellHeightt + cellHeightt / 10 + textFontSize / 2;
            let textX;

            // Alinear texto a la izquierda
            textX = j * cellWidtht + 2; // Ajuste de margen izquierdo

            doc.text(text, textX, textY);

            // Dibujar las líneas de división horizontal y vertical
            if (i < texto.length - 1) {
                doc.line(
                    0,
                    cuadroY + cellHeightt * (i + 1),
                    cuadroWidth,
                    cuadroY + cellHeightt * (i + 1)
                ); // Línea horizontal
            }
            if (j < texto[i].length - 1) {
                doc.line(
                    cellWidtht * (j + 1),
                    cuadroY,
                    cellWidtht * (j + 1),
                    cuadroY + cuadroHeight
                ); // Línea vertical
            }
        }
    };

    // Texto "OBSERVACIONES" centrado dentro del cuadro
    const observaciones = "OBSERVACIONES";
    const observacionfontzise = 10;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(observacionfontzise);
    const observacionWidth =
        (doc.getStringUnitWidth(observaciones) * observacionfontzise) /
        doc.internal.scaleFactor;
    let observacionx = (pageWidth - observacionWidth) / 2;
    let observaciony =
        cuadroYy + cuadroHeightt / 1 + observacionfontzise / 3; // Centrar verticalmente el texto
    observacionx -= 52; // Mover 10 unidades a la izquierda
    observaciony += 77; // Mover 20 unidades hacia abajo
    doc.text(observaciones, observacionx, observaciony);

    // Añadir los datos
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    const offsetX = 90; // Ajustar el inicio del texto a la derecha
    const offsetY = cuadroYy + 14; // Ajustar el inicio del texto

    doc.text(` ${factura.nombre}`, offsetX - 60, offsetY + 5);
    doc.text(` ${factura.identificacion}`, offsetX - 55, offsetY + 13);
    doc.text(` ${factura.direccion}`, offsetX + 15, offsetY + 13);
    doc.text(` ${factura.correo}`, offsetX - 65, offsetY + 21);
    doc.text(` ${factura.telefono}`, offsetX + 15, offsetY + 21);
    doc.text(` ${factura.idProducto.descripcion}`, offsetX - 80, offsetY + 53);
    doc.text(` ${factura.idProducto.cantidad}`, offsetX - 43, offsetY + 53);
    doc.text(` ${factura.idProducto.valor_unitario}`, offsetX - 29, offsetY + 53);
    doc.text(` ${factura.idImpuesto.valor_retencion}`, offsetX - 15, offsetY + 53);
    doc.text(` ${factura.idImpuesto.retencion}`, offsetX - 4.5, offsetY + 53);
    doc.text(` ${factura.idImpuesto.valor_reteica}`, offsetX + 10, offsetY + 53);
    doc.text(` 119.000`, offsetX + 29, offsetY + 53) //total
    doc.text(` 119.000`, offsetX + 29, offsetY + 97) //total inferior 
    doc.text(` ${factura.idImpuesto.valor_retencion}`, offsetX + 30, offsetY + 80); //
    doc.text(` ${factura.idImpuesto.retencion}`, offsetX + 30, offsetY + 86); //
    doc.text(` ${factura.idImpuesto.valor_reteica}`, offsetX + 30, offsetY + 92); //
    //   doc.text(` ${total}`, offsetX + 32, offsetY + 99 , ); // total= (cantidad*precio) + iva - rte- rte_ica
    //   doc.text(` ${total}`, offsetX + 20, offsetY + 140.5); // tirilla
    doc.text(` 119.000`, offsetX + 15, offsetY + 142); //tirilla
    doc.text(` ${factura.nombre}`, offsetX - 70, offsetY + 142); // tirilla
    doc.text(` ${factura.identificacion}`, offsetX - 70, offsetY + 152); // tirilla
    doc.text(` 27/09/2024`, offsetX + 15, offsetY + 152); // tirilla

    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
}

</script>

<style scoped>
.container {
    height: 100vh;
    display: flex;
    justify-content: center;
    padding: 8%;
    /* Asegúrate de que el contenedor ocupe el 100% del ancho */
}

.titulo {
    font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
    font-style: bold;
    font-size: 35px;
    display: flex;
    flex-direction: column;
}

.seleccionar {
    font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
    font-style: bold;
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 10%;
    gap: 5%;
    padding-bottom: 4%;
}

.btn {
    border: solid 2px black;
    padding: 1%;
    /* Asegúrate de que el padding no afecte el ancho */
}

.botones {
    display: flex;
    flex-direction: row;
    /* Cambia a columna si quieres que los botones estén en una columna */
    gap: 5%;
    /* Espacio entre botones */
    width: 100%;
    /* Asegúrate de que el contenedor ocupe el 100% */
}

.modal-content {
    width: 480px;
    height: 500px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
    background-color: #2aac4b;
    border-radius: 3%;
}

.contorno {
    background-color: white;
    height: 95%;
    width: 95%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.botones button {
    margin: 2px;
}

.btn-agregar {
    width: 100%;
    margin-bottom: 5px;
    display: flex;
    color: white;
    /* margin-left: 19px; */
    align-items: center;
    flex-direction: row;
    justify-content: space-around;
}

.body {
    padding: 30px;
    margin: 0;
    text-transform: capitalize;
}

.containerBoton {
    display: flex;
    justify-content: center;
}

hr {
    background-color: green;
    height: 2px;
    border: none;
    width: 363px;
    margin-bottom: 1%;
}

.containerError {
    background-color: rgba(255, 0, 0, 0.429);
    padding: 15px;
    text-align: center;
    font-family: "Letra";
    font-weight: bold;
    width: 310px;
    border: 3px solid red;
    margin-bottom: 5px;
    height: 180px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 80px;
}

.containerError h4 {
    font-size: 25px;
    margin: 0;
    padding: 0;
}

h1 {
    font-family: "Letra";
    text-align: center;
    margin: 0;
    align-items: center;
    margin-top: 2%;
}

.text-h6 {
    font-size: 28px;
    font-family: "Letra";
    margin-bottom: 10px;
}

.botones .edi {
    border: none;
    border-radius: 5px;
    cursor: pointer;
    padding: 7px;
    background-color: transparent;
}

.botones .edi:hover {
    transform: scale(1.05);
    transition: all 0.5s;
}

.botones .act {
    border: none;
    border-radius: 5px;
    cursor: pointer;
    padding: 7px;
    background-color: transparent;
}

.act i {
    font-size: 22px;
    color: green;
}

.inac {
    border: none;
    border-radius: 5px;
    cursor: pointer;
    padding: 5px;
    margin: 0;
    background-color: transparent;
}

.botones .edi i {
    font-size: 20px;
}

.inac i {
    font-size: 25px;
    color: red;
}

.btn {
    font-family: "Letra";
    width: 100px;

    border-radius: 5px;
    border: none;

    cursor: pointer;
    background: -webkit-linear-gradient(bottom, #b95b5b, #d34646);
}
</style>