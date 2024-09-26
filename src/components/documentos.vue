<template>
    <div class="container">
        <div class="superior">
            <div class="titulo">Subir Archivo CSV</div>
            <div>Subir Archivo CSV:</div>
            <div>
                <div class="seleccionar">
                    <button @click="subir()" class="btn"
                        style="background-color: #007BFF; font-weight: bold; color: white; width: 25%; height: 30%;">Seleccionar
                        el archivo</button>
                    <div>Ningún archivo Seleccionado</div>
                </div>
            </div>
            <div>
                <button @click="printTicket" style="width: 14%; height: 10%; padding: 1%;">Imprimir Ticket</button>
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
import axios from "axios";
import { ref, onMounted } from "vue"
import { useUsuarioStore } from "../stores/usuario.js"
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";

const UsuarioStore = useUsuarioStore();
const $q = useQuasar();
const router = useRouter();
let rows = ref([]);
let pagination = ref({ rowsPerPage: 0 })
let usuarios = ref([]);

async function obtenerInfo() {
    try {
        await UsuarioStore.obtenerusuario();
        usuarios.value = UsuarioStore.usuario;
        rows.value = UsuarioStore.usuarios.reverse();
        console.log('llegan datos',UsuarioStore.usuarios);

    } catch (error) {
        console.log(error);
    };
};

const columns = [
    { name: 'nombre', label: 'Nombre Contacto', field: "nombre",sortable:true, align: 'left',},
    { name: 'identificacion', label: 'Identificación', field: "identificacion", sortable:true, align: 'left', },
    { name: 'codigo_producto', label: 'Código Producto	', field: (row) => {
        return row.idProducto.codigo_producto ? row.idProducto.codigo_producto : 'Falta el nombre de este usuario '; // verificar si el nombre existe
    }, sortable:true, align: 'left',},
    { name: 'valor_unitario', label: 'Valor Uni',  field: (row) => {
        return row.idProducto.valor_unitario ? row.idProducto.valor_unitario  : 'Falta el nombre de este usuario '; // verificar si el nombre existe
    }, sortable:true, align: 'left', }, 
    { name: 'codigo_impuesto_cargo', label: 'Codigo impuesto cargo',  field: (row) => {
        return row.idImpuesto.codigo_impuesto_cargo ? row.idImpuesto.codigo_impuesto_cargo : 'Falta el nombre de este usuario '; // verificar si el nombre existe
    }, sortable:true, align: 'left', },
    { name: 'retencion', label: 'Retención',  field: (row) => {
        return row.idImpuesto.retencion ? row.idImpuesto.retencion : 'Falta el nombre de este usuario '; // verificar si el nombre existe
    }, sortable:true, align: 'left', }, 
    { name: 'valor_retencion', label: 'Valor Retención',  field: (row) => {
        return row.idImpuesto.valor_retencion ? row.idImpuesto.valor_retencion : 'Falta el nombre de este usuario '; // verificar si el nombre existe
    }, sortable:true, align: 'left', },
    { name: 'reteica', label: 'Reteica',  field: (row) => {
        return row.idImpuesto.reteica ? row.idImpuesto.reteica : 'Falta el nombre de este usuario '; // verificar si el nombre existe
    }, sortable:true, align: 'left', },
    { name: 'valor_reteica', label: 'Valor Reteica',  field: (row) => {
        return row.idImpuesto.valor_reteica ? row.idImpuesto.valor_reteica : 'Falta el nombre de este usuario '; // verificar si el nombre existe
    }, sortable:true, align: 'left', },
    { name: 'porcentaje_descuento', label: 'Porcentaje Descuento',  field: (row) => {
        return row.idImpuesto.porcentaje_descuento ? row.idImpuesto.porcentaje_descuento : 'Falta el nombre de este usuario '; // verificar si el nombre existe
    }, sortable:true, align: 'left', },
    { name: 'fecha_vencimiento', label: 'Fecha Vencimiento',  field: (row) => {
        return row.idProducto.fecha_vencimiento ? row.idProducto.fecha_vencimiento : 'Falta el nombre de este usuario '; // verificar si el nombre existe
    }, sortable:true, align: 'left', },
    { name: 'fecha_elaboracion', label: 'Fecha Elaboración',  field: (row) => {
        return row.idProducto.fecha_elaboracion ? row.idProducto.fecha_elaboracion : 'Falta el nombre de este usuario '; // verificar si el nombre existe
    }, sortable:true, align: 'left', },
    { name: 'iron', label: 'Anidar', sortable:true, align: 'left', },
    {
        name: "opciones",
        label: "Opciones",
        field: (row) => null,
        sortable: false,
        align: "center",
    }

];
 
onMounted(async () => {
    obtenerInfo();
});

</script>
 <script>
 
export default {
    methods: {
        async imprimirticket() {
            const doc = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: [140, 216],
            });

            try {
                const response = await fetch("data.json");
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const nombre = data.nombre || "Nombre no disponible";
                const cedula = data.cedula || "Cédula no disponible";
                const dire = data.dire || "direccion no disponible";
                const correo = data.correo || "correo no disponible";
                const telefono = data.telefono || "telefono no disponible";
                const descripcion = data.Descripcion || "descripcion no disponible";
                const cantidad = parseFloat(data.cantidad) || 0;
                const precio = parseFloat(data.precio) || 0;
                const iva = parseFloat(data.iva) || 0;
                const ret = parseFloat(data.ret) || 0;
                const rte_ica = parseFloat(data.rte_ica) || 0;
                const subtotal = parseFloat(data.subtotal) || 0;
                const mes = data.mes || "direccion no disponible";
                const total = (cantidad * precio + iva - ret - rte_ica).toLocaleString('es-CO', { minimumFractionDigits: 0 });
                const precioFormateado = precio.toLocaleString('es-CO', { minimumFractionDigits: 0 });
                const ivaFormateado = iva.toLocaleString('es-CO', { minimumFractionDigits: 0 });
                const retFormateado = ret.toLocaleString('es-CO', { minimumFractionDigits: 0 });
                const rteIcaFormateado = rte_ica.toLocaleString('es-CO', { minimumFractionDigits: 0 });

                // Dimensiones y colores
                const headerHeight = 18;
                const headerWidth = 136;
                const pageWidth = 140;
                const pageHeight = 216;

                // Añadir la plantilla como fondo
                const imgFile3 = "fondo.png";
                const imgData3 = await this.loadImageAsBase64(imgFile3);
                doc.addImage(imgData3, "PNG", 0, 0, pageWidth, pageHeight);

                // Añadir otras imágenes
                const imgFile4 = "logo.png";
                const imgData4 = await this.loadImageAsBase64(imgFile4);
                doc.addImage(imgData4, "JPEG", 2, 1, 50, 25);

                // Resto del código de generación de PDF...
                // Aquí puedes incluir todo el código que sigue en tu script original

                // Mostrar el PDF
                const pdfBlob = doc.output("blob");
                const pdfUrl = URL.createObjectURL(pdfBlob);
                window.open(pdfUrl, "_blank");
            } catch (error) {
                console.error("Error al cargar el archivo JSON o las imágenes:", error);
            }
        },

        loadImageAsBase64(fileName) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve(reader.result);
                };
                reader.onerror = reject;

                fetch(fileName)
                    .then((response) => response.blob())
                    .then((blob) => reader.readAsDataURL(blob));
            });
        },
    },
};
</script>

<style scoped>
.container {
    height: 100vh;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
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