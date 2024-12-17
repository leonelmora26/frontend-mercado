import { defineStore } from "pinia";

export const useFacturaStore = defineStore('factura', {
  state: () => ({
    facturaResponse: null,
    error: null,
    facturasPendientes: [],  // Cola de facturas pendientes
    isSending: false,        // Flag para saber si hay un envío en proceso
  }),

  actions: {
    // Función principal para añadir facturas a la cola y procesarlas
     // Función principal para añadir facturas a la cola y procesarlas
     async enviarFactura(facturaData) {
      if (!facturaData || !facturaData.identification || !facturaData.items || facturaData.items.length === 0) {
      // console.error("Datos incompletos para la factura:", facturaData);
        return { success: false, error: "Datos incompletos para la factura" };
      }

    // console.log("Factura recibida para enviar:", facturaData);
      this.facturasPendientes.push(facturaData); // Añadir factura a la cola

      // Procesar la cola y esperar la respuesta
      const result = await this.procesarCola();
      return result;
    },

    // Procesar la cola de facturas
    async procesarCola() {
    // console.log("Procesando archivos..."); // Mensaje al iniciar el procesamiento
      this.facturasPendientes.sort((a, b) => {
        const nombreA = a.client?.name?.toLowerCase() || "";
        const nombreB = b.client?.name?.toLowerCase() || "";
        return nombreA.localeCompare(nombreB);
      });

    // console.log(
    //     "Facturas ordenadas alfabéticamente:",
    //     JSON.parse(JSON.stringify(this.facturasPendientes))
    //   );

      const results = []; // Arreglo para almacenar resultados de cada factura

      while (this.facturasPendientes.length > 0 && !this.isSending) {
        this.isSending = true;
        const facturaData = this.facturasPendientes.shift(); // Saca la primera factura en la cola
      // console.log("Procesando factura:", facturaData);

        try {
          // Paso 1: Obtener client_id
          const clientId = await this.obtenerClientId(facturaData.identification);
        // console.log("clientId obtenido:", clientId);
          if (!clientId) {
            throw new Error("No se pudo obtener client_id para el cliente.");
          }

          facturaData.client_id = clientId;
          facturaData.date = facturaData.fecha_elaboracion || "";
          facturaData.dueDate = facturaData.fecha_vencimiento || "";

          // Paso 2: Procesar los ítems
          facturaData.items = await this.procesarItems(facturaData.items);

          // Paso 3: Preparar y enviar la factura
          const preparedFactura = this.prepararFactura(facturaData);
        console.log("Factura preparada para enviar:", preparedFactura);

          const response = await this.enviarDatosAFactura(preparedFactura);
        console.log("Respuesta del envío de la factura:", response);

          results.push(response); // Almacenar la respuesta de esta factura
        } catch (error) {
        console.error("Error en el proceso de envío de factura:", error.message);
          results.push({ success: false, error: error.message });
        } finally {
          this.isSending = false; // Liberar el flag
        }
      }

      if (results.every((res) => res.success)) {
      console.log("Proceso exitoso"); // Mensaje cuando todas las facturas se procesan correctamente
      } else {
      console.log("Proceso completado con algunos errores.");
      }

      return results; // Retorna los resultados de todas las facturas procesadas
    },

    async procesarItems(items) {
      return await Promise.all(
        items.map(async (item) => {
          try {
          // console.log("Procesando ítem:", item);
            const itemData = await this.obtenerItem(item.codigo);
            if (!itemData) throw new Error(`Ítem no encontrado: ${item.codigo}`);

            const iva = item.tax?.find((t) => t.type === "IVA")?.amount || 0;

            return {
              id: itemData.id,
              name: itemData.name || "Sin nombre",
              price: item.price || itemData.price[0]?.price || 0,
              quantity: item.quantity || 1,
              unit: item.unit || "service",
              discount: item.descuento || 0,
              tax: iva > 0 ? [{ id: 3, amount: iva }] : [],
            };
          } catch (error) {
          // console.error("Error al procesar ítem:", error.message);
            return null; // Opcional: Maneja qué hacer con ítems inválidos
          }
        })
      );
    },
    async obtenerItem(codigoProducto) {
      const API_KEY = import.meta.env.VITE_ALEGRA_API_KEY;

      try {
      // console.log('Buscando ítem con código:', codigoProducto);
        const response = await fetch(`https://api.alegra.com/api/v1/items?query=${codigoProducto}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${API_KEY}`,
          },
        });
        const data = await response.json();
      // console.log('Respuesta de la API para ítem:', data);
        return data.find(i => i.reference === codigoProducto) || null;
      } catch (error) {
      // console.error("Error al obtener item_id:", error.message);
        return null;
      }
    },

    async enviarDatosAFactura(preparedFactura) {
      const API_KEY = import.meta.env.VITE_ALEGRA_API_KEY;

      try {
      // console.log('Enviando datos de factura a la API:', preparedFactura);
        const response = await fetch('https://api.alegra.com/api/v1/invoices', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${API_KEY}`,
            'Accept': 'application/json',
          },
          body: JSON.stringify(preparedFactura),
        });
        const result = await response.json();
      // console.log('Respuesta de la API al enviar factura:', result);

        if (!response.ok) {
          throw new Error(result.error || "Error desconocido al enviar la factura.");
        }
        return { success: true, result };
      } catch (error) {
      // console.error("Error al enviar la factura:", error.message);
        return { success: false, error: error.message };
      }
    },

    prepararFactura(facturaData) {
      const preparedFactura = {
        client: {
          id: facturaData.client_id,
          name: facturaData.nombre,
          identification: facturaData.identification,
        },
        date: facturaData.date,
        dueDate: facturaData.dueDate,
        paymentMethod: facturaData.paymentMethod || 'CASH',
        paymentForm: facturaData.paymentForm || 'CREDIT',
        operationType: facturaData.operationType || 'AIU_SERVICE',
        items: facturaData.items.filter(item => item).map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          discount: item.discount,
          unit: item.unit || 'service',
          tax: item.tax || [],
        })),
        retentions: facturaData.retentions || [],
        anotation: "Esta Factura se podrá cancelar en:\nBANCOLOMBIA en la cuenta de ahorro Numero 32200000480\nOFICINA PRINCIPAL ubicada Cra 8 No 16-14 o por el codigo QR nequi, el cual debes solicitar por Whatsapp\nLas PQR pueden ser interpuestas a través de las lineas telefónicas 3504632437 o mediante correo electrónico a SOPORTE@MIKROTECKSG.COM.",
        termsConditions: "Esta factura se asimila en todos sus efectos a una letra de cambio de conformidad con el Art. 774 del código de comercio. Autorizo que en caso de incumplimiento de esta obligación sea reportado a las centrales de riesgo, Recargo por mora y reconexión de $5.000 el cual se vera reflejado en la siguiente facturación. MIKROTECK SAS. Empresa autorizada y vigilada por el MINTIC. Registro TIC 96003535\n",
        total: facturaData.total || 0,
      };


    // console.log("Factura preparada:", preparedFactura);
      return preparedFactura;
    },

    async obtenerClientId(identification) {
      const API_KEY = import.meta.env.VITE_ALEGRA_API_KEY;

      try {
      // console.log('Buscando clientId para identificación:', identification);
        const response = await fetch(`https://api.alegra.com/api/v1/contacts?identification=${identification}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${API_KEY}`,
          },
        });
        const data = await response.json();
      // console.log('Respuesta de la API para clientId:', data);
        return data[0]?.id || null;
      } catch (error) {
      // console.error("Error al obtener client_id:", error.message);
        return null;
      }
    },
  },
});
