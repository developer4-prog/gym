function obtenerFechaHoyLocal() {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, "0");
  const day = String(hoy.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function obtenerHoraActual() {
  return new Date().toLocaleTimeString("es-EC", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatearPrecio(valor) {
  return `$${Number(valor || 0).toFixed(2)}`;
}

function obtenerImagenProducto(nombre) {
  const nombreNormalizado = (nombre || "").toLowerCase().trim();

  if (nombreNormalizado.includes("agua")) return "/gym/imagenes/agua.jpg";
  if (nombreNormalizado.includes("gatorade"))
    return "/gym/imagenes/gatorade.jpg";
  if (nombreNormalizado.includes("powerade"))
    return "/gym/imagenes/powerade.jpg";
  if (
    nombreNormalizado.includes("té") ||
    nombreNormalizado.includes("te helado") ||
    nombreNormalizado === "te" ||
    nombreNormalizado.includes("te ")
  ) {
    return "/gym/imagenes/te.jpg";
  }
  if (nombreNormalizado.includes("monster")) return "/gym/imagenes/monster.jpg";

  return "/gym/imagenes/icon-192.png";
}

async function cargarResumenVentasHoy() {
  const fechaHoy = obtenerFechaHoyLocal();
  const cantidadEl = document.getElementById("ventasHoyCantidad");
  const totalEl = document.getElementById("ventasHoyTotal");

  try {
    const snapshot = await db
      .collection("ventas")
      .where("fecha", "==", fechaHoy)
      .get();

    let total = 0;

    snapshot.forEach((doc) => {
      const venta = doc.data();
      total += Number(venta.precio || 0);
    });

    cantidadEl.textContent = snapshot.size;
    totalEl.textContent = formatearPrecio(total);
  } catch (error) {
    console.error("Error cargando resumen de ventas:", error);
    cantidadEl.textContent = "0";
    totalEl.textContent = "$0.00";
  }
}

async function venderProducto(productoId, boton) {
  try {
    boton.disabled = true;
    boton.textContent = "Vendiendo...";

    await db.runTransaction(async (transaction) => {
      const productoRef = db.collection("productos").doc(productoId);
      const productoDoc = await transaction.get(productoRef);

      if (!productoDoc.exists) {
        throw new Error("El producto no existe.");
      }

      const producto = productoDoc.data();
      const stockActual = Number(producto.stock || 0);

      if (stockActual <= 0) {
        throw new Error("Sin stock disponible.");
      }

      transaction.update(productoRef, {
        stock: stockActual - 1,
      });

      const ventaRef = db.collection("ventas").doc();

      transaction.set(ventaRef, {
        productoId,
        nombre: producto.nombre || "Producto",
        precio: Number(producto.precio || 0),
        fecha: obtenerFechaHoyLocal(),
        hora: obtenerHoraActual(),
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });
    });

    await cargarProductos();
    await cargarResumenVentasHoy();
  } catch (error) {
    console.error("Error registrando venta:", error);
    alert(error.message || "No se pudo registrar la venta.");
  } finally {
    boton.disabled = false;
    boton.textContent = "Vender";
  }
}

async function cargarProductos() {
  const lista = document.getElementById("productos-lista");

  try {
    const snapshot = await db.collection("productos").get();

    lista.innerHTML = "";

    if (snapshot.empty) {
      lista.innerHTML =
        '<p class="empty-state">No hay productos registrados.</p>';
      return;
    }

    snapshot.forEach((doc) => {
      const producto = doc.data();
      const productoId = doc.id;
      const stock = Number(producto.stock || 0);
      const sinStock = stock <= 0;
      const nombreProducto = producto.nombre || "Producto";
      const imagenProducto = obtenerImagenProducto(nombreProducto);

      const card = document.createElement("div");
      card.classList.add("producto-card");

      card.innerHTML = `
  <div class="producto-imagen-wrap">
    <img
      src="${imagenProducto}"
      alt="${nombreProducto}"
      class="producto-imagen"
      loading="lazy"
      onerror="this.src='/gym/imagenes/icon-192.png'"
    />
  </div>

  <h3>${nombreProducto}</h3>
  <p class="producto-precio">${formatearPrecio(producto.precio)}</p>
  <p class="producto-stock">Stock: ${stock}</p>

  <button class="btn-vender-producto" ${sinStock ? "disabled" : ""}>
    ${sinStock ? "Sin stock" : "Vender"}
  </button>

  <button class="btn-agregar-stock">
    Agregar stock
  </button>
`;

      const botonVender = card.querySelector(".btn-vender-producto");
      botonVender.addEventListener("click", () =>
        venderProducto(productoId, botonVender),
      );

      const botonStock = card.querySelector(".btn-agregar-stock");
      botonStock.addEventListener("click", () =>
        agregarStockProducto(productoId),
      );

      lista.appendChild(card);
    });
  } catch (error) {
    console.error("Error cargando productos:", error);
    lista.innerHTML = '<p class="empty-state">Error cargando productos.</p>';
  }
}

async function exportarVentasHoy() {
  const fechaHoy = obtenerFechaHoyLocal();
  const boton = document.getElementById("btnExportarVentasHoy");

  try {
    boton.disabled = true;
    boton.textContent = "Exportando...";

    const snapshot = await db
      .collection("ventas")
      .where("fecha", "==", fechaHoy)
      .orderBy("timestamp", "asc")
      .get();

    if (snapshot.empty) {
      alert("No hay ventas registradas hoy.");
      return;
    }

    let total = 0;
    let csv = "\uFEFF"; // BOM para que Excel lea bien UTF-8
    csv += "Fecha;Hora;Producto;Precio\n";

    snapshot.forEach((doc) => {
      const venta = doc.data();
      const fecha = venta.fecha || "";
      const hora = venta.hora || "";
      const nombre = (venta.nombre || "Producto").replace(/;/g, ",");
      const precio = Number(venta.precio || 0);

      total += precio;
      csv += `${fecha};${hora};${nombre};${precio.toFixed(2)}\n`;
    });

    csv += `\n`;
    csv += `Total ventas;${snapshot.size}\n`;
    csv += `Total caja;${total.toFixed(2)}\n`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `ventas-${fechaHoy}.csv`;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exportando ventas:", error);
    alert("No se pudieron exportar las ventas.");
  } finally {
    boton.disabled = false;
    boton.textContent = "Exportar ventas de hoy";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await cargarResumenVentasHoy();
  await cargarProductos();

  const btnExportarVentasHoy = document.getElementById("btnExportarVentasHoy");
  if (btnExportarVentasHoy) {
    btnExportarVentasHoy.addEventListener("click", exportarVentasHoy);
  }
});

async function agregarStockProducto(productoId) {
  try {
    const cantidadTexto = prompt(
      "Ingresa la cantidad de stock que deseas agregar:",
    );

    if (cantidadTexto === null) return;

    const cantidad = Number(cantidadTexto);

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      alert("Ingresa una cantidad válida mayor a 0");
      return;
    }

    const productoRef = db.collection("productos").doc(productoId);
    const productoSnap = await productoRef.get();

    if (!productoSnap.exists) {
      alert("Producto no encontrado");
      return;
    }

    const producto = productoSnap.data();
    const stockActual = Number(producto.stock || 0);
    const nuevoStock = stockActual + cantidad;

    await productoRef.update({
      stock: nuevoStock,
    });

    await cargarProductos();

    alert(
      `Stock actualizado. Nuevo stock de ${producto.nombre}: ${nuevoStock}`,
    );
  } catch (error) {
    console.error("Error al agregar stock:", error);
    alert("No se pudo actualizar el stock");
  }
}
