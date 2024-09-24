<template>
    <div class="container"> <!-- Asegúrate de que el contenedor tenga esta clase -->
        <div class="superior">
            <div class="titulo">Subir Archivo CSV</div>
            <div>Subir Archivo CSV:</div>
            <div>
                <div class="seleccionar">
                    <button @click="subir()" class="btn">Seleccionar el archivo</button>
                    <div>Ningún archivo Seleccionado</div>
                </div>
                <div class="botones">
                    <button @click="subir()" class="btn full-width"
                        style="background-color: #007BFF;font-style: bold; color: white;">Enviar Facturas Anidadas a
                        Alegra</button>
                    <button @click="subir()" class="btn full-width"
                        style="background-color: #28a745;font-style: bold; color: white;"> Enviar Facturas simples a
                        Alegra</button>
                    <button @click="subir()" class="btn full-width"
                        style="background-color: #28a745;font-style: bold; color: white;">Procesar Datos</button>
                    <button @click="subir()" class="btn full-width"
                    style="background-color: #dd0910;font-style: bold; color: white;">Limpiar Base de Datos</button>
                    <button @click="subir()" class="btn full-width" 
                        style="background-color: #007BFF;font-style: bold; color: white;">Subir</button>
                </div>
            </div>
            <div>
                <button @click="printTicket" class="full-width">Imprimir Ticket</button>
            </div>
            <div class="q-pa-md">

<q-table class="my-sticky-virtscroll-table" virtual-scroll flat bordered v-model:pagination="pagination"
  :rows-per-page-options="[0]" :virtual-scroll-sticky-size-start="48" row-key="index" :rows="rows"
  :columns="columns">
  <template v-slot:body-cell-estado="props">
    <q-td :props="props">
      <label for="" v-if="props.row.estado == 1" style="color: green">Activo</label>
      <label for="" v-else style="color: red">Inactivo</label>
    </q-td>
  </template>
  <template v-slot:body-cell-opciones="props">
    <q-td :props="props" class="botones">
      <q-btn color="white" text-color="black" label="🖋️" @click="editarFicha(props.row)" />
      <q-btn glossy label="❌" @click="inactivarFicha(props.row._id)" v-if="props.row.estado == 1" />
      <q-btn glossy label="✔️" @click="activarFicha(props.row._id)" v-else />
    </q-td>
  </template>
</q-table>

</div>
        </div>
    </div>
</template>

<script>
export default {
    methods: {
        async printTicket() {
            const { jsPDF } = window.jspdf;
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
                const data = await response.json();
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
    margin: 0;
    height: 100vh;
    display: flex;
    justify-content: center;
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
    font-size: 10px;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 5%;
}

.btn {
    padding: 2%;
    width: 100%;
    /* Hacer que el botón ocupe el 100% del ancho */
    box-sizing: border-box;
    /* Asegúrate de que el padding no afecte el ancho */
}

.botones {
    display: flex;
    flex-direction: column;
    /* Cambiar a columna para que los botones ocupen 100% */
    gap: 5%;
    /* Espacio entre botones */
    width: 100%;
    /* Asegúrate de que el contenedor ocupe el 100% */
}
</style>
