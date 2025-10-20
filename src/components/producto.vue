<template>
  <q-layout view="hHh lpR lFf" class="contenedor">

    <!-- Columna izquierda -->
    <div class="columna" style="display: flex;align-items: center;justify-content: center;margin-right: 5%">
      <q-page-container>
        <q-card class="card_izquierda" @click="modalProducto = true" style="background-color: #9FA8DA;">
          <q-card-section>
            <q-icon name="playlist_add" size="200px" color="primary" />
          </q-card-section>
          <div class="nuevo">Nuevo Producto</div>
        </q-card>
      </q-page-container>
    </div>

    <!-- Columna derecha -->
    <div class="columna" style="display: flex;align-items: center;">
      <div class="padre" style="height: 100%;display: flex; justify-content: center;flex-direction: column;">
        <button class="producto" style="height: 25%;" @click="modalListaProductos = true">
          Productos
        </button>
        <button class="opcion" style="height: 25%;"> Mejor Opcion
        </button>
        <button class="comparacion" style="height: 25%;"> Comparacion De Productos </button>
      </div>

    </div>

    <!-- MODAL PARA AGREGAR PRODUCTO -->
<q-dialog v-model="modalProducto">
  <q-card class="modal-producto">
    <!-- Columna izquierda (Imagen) -->
    <div class="col-5 flex flex-center column bg-light">
      <q-avatar size="150px" class="q-mb-md">
        <img src="https://cdn.quasar.dev/img/avatar.png" alt="Producto" />
      </q-avatar>
      <q-btn label="Subir Imagen" color="primary" flat />
    </div>

    <!-- Columna derecha (Formulario) -->
    <q-card-section class="col-7 q-pa-md">
      <h3 class="titulo">Nuevo Producto</h3>
      <q-input v-model="producto.nombre" label="Nombre" outlined dense class="q-mb-sm" />
      <q-select v-model="producto.local" :options="['D1', 'ARA', 'DolarCity', 'otro']" label="Local" outlined dense class="q-mb-sm" />
      <q-input v-model="producto.cantidad" type="number" label="Cantidad" outlined dense class="q-mb-sm" />
      <q-select v-model="producto.unidadMedida" :options="['Kg', 'Gr', 'Ml', 'L']" label="Unidad de Medida" outlined dense class="q-mb-sm" />
      <q-input v-model="producto.precioUnitario" type="number" label="Valor $" outlined dense class="q-mt-md" />

      <div class="q-mt-lg row justify-end q-gutter-sm">
        <q-btn flat label="Cancelar" color="negative" v-close-popup />
        <q-btn label="Guardar" color="positive" @click="guardarProductos" />
      </div>
    </q-card-section>
  </q-card>
</q-dialog>


    <q-dialog v-model="modalListaProductos">
      <q-card style="width: 80vw; max-width: 900px;">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6" style="text-align: center;">Lista de Productos</div>
        </q-card-section>

        <q-card-section>
          <q-table :rows="productos" :columns="columns" row-key="codigo" flat bordered separator="cell"
            style="height: 400px;">
            <!-- Columna personalizada para eliminar -->
            <template v-slot:body-cell-acciones="props" style="text-align: center;">
              <q-td :props="props" align="center">
                <q-btn color="negative" icon="delete" flat dense round @click="eliminar(props.row)" />
              </q-td>
            </template>
          </q-table>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="negative" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>


  </q-layout>
</template>


<script setup>
import { ref, onMounted } from "vue"
import { useProductoStore } from "../stores/producto.js"
import fondo from "../assets/fondo.png"
import { useQuasar } from "quasar"
const $q = useQuasar()
const leftDrawerOpen = ref(false);
const modalProducto = ref(false);
const modalListaProductos = ref(false);
const productos = ref([]);
const rows = ref([]);
const productoStore = useProductoStore();
const columns = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'center' },
  { name: 'local', label: 'Local', field: 'local', align: 'center' },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'center' },
  { name: 'unidadMedida', label: 'Unidad', field: 'unidadMedida', align: 'center' },
  { name: 'precioUnitario', label: 'Precio Unitario', field: 'precioUnitario', align: 'center' },
  {
    name: 'acciones',
    label: 'Acciones',
    align: 'center',
    field: 'acciones',
  }
];

async function obtenerinfo() {
  try {
    console.log("🔄 Cargando productos...");
    await productoStore.obtenerproductos();
    productos.value = Array.isArray(productoStore.productos)
      ? productoStore.productos
      : [];
    console.log("✅ Productos cargados:", productos.value);
    rows.value = productos.value;
  } catch (error) {
    console.error("❌ Error al obtener productos:", error);
    rows.value = [];
  }
}

