function comprar(producto) {
  const telefono = "593939589554"; // tu numero real

  const mensaje = `Hola, quiero comprar ${producto} 💪`;

  const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

  window.open(url, "_blank");
}
