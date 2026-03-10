const btnRegistrarCliente = document.getElementById("btnRegistrarCliente");
const registroMsg = document.getElementById("registro-msg");

async function registrarCliente() {
  const nombres = document.getElementById("nombres").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!nombres || !email || !password) {
    registroMsg.textContent = "Completa todos los campos.";
    return;
  }

  try {
    registroMsg.textContent = "Registrando cliente...";

    const segundaApp =
      firebase.apps.find((app) => app.name === "Secondary") ||
      firebase.initializeApp(firebase.app().options, "Secondary");

    const secondaryAuth = segundaApp.auth();

    const userCredential = await secondaryAuth.createUserWithEmailAndPassword(
      email,
      password,
    );

    const nuevoUsuario = userCredential.user;

    await db.collection("usuarios").doc(nuevoUsuario.uid).set({
      nombres: nombres,
      email: email,
      rol: "usuario",
      asistencias: 0,
    });

    await secondaryAuth.signOut();

    registroMsg.textContent = "Cliente registrado correctamente.";

    document.getElementById("nombres").value = "";
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
  } catch (error) {
    console.error("Error registrando cliente:", error);
    registroMsg.textContent = "Error: " + error.message;
  }
}

if (btnRegistrarCliente) {
  btnRegistrarCliente.addEventListener("click", registrarCliente);
}
