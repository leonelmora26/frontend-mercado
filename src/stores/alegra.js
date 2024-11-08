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
    async enviarFactura(facturaData) {
      this.facturasPendientes.push(facturaData); // Añadir factura a la cola
      await this.procesarCola(); // Intentar procesar la cola
    },

    // Procesar la cola de facturas
    async procesarCola() {
      if (this.isSending || this.facturasPendientes.length === 0) return; // Si ya está enviando, espera

      this.isSending = true;
      const facturaData = this.facturasPendientes.shift(); // Saca la primera factura en la cola

      try {
        // Paso 1: Obtener client_id
        const clientId = await this.obtenerClientId(facturaData.identification);
        if (!clientId) {
          throw new Error("Error: No se pudo obtener client_id para el cliente.");
        }

        facturaData.client_id = clientId;
        facturaData.date = facturaData.fecha_elaboracion || '';
        facturaData.dueDate = facturaData.fecha_vencimiento || '';

        // Paso 2: Obtener el item_id
        const item = await this.obtenerItem(facturaData.codigo_producto);
        if (!item) throw new Error("Error: No se encontró el ítem en Alegra.");

        facturaData.items = [{
          id: item.id,
          name: item.name,
          price: item.price[0]?.price || null,
          quantity: facturaData.cantidadProducto || 1,
          description: facturaData.codigo_producto,
          observations: facturaData.observations,
          discount: facturaData.discount || null,
        }];

        // Paso 3: Preparar y enviar la factura
        const preparedFactura = this.prepararFactura(facturaData);
        const response = await this.enviarDatosAFactura(preparedFactura);

        this.facturaResponse = response.success
          ? { success: true, response: response.result }
          : { success: false, error: response.error };

      } catch (error) {
        console.error("Error en el proceso de envío de factura:", error.message);
        this.facturaResponse = { success: false, error: error.message };
      } finally {
        this.isSending = false; // Liberar el flag
        if (this.facturasPendientes.length > 0) {
          this.procesarCola(); // Llamar de nuevo para procesar la siguiente factura en la cola
        }
      }

      return this.facturaResponse;
    },

    async obtenerItem(codigoProducto) {
      try {
        const response = await fetch(`https://api.alegra.com/api/v1/items?query=${codigoProducto}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${import.meta.env.VITE_ALEGRA_API_KEY}`,
          },
        });
        const data = await response.json();
        return data.find(i => i.reference === codigoProducto) || null;
      } catch (error) {
        console.error("Error al obtener item_id:", error);
        return null;
      }
    },

    async enviarDatosAFactura(preparedFactura) {
      try {
        const response = await fetch('https://api.alegra.com/api/v1/invoices', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${import.meta.env.VITE_ALEGRA_API_KEY}`,
            'Accept': 'application/json',
          },
          body: JSON.stringify(preparedFactura),
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Error desconocido al enviar la factura.");
        }
        return { success: true, result };
      } catch (error) {
        console.error("Error al enviar la factura:", error.message);
        return { success: false, error: error.message };
      }
    },

    prepararFactura(facturaData) {
      return {
        client: { id: facturaData.client_id },
        date: facturaData.date,
        dueDate: facturaData.dueDate,
        paymentMethod: facturaData.paymentMethod || 'CASH',
        paymentForm: facturaData.paymentForm || 'CREDIT',
        operationType: facturaData.operationType || 'AIU_SERVICE',
        items: facturaData.items,
        termsConditions: facturaData.termsConditions || 'Esta Factura se podrá cancelar en: BANCOLOMBIA en la cuenta de ahorro Numero 32200000480 OFICINA PRINCIPAL ubicada Cra 8 No 16-14',
        anotation: facturaData.anotation || 'MIKROTECK SAS. Empresa autorizada y vigilada por el MINTIC. Registro TIC 96003535',
      };
    },

    async obtenerClientId(identification) {
      try {
        const response = await fetch(`https://api.alegra.com/api/v1/contacts?identification=${identification}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${import.meta.env.VITE_ALEGRA_API_KEY}`,
          },
        });
        const data = await response.json();
        return data[0]?.id || null;
      } catch (error) {
        console.error("Error al obtener client_id:", error.message);
        return null;
      }
    },
  },
});
