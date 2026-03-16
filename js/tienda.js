function comprar(producto) {
  const telefono = "593939589554";
  const mensaje = `Hola, quiero comprar ${producto} 💪`;
  const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");
}

const detallesProductos = {
  "Proteína Whey": {
    titulo: "Proteína Whey",
    texto1:
      "Aporta proteína de alta calidad para favorecer la recuperación muscular y el crecimiento de masa magra después del entrenamiento.",
    texto2:
      "Es ideal para complementar la alimentación diaria, mejorar la saciedad y apoyar objetivos de fuerza, volumen o definición.",
  },
  Creatina: {
    titulo: "Creatina",
    texto1:
      "Ayuda a mejorar la fuerza, la potencia y el rendimiento en ejercicios intensos y explosivos como pesas, sprints y series cortas.",
    texto2:
      "Es uno de los suplementos más efectivos para aumentar el rendimiento físico y apoyar la ganancia muscular con uso constante.",
  },
  "Pre-Entreno": {
    titulo: "Pre-Entreno",
    texto1:
      "Diseñado para elevar la energía, la concentración y la motivación antes de cada sesión de entrenamiento.",
    texto2:
      "Puede ayudar a rendir mejor en entrenamientos exigentes, especialmente cuando necesitas enfoque y activación extra.",
  },
  BCAA: {
    titulo: "BCAA",
    texto1:
      "Contiene aminoácidos esenciales que apoyan la recuperación muscular y ayudan a disminuir la fatiga durante entrenamientos intensos.",
    texto2:
      "Es una buena opción para quienes buscan mejorar la recuperación y sostener el rendimiento físico.",
  },
  Glutamina: {
    titulo: "Glutamina",
    texto1:
      "Favorece la recuperación muscular y puede ayudar a reducir el desgaste físico tras entrenamientos frecuentes o exigentes.",
    texto2:
      "También es usada como apoyo en etapas de alta carga física para contribuir al bienestar general y la recuperación.",
  },
  "Ganador de Peso": {
    titulo: "Ganador de Peso",
    texto1:
      "Aporta calorías adicionales, carbohidratos y proteína para apoyar procesos de aumento de masa muscular y peso corporal.",
    texto2:
      "Es útil para personas con metabolismo acelerado o dificultad para consumir suficientes calorías con comida normal.",
  },
};

function abrirDetalle(boton) {
  const producto = boton.dataset.producto;
  const detalle = detallesProductos[producto];

  if (!detalle) return;

  document.getElementById("modalTitulo").textContent = detalle.titulo;
  document.getElementById("modalTexto1").textContent = detalle.texto1;
  document.getElementById("modalTexto2").textContent = detalle.texto2;

  document.getElementById("modalDetalle").classList.remove("hidden");
}

function cerrarDetalle() {
  document.getElementById("modalDetalle").classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".store-tab");
  const products = document.querySelectorAll(".product-card");
  const title = document.getElementById("store-title");
  const modal = document.getElementById("modalDetalle");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const category = tab.dataset.category;

      tabs.forEach((btn) => btn.classList.remove("active"));
      tab.classList.add("active");

      products.forEach((product) => {
        if (product.dataset.category === category) {
          product.classList.remove("hidden-category");
        } else {
          product.classList.add("hidden-category");
        }
      });

      title.textContent =
        category === "suplementos"
          ? "🛒 Suplementos recomendados"
          : "👕 Prendas Gym recomendadas";
    });
  });

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        cerrarDetalle();
      }
    });
  }
});
