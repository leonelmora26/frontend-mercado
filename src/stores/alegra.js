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
      console.log('Factura recibida para enviar:', facturaData);
      this.facturasPendientes.push(facturaData); // Añadir factura a la cola
      await this.procesarCola(); // Intentar procesar la cola
    },

    // Procesar la cola de facturas
    async procesarCola() {
      if (this.isSending || this.facturasPendientes.length === 0) return; // Si ya está enviando, espera

      this.isSending = true;
      const facturaData = this.facturasPendientes.shift(); // Saca la primera factura en la cola
      console.log('Procesando factura:', facturaData);

      try {
        // Paso 1: Obtener client_id
        const clientId = await this.obtenerClientId(facturaData.identification);
        console.log('clientId obtenido:', clientId);
        if (!clientId) {
          throw new Error("Error: No se pudo obtener client_id para el cliente.");
        }

        facturaData.client_id = clientId;
        facturaData.date = facturaData.fecha_elaboracion || '';
        facturaData.dueDate = facturaData.fecha_vencimiento || '';
        console.log('Factura con clientId agregado:', facturaData);

        // Paso 2: Obtener el item_id
        facturaData.items = await Promise.all(
          facturaData.items.map(async (item) => {
            console.log('Procesando ítem:', item);
            const itemData = await this.obtenerItem(item.codigo);
            console.log('Datos del ítem obtenido:', itemData);
            if (!itemData) {
              throw new Error(`Error: No se encontró el ítem con código ${item.codigo}`);
            }
            const processedItem = {
              id: itemData.id,
              name: itemData.name,
              price: item.price || itemData.price[0]?.price || null,
              quantity: item.quantity || 1,
              description: item.description || '',
              observations: item.observations || '',
              discount: item.discount || 0,
              tax: item.tax || [], // Mantén los impuestos originales
            };            
            console.log('Ítem procesado:', processedItem);
            return processedItem;
          })
        );

        console.log('Todos los ítems procesados:', facturaData.items);

        // Paso 3: Preparar y enviar la factura
        const preparedFactura = this.prepararFactura(facturaData);
        console.log('Factura preparada para enviar:', preparedFactura);

        const response = await this.enviarDatosAFactura(preparedFactura);
        console.log('Respuesta del envío de la factura:', response);

        this.facturaResponse = response.success
          ? { success: true, response: response.result }
          : { success: false, error: response.error };

      } catch (error) {
        console.error("Error en el proceso de envío de factura:", error.message);
        this.facturaResponse = { success: false, error: error.message };
      } finally {
        this.isSending = false; // Liberar el flag
        if (this.facturasPendientes.length > 0) {
          console.log('Procesando la siguiente factura en la cola...');
          this.procesarCola(); // Llamar de nuevo para procesar la siguiente factura en la cola
        }
      }

      return this.facturaResponse;
    },

    async obtenerItem(codigoProducto) {
      try {
        console.log('Buscando ítem con código:', codigoProducto);
        const response = await fetch(`https://api.alegra.com/api/v1/items?query=${codigoProducto}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${import.meta.env.VITE_ALEGRA_API_KEY}`,
          },
        });
        const data = await response.json();
        console.log('Respuesta de la API para ítem:', data);
        return data.find(i => i.reference === codigoProducto) || null;
      } catch (error) {
        console.error("Error al obtener item_id:", error);
        return null;
      }
    },

    async enviarDatosAFactura(preparedFactura) {
      try {
        console.log('Enviando datos de factura a la API:', preparedFactura);
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
        console.log('Respuesta de la API al enviar factura:', result);
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
      const preparedFactura = {
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
      console.log('Factura preparada:', preparedFactura);
      return preparedFactura;
    },

    async obtenerClientId(identification) {
      try {
        console.log('Buscando clientId para identificación:', identification);
        const response = await fetch(`https://api.alegra.com/api/v1/contacts?identification=${identification}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${import.meta.env.VITE_ALEGRA_API_KEY}`,
          },
        });
        const data = await response.json();
        console.log('Respuesta de la API para clientId:', data);
        return data[0]?.id || null;
      } catch (error) {
        console.error("Error al obtener client_id:", error.message);
        return null;
      }
    },
  },
});
