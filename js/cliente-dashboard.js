const rachaActual = document.getElementById("rachaActual");
const diasAsistidosMes = document.getElementById("diasAsistidosMes");
const saludoUsuario = document.getElementById("saludoUsuario");

const membresiaInicio = document.getElementById("membresiaInicio");
const membresiaFin = document.getElementById("membresiaFin");
const estadoMembresia = document.getElementById("estadoMembresia");
const cardDiasAsistidos = document.getElementById("cardDiasAsistidos");
const rachaFirePopup = document.getElementById("rachaFirePopup");
const logoutBtn = document.getElementById("logoutBtn");

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getEndOfWeek(date) {
  const d = getStartOfWeek(date);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

function getStartOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getEndOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function convertirFechaDesdeId(fechaId) {
  const partes = fechaId.split("-");
  if (partes.length !== 3) return null;

  const anio = parseInt(partes[0]);
  const mes = parseInt(partes[1]) - 1;
  const dia = parseInt(partes[2]);

  return new Date(anio, mes, dia);
}

function calcularEstadoMembresia(fechaFin) {
  if (!fechaFin) {
    return { texto: "Sin registrar", clase: "sin-membresia" };
  }

  const hoy = new Date();
  const fin = new Date(fechaFin + "T23:59:59");

  if (hoy > fin) {
    return { texto: "Vencida", clase: "vencida" };
  }

  return { texto: "Activa", clase: "activa" };
}

function cargarResumenAsistencias(uid) {
  db.collection("usuarios")
    .doc(uid)
    .get()
    .then((doc) => {
      if (doc.exists) {
        const data = doc.data();

        if (data.nombres && saludoUsuario) {
          const primerNombre = data.nombres.split(" ")[0];
          const nombreFormateado =
            primerNombre.charAt(0).toUpperCase() + primerNombre.slice(1);

          saludoUsuario.textContent = `Hola, ${nombreFormateado} 💪`;
        }

        if (membresiaInicio) {
          membresiaInicio.textContent = `Inicio: ${data.membresiaInicio || "--"}`;
        }

        if (membresiaFin) {
          membresiaFin.textContent = `Fin: ${data.membresiaFin || "--"}`;
        }

        if (estadoMembresia) {
          const estado = calcularEstadoMembresia(data.membresiaFin);
          estadoMembresia.textContent = `Estado: ${estado.texto}`;
          estadoMembresia.className = `estado-membresia-user ${estado.clase}`;
        }
      }
    })
    .catch((error) => {
      console.error("Error cargando datos del usuario:", error);
    });

  const hoy = new Date();
  const inicioSemana = getStartOfWeek(hoy);
  const finSemana = getEndOfWeek(hoy);
  const inicioMes = getStartOfMonth(hoy);
  const finMes = getEndOfMonth(hoy);

  let totalSemana = 0;
  let totalMes = 0;

  db.collection("usuarios")
    .doc(uid)
    .collection("asistencias")
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        const fechaAsistencia = convertirFechaDesdeId(doc.id);

        if (!fechaAsistencia) return;

        if (fechaAsistencia >= inicioSemana && fechaAsistencia <= finSemana) {
          totalSemana++;
        }

        if (fechaAsistencia >= inicioMes && fechaAsistencia <= finMes) {
          totalMes++;
        }
      });

      if (rachaActual) {
        rachaActual.textContent = `${totalSemana} día${totalSemana !== 1 ? "s" : ""} esta semana`;
      }

      if (diasAsistidosMes) {
        diasAsistidosMes.textContent = `Este mes: ${totalMes}`;
      }

      if (totalMes >= 20 && rachaFirePopup) {
        rachaFirePopup.classList.remove("hidden");

        setTimeout(() => {
          rachaFirePopup.classList.add("hidden");
        }, 3000);
      }

      if (cardDiasAsistidos) {
        cardDiasAsistidos.classList.remove(
          "racha-leve",
          "racha-media",
          "racha-fuerte",
        );

        if (totalMes >= 21) {
          cardDiasAsistidos.classList.add("racha-fuerte");
        } else if (totalMes >= 14) {
          cardDiasAsistidos.classList.add("racha-media");
        } else if (totalMes >= 7) {
          cardDiasAsistidos.classList.add("racha-leve");
        }
      }
    })
    .catch((error) => {
      console.error("Error cargando asistencias:", error);
    });
}

auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("Usuario autenticado:", user.uid);
    cargarResumenAsistencias(user.uid);
  } else {
    window.location.href = "login.html";
  }
});

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await auth.signOut();
      localStorage.removeItem("rememberSessionSelected");
      window.location.href = "login.html";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("No se pudo cerrar sesión");
    }
  });
}

const currentPassword = document.getElementById("currentPassword");
const newPassword = document.getElementById("newPassword");
const confirmPassword = document.getElementById("confirmPassword");
const passwordMsg = document.getElementById("passwordMsg");

function mostrarMensajePassword(tipo, mensaje) {
  if (!passwordMsg) return;

  passwordMsg.textContent = mensaje;
  passwordMsg.className = `password-msg ${tipo}`;

  setTimeout(() => {
    passwordMsg.textContent = "";
    passwordMsg.className = "password-msg hidden";
  }, 3500);
}

async function cambiarPasswordUsuario() {
  const user = auth.currentUser;
  const changePasswordBtn = document.getElementById("changePasswordBtn");

  if (!user) {
    mostrarMensajePassword("error", "Tu sesión no está activa.");
    return;
  }

  const actual = currentPassword ? currentPassword.value.trim() : "";
  const nueva = newPassword ? newPassword.value.trim() : "";
  const confirmar = confirmPassword ? confirmPassword.value.trim() : "";

  if (!actual || !nueva || !confirmar) {
    mostrarMensajePassword("warning", "Completa todos los campos.");
    return;
  }

  if (nueva.length < 6) {
    mostrarMensajePassword(
      "warning",
      "La nueva contraseña debe tener al menos 6 caracteres.",
    );
    return;
  }

  if (nueva !== confirmar) {
    mostrarMensajePassword("warning", "La confirmación no coincide.");
    return;
  }

  if (!user.email) {
    mostrarMensajePassword("error", "No se pudo verificar tu correo.");
    return;
  }

  try {
    if (changePasswordBtn) {
      changePasswordBtn.disabled = true;
      changePasswordBtn.textContent = "Actualizando...";
    }

    const credential = firebase.auth.EmailAuthProvider.credential(
      user.email,
      actual,
    );

    await user.reauthenticateWithCredential(credential);
    await user.updatePassword(nueva);

    if (currentPassword) currentPassword.value = "";
    if (newPassword) newPassword.value = "";
    if (confirmPassword) confirmPassword.value = "";

    mostrarMensajePassword("success", "Contraseña actualizada correctamente.");

    const box = document.getElementById("passwordBox");
    if (box) {
      setTimeout(() => {
        box.classList.add("hidden");
      }, 1200);
    }
  } catch (error) {
    console.error("Error cambiando contraseña:", error);

    if (error.code === "auth/wrong-password") {
      mostrarMensajePassword("error", "La contraseña actual es incorrecta.");
    } else if (error.code === "auth/weak-password") {
      mostrarMensajePassword(
        "warning",
        "La nueva contraseña es demasiado débil.",
      );
    } else if (error.code === "auth/too-many-requests") {
      mostrarMensajePassword(
        "error",
        "Demasiados intentos. Intenta más tarde.",
      );
    } else {
      mostrarMensajePassword("error", "No se pudo actualizar la contraseña.");
    }
  } finally {
    if (changePasswordBtn) {
      changePasswordBtn.disabled = false;
      changePasswordBtn.textContent = "Actualizar contraseña";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("togglePasswordBox");
  const box = document.getElementById("passwordBox");
  const btn = document.getElementById("changePasswordBtn");

  if (toggle && box) {
    toggle.addEventListener("click", () => {
      box.classList.toggle("hidden");
    });
  }

  if (btn) {
    btn.addEventListener("click", cambiarPasswordUsuario);
  }
});
