<template>
    <div class="container">
      <div class="superior">
        <div class="titulo">Subir Archivo CSV</div>
        <div>Subir Archivo CSV:</div>
        <div>
          <div class="seleccionar">
            <input type="file" accept=".csv" @change="procesarArchivo" style="display: none;" ref="fileInput">
            <button @click="abrirSeleccionArchivo" class="btn" style="background-color: #007BFF; font-weight: bold; color: white; width: 25%; height: 30%;">
              Seleccionar el archivo
            </button>
            <div v-if="nombreArchivo">{{ nombreArchivo }}</div>
            <div v-else>Ningún archivo seleccionado</div>
          </div>
        </div>
        
        <!-- Botones de acción -->
        <div class="btn-agregar">
          <button @click="enviarFacturasAnidadas" class="btn" style="color: white; width: 18%;">Enviar Facturas Anidadas a Alegra</button>
          <button @click="enviarFacturasSimples" class="btn" style="color: white; width: 18%;">Enviar Facturas Simples a Alegra</button>
          <button @click="procesarDatos" class="btn" style="color: white; width: 18%;">Procesar Datos</button>
          <button @click="limpiarBaseDeDatos" class="btn" style="color: white; width: 18%;">Limpiar Base de Datos</button>
          <button @click="subirArchivo" class="btn" style="color: white; width: 18%;">Subir</button>
        </div>
  
        <!-- Tabla -->
        <div style="width: 90vw;">
          <q-table
            class="my-sticky-virtscroll-table"
            virtual-scroll
            flat
            bordered
            v-model:pagination="pagination"
            :rows-per-page-options="[10, 30, 50]"
            :virtual-scroll-sticky-size-start="48"
            row-key="name"
            :rows="rows"
            :columns="columns"
          >
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
                <button @click="imprimirTicket(props.row)" class="edi">
                  <i class="fa-solid fa-print"></i>
                </button>
              </q-td>
            </template>
          </q-table>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        nombreArchivo: '', // Para mostrar el nombre del archivo seleccionado
        rows: [], // Filas de la tabla
        columns: [ // Columnas de la tabla
          { name: 'nombre', label: 'Nombre', align: 'left', field: row => row.nombre },
          { name: 'estado', label: 'Estado', align: 'left', field: 'estado' },
          { name: 'opciones', label: 'Opciones', align: 'left' },
        ],
        pagination: {
          page: 1,
          rowsPerPage: 10
        },
      };
    },
    methods: {
      abrirSeleccionArchivo() {
        this.$refs.fileInput.click();
      },
      procesarArchivo(event) {
        const archivo = event.target.files[0];
        if (archivo) {
          this.nombreArchivo = archivo.name;
        } else {
          this.nombreArchivo = '';
        }
      },
      async subirArchivo() {
        const archivo = this.$refs.fileInput.files[0];
        if (!archivo) {
          alert('Por favor, selecciona un archivo CSV');
          return;
        }
  
        const formData = new FormData();
        formData.append('archivo_csv', archivo);
  
        try {
          const respuesta = await axios.post('ruta/del/archivo/subir_archivo.php', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          console.log(respuesta.data);
        } catch (error) {
          console.error('Error al subir el archivo', error);
        }
      },
      enviarFacturasAnidadas() {
        // Lógica para enviar facturas anidadas
      },
      enviarFacturasSimples() {
        // Lógica para enviar facturas simples
      },
      procesarDatos() {
        // Lógica para procesar los datos
      },
      limpiarBaseDeDatos() {
        // Lógica para limpiar la base de datos
      },
      imprimirTicket(row) {
        // Lógica para imprimir el ticket
        console.log('Imprimir ticket:', row);
      },
    },
  };
  </script>
  
  <style scoped>
  .container {
    width: 100%;
    margin: 0 auto;
  }
  
  .btn-agregar {
    margin: 20px 0;
  }
  
  .btn {
    background-color: #28a745;
    border: none;
    padding: 10px;
    margin-right: 10px;
    cursor: pointer;
  }
  
  .btn:hover {
    background-color: #218838;
  }
  
  .q-pa-md {
    padding: 20px;
  }
  
  .edi {
    background: none;
    border: none;
    cursor: pointer;
  }
  </style>