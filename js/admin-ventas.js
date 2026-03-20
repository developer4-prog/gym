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
    const textoOriginal = boton.textContent;
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
        '<p class="empty-state">No hay productos activos registrados.</p>';
      return;
    }

    snapshot.forEach((doc) => {
      const producto = doc.data();
      const productoId = doc.id;
      const stock = Number(producto.stock || 0);
      const sinStock = stock <= 0;

      const card = document.createElement("div");
      card.classList.add("producto-card");

      card.innerHTML = `
        <div class="producto-imagen-wrap">
          <img src="${producto.imagen || ""}" alt="${producto.nombre || "Producto"}" class="producto-imagen" />
        </div>

        <h3>${producto.nombre || "Producto"}</h3>
        <p class="producto-precio">${formatearPrecio(producto.precio)}</p>
        <p class="producto-stock">Stock: ${stock}</p>

        <button class="btn-vender-producto" ${sinStock ? "disabled" : ""}>
          ${sinStock ? "Sin stock" : "Vender"}
        </button>
      `;

      const botonVender = card.querySelector(".btn-vender-producto");
      botonVender.addEventListener("click", () =>
        venderProducto(productoId, botonVender),
      );

      lista.appendChild(card);
    });
  } catch (error) {
    console.error("Error cargando productos:", error);
    lista.innerHTML = '<p class="empty-state">Error cargando productos.</p>';
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await cargarResumenVentasHoy();
  await cargarProductos();
});
