<template>
    <div>
      <button @click="printTicket">Imprimir Ticket</button>
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
  /* Aquí puedes agregar estilos específicos para el componente */
  </style>
  