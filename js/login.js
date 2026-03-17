// Solo una vez: auth y db
// const auth = firebase.auth();
// const db = firebase.firestore();

// Función de login
async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const rememberSession = document.getElementById("rememberSession");
  const loginError = document.getElementById("loginError");

  // Limpiar mensaje anterior
  loginError.textContent = "";

  try {
    // Definir persistencia según checkbox
    const persistence =
      rememberSession && rememberSession.checked
        ? firebase.auth.Auth.Persistence.LOCAL
        : firebase.auth.Auth.Persistence.SESSION;

    await auth.setPersistence(persistence);

    const userCredential = await auth.signInWithEmailAndPassword(
      email,
      password,
    );
    const user = userCredential.user;

    // ✅ Guardar preferencia SOLO si el login fue exitoso
    localStorage.setItem(
      "rememberSessionSelected",
      rememberSession.checked ? "true" : "false",
    );

    console.log("Usuario autenticado:", user.uid);

    const userDoc = await db.collection("usuarios").doc(user.uid).get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log("Datos del usuario:", userData);

      if (userData.rol === "admin") {
        window.location.href = "admin.html";
      } else if (userData.rol === "usuario") {
        window.location.href = "dashboard.html";
      } else {
        loginError.textContent = "Rol de usuario no válido";
      }
    } else {
      loginError.textContent = "No se encontró este usuario en el sistema";
    }
  } catch (error) {
    let mensaje = "Error al iniciar sesión";

    if (error.code === "auth/invalid-email") {
      mensaje = "Correo inválido";
    } else if (
      error.code === "auth/user-not-found" ||
      error.code === "auth/invalid-credential"
    ) {
      mensaje =
        "No existe este usuario en el sistema o los datos son incorrectos";
    } else if (error.code === "auth/wrong-password") {
      mensaje = "Contraseña incorrecta";
    } else if (error.code === "auth/too-many-requests") {
      mensaje = "Demasiados intentos. Intenta luego";
    } else if (error.code === "auth/network-request-failed") {
      mensaje = "Sin conexión a internet";
    }

    loginError.textContent = mensaje;
    console.error(error);
  }
}

auth.onAuthStateChanged(async (user) => {
  const rememberSelected =
    localStorage.getItem("rememberSessionSelected") === "true";

  if (user && rememberSelected) {
    try {
      const userDoc = await db.collection("usuarios").doc(user.uid).get();

      if (userDoc.exists) {
        const userData = userDoc.data();

        if (userData.rol === "admin") {
          window.location.href = "admin.html";
        } else if (userData.rol === "usuario") {
          window.location.href = "dashboard.html";
        }
      }
    } catch (error) {
      console.error("Error verificando sesión:", error);
    }
  }
});

// Conectar botón de login
document.getElementById("btnLogin").addEventListener("click", login);
