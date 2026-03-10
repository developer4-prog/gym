// entrenamientoDia.js

// Guardar el entrenamiento del día
async function guardarEntrenamientoDelDia(ejercicios) {
  const user = firebase.auth().currentUser;
  if (!user) return alert("No hay usuario logueado");

  const hoy = new Date();
  const fecha = hoy.toISOString().split("T")[0];

  const entrenamientoRef = firebase
    .firestore()
    .collection("usuarios")
    .doc(user.uid)
    .collection("entrenamientos")
    .doc(fecha);

  await entrenamientoRef.set({
    ejercicios: ejercicios,
    completado: false,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  });

  alert("Entrenamiento guardado para hoy: " + fecha);
}

// Obtener el entrenamiento del día
async function obtenerEntrenamientoDelDia() {
  const user = firebase.auth().currentUser;
  if (!user) return alert("No hay usuario logueado");

  const hoy = new Date();
  const fecha = hoy.toISOString().split("T")[0];

  const docRef = firebase
    .firestore()
    .collection("usuarios")
    .doc(user.uid)
    .collection("entrenamientos")
    .doc(fecha);

  const docSnap = await docRef.get();
  if (docSnap.exists) {
    return docSnap.data();
  } else {
    return null;
  }
}
