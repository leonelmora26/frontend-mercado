import { defineStore } from 'pinia';

export const useFacturaStore = defineStore('factura', {
  state: () => ({
    facturaResponse: null,
    error: null,
    
  }),

  actions: {
    async enviarFactura(facturaData) {

      // Verificar si la factura ya existe en Alegra
      // const facturaExiste = await this.verificarFacturaExistente(facturaData.numeroFactura);
      // if (facturaExiste) {
      //   this.facturaResponse = {
      //     success: false,
      //     message: "La factura ya ha sido emitida.",
      //   };
      //   console.warn("La factura ya ha sido emitida.");
      //   return this.facturaResponse;
      // }

      // Obtener client_id y asignarlo a facturaData

      const clientId = await this.obtenerClientId(facturaData.identification);
      facturaData.client_id = clientId;
      facturaData.date = facturaData.fecha_elaboracion || '';
      facturaData.dueDate = facturaData.fecha_vencimiento || '';

      if (!facturaData.client_id) {
        console.error("Error: client_id no está definido en facturaData.");
        this.facturaResponse = {
          success: false,
          error: "Error: client_id no está definido.",
        };
        return this.facturaResponse;
      }

      // Obtener item_id y otros detalles del producto
      try {
        const itemResponse = await fetch(`https://api.alegra.com/api/v1/items?query=${facturaData.codigo_producto}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${import.meta.env.VITE_ALEGRA_API_KEY}`,
          },
        });

        const itemData = await itemResponse.json();
        console.log("Respuesta de items desde Alegra:", itemData); // Agrega este registro para ver la respuesta completa de la API

        const item = itemData.find(i => i.reference === facturaData.codigo_producto);

        if (item) {
          facturaData.items = [
            {
              id: item.id,
              name: item.name,
              price: item.price[0]?.price || null,
              quantity: facturaData.cantidadProducto || 1,
              description: facturaData.codigo_producto,
              observations: facturaData.observations,
              discount: facturaData.discount || null,
            },
          ];
        } else {
          console.error("Error: No se encontró el ítem en Alegra.");
          this.facturaResponse = {
            success: false,
            error: "Error: No se encontró el ítem en Alegra.",
          };
          return this.facturaResponse;
        }
      } catch (error) {
        console.error("Error al obtener item_id:", error);
        this.facturaResponse = {
          success: false,
          error: `Error al obtener item_id: ${error.message}`,
        };
        return this.facturaResponse;
      }


      // Verificar que los datos del ítem sean correctos antes de preparar la factura
      if (!facturaData.items || facturaData.items.length === 0 || !facturaData.items[0].id || !facturaData.items[0].price) {
        console.error("Error: Datos del ítem incompletos antes de preparar la factura.");
        this.facturaResponse = {
          success: false,
          error: "Error al preparar la factura: datos incompletos.",
        };
        return this.facturaResponse;
      }


      // Preparar la factura solo si hay ítems válidos
      const preparedFactura = this.prepararFactura(facturaData);

      if (!preparedFactura) {
        this.facturaResponse = {
          success: false,
          error: "Error al preparar la factura: datos incompletos.",
        };
        return this.facturaResponse;
      } 
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
        console.log("resultado de la respuesta", result)

        if (response.ok) {
          this.facturaResponse = {
            success: true,
            response: result,
          };
          console.log("Factura enviada con éxito:", result);
        } else {
          this.facturaResponse = {
            success: false,
            error: result.error || "Error desconocido al enviar la factura.",
          };
          console.error("Error al enviar la factura:", result);
        }
      } catch (error) {
        console.error("Error de red al enviar la factura:", error);
        this.error = 'Error al enviar la factura: ' + (error.message || 'Error desconocido');
      }
      return this.facturaResponse;
    },

    // async verificarFacturaExistente(numeroFactura) {
    //   try {
    //     const response = await fetch(`https://api.alegra.com/api/v1/invoices?number=${numeroFactura}`, {
    //       method: 'GET',
    //       headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Basic ${import.meta.env.VITE_ALEGRA_API_KEY}`,
    //       },
    //     });
    //     const data = await response.json();
    //     return data.length > 0;
    //   } catch (error) {
    //     console.error("Error al verificar la factura existente:", error);
    //     return false;
    //   }
    // },

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
        return null;
      }
    },
  },
});
