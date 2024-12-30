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
      while (this.facturasPendientes.length > 0 && !this.isSending) {
        this.isSending = true;
        const facturaData = this.facturasPendientes.shift(); // Saca la primera factura en la cola
    
        try {
          // Paso 1: Obtener datos del cliente
          const clientData = await this.obtenerClientId(facturaData.identification);
          if (!clientData || !clientData.id) {
            throw new Error("No se pudo obtener el cliente asociado.");
          }
    
          facturaData.client_id = clientData.id; // Usado para preparar la factura
          facturaData.clientData = clientData;  // Usado para mostrar en la interfaz
          facturaData.date = facturaData.fecha_elaboracion || "";
          facturaData.dueDate = facturaData.fecha_vencimiento || "";
    
          // Paso 2: Procesar los ítems
          facturaData.items = await this.procesarItems(facturaData.items);
    
          // Paso 3: Preparar y enviar la factura
          const preparedFactura = this.prepararFactura(facturaData);
          console.log("Factura preparada para enviar:", preparedFactura);
    
          const response = await this.enviarDatosAFactura(preparedFactura);
          console.log("Respuesta del envío de la factura:", response);
    
        } catch (error) {
          console.error("Error en el proceso de envío de factura:", error.message);
        } finally {
          this.isSending = false; // Liberar el flag
        }
      }
    }
    ,

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
      return {
        client: {
          id: facturaData.client_id, // Alegra necesita únicamente este campo
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
        anotation: facturaData.anotation || "",
        termsConditions: facturaData.termsConditions || "",
        total: facturaData.total || 0,
      };
    }
    ,

    async obtenerClientId(identification) {
      const API_KEY = import.meta.env.VITE_ALEGRA_API_KEY;
    
      try {
        const response = await fetch(`https://api.alegra.com/api/v1/contacts?identification=${identification}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${API_KEY}`,
          },
        });
        const data = await response.json();
    
        if (data && data.length > 0) {
          const client = data[0]; // Toma el primer cliente encontrado
          return {
            id: client.id, // Este es obligatorio para Alegra
            name: client.name || null,
            identification: client.identification || null,
            address: client.address || null,
            email: client.email || null,
            phone: client.phonePrimary || null,
          };
        } else {
          return null; // No se encontró cliente
        }
      } catch (error) {
        console.error("Error al obtener client_id:", error.message);
        return null; // Manejo del error
      }
    },
    
  },
});