async function guardarProductos() {
  try {
    // Validación antes de enviar
    if (
      !producto.value.nombre ||
      !producto.value.local ||
      !producto.value.cantidad ||
      !producto.value.unidadMedida ||
      !producto.value.precioUnitario
    ) {
      $q.notify({
        type: "negative",
        message: "Por favor completa todos los campos obligatorios"
      });
      return;
    }

    // Generar código automático
    const codigo = "PRD-" + Date.now().toString().slice(-5);

    const nuevoProducto = {
      codigo: codigo,
      nombre: producto.value.nombre,
      local: producto.value.local,
      cantidad: producto.value.cantidad,
      unidadMedida: producto.value.unidadMedida,
      precioUnitario: producto.value.precioUnitario
    };

    console.log("Producto a guardar:", nuevoProducto);

    // Llamar al store con el nuevo producto
    await productoStore.guardarProductos(nuevoProducto);

    $q.notify({
      type: "positive",
      message: "Producto agregado correctamente"
    });

    // Limpiar formulario
    producto.value = {
      nombre: "",
      local: "",
      cantidad: "",
      unidadMedida: "",
      precioUnitario: ""
    };

    modalProducto.value = false;
    obtenerinfo(); // Recargar lista
  } catch (error) {
    console.error("Error al guardar producto:", error);
    $q.notify({
      type: "negative",
      message: "Error al guardar el producto"
    });
  }
}

async function eliminar(id) {
  try {
    await productoStore.deleteproducto(producto.codigo);
    $q.notify({
      type: 'positive',
      message: 'Producto eliminado correctamente'
    });
    await obtenerinfo(); // 🔁 recargar tabla
  } catch (error) {
    console.error('❌ Error al eliminar producto:', error);
    $q.notify({
      type: 'negative',
      message: 'No se pudo eliminar el producto'
    });
  }
}


onMounted(async () => {
  console.log("✅ onMounted se ejecutó");
  obtenerinfo();
})

const producto = ref({
  nombre: "",
  local: "",
  cantidad: "",
  unidadMedida: "",
  precioUnitario: ""
})


const pagination = ref({
  page: 1,
  rowsPerPage: 10
})



// Métodos como funciones normales
function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function inicio() {
  console.log("Ir a Inicio")
}

function modificar() {
  console.log("Modificar algo")
}

async function obtenerproducto() {
  const productoStore = useProductoStore()
  console.log("obtener productos desde Pinia", productoStore)
}

function abrirModalProducto() {
  modalProducto.value = true
}

function guardarProducto(producto) {
  productos.value.push({ ...producto });

  // limpiar
  producto.value = {
    nombre: "",
    categoria: "",
    exito: null,
    carrefour: null,
    jumbo: null
  };

  modalProducto.value = false;
}
</script>

<style>
body {
  margin: 0;
  min-height: 100vh;
  background-image: url('../assets/fondo.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  background-attachment: fixed;
}

.card_izquierda {
  min-width: 280px;
  /* más anchas */
  min-height: 410px;
  /* más altas */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}


.modal-producto {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 30%;
}

.nuevo {
  font-family: "Comic Sans MS", cursive, sans-serif;
  font-size: 28px;
  font-weight: bold;
  color: #2D2D2D;
  text-align: center;
}


.contenedor {
  display: flex;
  flex-direction: row;
  height: 100vh;
  /* pantalla completa */
}

.columna {
  flex: 1;
  /* que cada una ocupe 50% */
  box-sizing: border-box;
}

.padre {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 25px;
  width: 100%;
  height: 100%;
  padding: 20px;
}

/* 🔘 Estilo base de botones */
button {
  font-family: "Georgia", serif;
  font-weight: bold;
  font-size: 22px;
  padding: 20px 0;
  width: 100%;
  max-width: 450px;
  border: none;
  border-radius: 20px;
  box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

/* 🎨 Colores */
.producto {
  background-color: #c1a2c7;
  color: #2d2d2d;
  align-self: flex-start; /* Izquierda */
}

.opcion {
  background-color: #f8e5b9;
  color: #2d2d2d;
  align-self: flex-end; /* Derecha */
}

.comparacion {
  background-color: #f8b8a0;
  color: #2d2d2d;
  align-self: flex-start; /* Izquierda */
}

/* ✨ Efecto hover */
button:hover {
  transform: scale(1.05);
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.25);
}

/* 📱 Responsivo */
@media (max-width: 768px) {
  button {
    width: 90%;
    font-size: 18px;
  }

  .producto,
  .opcion,
  .comparacion {
    align-self: center; /* En pantallas pequeñas, todos centrados */
  }
}
</style>
