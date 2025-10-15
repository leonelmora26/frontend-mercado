<template>
  <q-layout view="hHh lpR lFf" class="contenedor">

    <!-- Columna izquierda -->
    <div class="columna" style="display: flex;align-items: center;justify-content: center;">
      <q-page-container>
        <q-card class="card_izquierda" @click="modalProducto = true" style="background-color: #9FA8DA;">
          <q-card-section>
            <q-icon name="playlist_add" size="200px" color="primary" />
          </q-card-section>
          <div class="nuevo">Nuevo Producto</div>
        </q-card>
      </q-page-container>
    </div>
    f
    <!-- Columna derecha -->
    <div class="columna">
      <h1>HOLA AMOR</h1>
    </div>

    <!-- MODAL PARA AGREGAR PRODUCTO -->
    <!-- Modal -->
    <q-dialog v-model="modalProducto" persistent position="right">
      <q-card style="display: flex;align-items: center;justify-content: center;">

        <!-- Columna izquierda (Imagen) -->
        <div class="col-5 flex flex-center column bg-light">
          <q-avatar size="150px" class="q-mb-md">
            <img src="https://cdn.quasar.dev/img/avatar.png" alt="Producto" />
          </q-avatar>
          <q-btn label="Subir Imagen" color="primary" flat />
        </div>

        <!-- Columna derecha (Formulario) -->
        <q-card-section class="col-7 q-pa-md">
          <!-- Agregar producto -->
          <h3 class="titulo">Nuevo Producto</h3>
          <!-- Nombre del producto -->
          <q-input v-model="producto.nombre" label="Nombre" outlined dense class="q-mb-sm" />
          <!-- Nombre del local -->
          <q-select v-model="producto.local" :options="['D1', 'ARA', 'DolarCity', 'otro']" label="Local" outlined dense
            class="q-mb-sm" />
          <!-- Cantidad -->
          <q-input v-model="producto.cantidad" type="number" label="Cantidad" outlined dense class="q-mb-sm" />
          <!-- Selector de medida -->
          <q-select v-model="producto.unidadMedida" :options="['Kg', 'Gr', 'Ml', 'L']" label="Unidad de Medida" outlined
            dense class="q-mb-sm" />
          <!-- Valor -->
          <q-input v-model="producto.precioUnitario" type="number" label="Valor $" outlined dense class="q-mt-md" />
          <!-- Botones -->
          <div class="q-mt-lg row justify-end q-gutter-sm">
            <q-btn flat label="Cancelar" color="negative" v-close-popup />
            <q-btn label="Guardar" color="positive" @click="guardarProductos" />
          </div>
        </q-card-section>
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
const productos = ref([]);
const rows = ref([]);
const productoStore = useProductoStore();


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
    await productoStore.deleteproducto(id);
    $q.notify({
      type: "positive",
      message: "Producto eliminado correctamente"
    });
  } catch (error) {
    $q.notify({
      type: "negative",
      message: "Error eliminando producto"
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


.my-sticky-header-table thead tr th {
  background: #00b4ff;
  position: sticky;
  top: 0;
  z-index: 1;
}
</style>
