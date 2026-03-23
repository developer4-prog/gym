console.log("admin-guard cargado");

auth.onAuthStateChanged(async function (user) {
  console.log("onAuthStateChanged ejecutado", user);

  if (!user) {
    console.log("No hay usuario, redirigiendo a login");
    window.location.replace("../html/login.html");
    return;
  }

  try {
    const docRef = db.collection("usuarios").doc(user.uid);
    const docSnap = await docRef.get();

    console.log(
      "Documento usuario:",
      docSnap.exists ? docSnap.data() : "no existe",
    );

    if (!docSnap.exists) {
      console.log("No existe documento del usuario");
      window.location.replace("../html/index.html");
      return;
    }

    const data = docSnap.data();

    if (data.rol !== "admin") {
      console.log("Usuario no es admin");
      window.location.replace("../html/index.html");
      return;
    }

    console.log("Usuario admin validado");
    document.body.classList.add("admin-ready");
  } catch (error) {
    console.error("Error validando admin:", error);
    window.location.replace("../html/login.html");
  }
});
