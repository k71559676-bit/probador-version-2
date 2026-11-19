const garments = [
  {id:"dress-red",name:"Vestido rojo",category:"Vestidos",price:"S/ 89.90",image:"https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=500&q=85"},
  {id:"dress-floral",name:"Vestido floral",category:"Vestidos",price:"S/ 79.90",image:"https://images.unsplash.com/photo-1612336307429-8a898d10e223?auto=format&fit=crop&w=500&q=85"},
  {id:"top-white",name:"Top blanco",category:"Tops",price:"S/ 39.90",image:"https://images.unsplash.com/photo-1551163943-3f6a855d1153?auto=format&fit=crop&w=500&q=85"},
  {id:"top-black",name:"Top negro",category:"Tops",price:"S/ 35.90",image:"https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=500&q=85"},
  {id:"blazer",name:"Blazer beige",category:"Abrigos",price:"S/ 119.90",image:"https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=500&q=85"},
  {id:"jacket",name:"Chaqueta denim",category:"Abrigos",price:"S/ 99.90",image:"https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=500&q=85"},
  {id:"jeans",name:"Jeans clásico",category:"Pantalones",price:"S/ 89.90",image:"https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=85"},
  {id:"trousers",name:"Pantalón sastre",category:"Pantalones",price:"S/ 94.90",image:"https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=500&q=85"}
];

const personInput = document.getElementById("personInput");
const uploadZone = document.getElementById("uploadZone");
const garmentInput = document.getElementById("garmentInput");
const garmentUploadCard = document.getElementById("garmentUploadCard");
const customGarmentPreview = document.getElementById("customGarmentPreview");
const customGarmentImage = document.getElementById("customGarmentImage");
const customGarmentName = document.getElementById("customGarmentName");
const photoPreviewWrap = document.getElementById("photoPreviewWrap");
const photoPreview = document.getElementById("photoPreview");
const resultImage = document.getElementById("resultImage");
const resultPlaceholder = document.getElementById("resultPlaceholder");
const tryButton = document.getElementById("tryButton");
const downloadButton = document.getElementById("downloadButton");
const statusMessage = document.getElementById("statusMessage");
const garmentGrid = document.getElementById("garmentGrid");
const selectedInfo = document.getElementById("selectedInfo");

// Pestañas híbridas y cámara
const tabCamera = document.getElementById("tabCamera");
const tabUpload = document.getElementById("tabUpload");
const cameraModeWrap = document.getElementById("cameraModeWrap");
const uploadModeWrap = document.getElementById("uploadModeWrap");
const switchToUploadLink = document.getElementById("switchToUploadLink");

const cameraStartBox = document.getElementById("cameraStartBox");
const startCameraBtn = document.getElementById("startCameraBtn");
const cameraStage = document.getElementById("cameraStage");
const cameraVideo = document.getElementById("cameraVideo");
const switchCameraBtn = document.getElementById("switchCameraBtn");
const captureBtn = document.getElementById("captureBtn");
const timerCaptureBtn = document.getElementById("timerCaptureBtn");
const countdownBadge = document.getElementById("countdownBadge");
const captureCanvas = document.getElementById("captureCanvas");
const retakePhotoBtn = document.getElementById("retakePhotoBtn");

let personFile = null;
let selectedGarment = null;
let currentResultUrl = null;
let customGarmentObjectUrl = null;
let mediaStream = null;
let currentFacingMode = "user";
let activeSourceMode = "camera"; // "camera" | "upload"

function switchSourceMode(mode) {
  activeSourceMode = mode;
  tabCamera.classList.toggle("active", mode === "camera");
  tabUpload.classList.toggle("active", mode === "upload");

  if (mode === "upload") {
    stopCamera();
    cameraStage.classList.add("hidden");
    cameraStartBox.classList.remove("hidden");
    cameraModeWrap.classList.add("hidden");
    if (!personFile) {
      uploadModeWrap.classList.remove("hidden");
    }
  } else {
    uploadModeWrap.classList.add("hidden");
    if (!personFile) {
      cameraModeWrap.classList.remove("hidden");
    }
  }
}

tabCamera.addEventListener("click", () => switchSourceMode("camera"));
tabUpload.addEventListener("click", () => switchSourceMode("upload"));
switchToUploadLink.addEventListener("click", () => switchSourceMode("upload"));

function renderGarments(category = "Todos") {
  garmentGrid.innerHTML = "";
  garments.filter(item => category === "Todos" || item.category === category).forEach(item => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `garment-card ${selectedGarment?.id === item.id ? "selected" : ""}`;
    card.innerHTML = `
      <img src="${item.image}" alt="${item.name}" loading="lazy">
      ${selectedGarment?.id === item.id ? '<span class="selected-check">✓</span>' : ""}
      <span>${item.name}</span><small>${item.price}</small>`;
    card.addEventListener("click", () => {
      if (customGarmentObjectUrl) {
        URL.revokeObjectURL(customGarmentObjectUrl);
        customGarmentObjectUrl = null;
        garmentInput.value = "";
        customGarmentPreview.classList.add("hidden");
        garmentUploadCard.classList.remove("has-custom-file");
      }
      selectedGarment = item;
      selectedInfo.textContent = `Seleccionaste: ${item.name} · ${item.price}`;
      document.querySelectorAll(".garment-card").forEach(el => el.classList.remove("selected"));
      card.classList.add("selected");
      card.querySelector(".selected-check") || card.insertAdjacentHTML("beforeend", '<span class="selected-check">✓</span>');
      updateTryButton();
    });
    garmentGrid.appendChild(card);
  });
}
renderGarments();

function setCustomGarment(file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    statusMessage.textContent = "Selecciona una imagen válida para tu prenda.";
    return;
  }
  if (file.size > 8 * 1024 * 1024) {
    statusMessage.textContent = "La imagen de la prenda supera el límite de 8 MB.";
    return;
  }
  if (customGarmentObjectUrl) URL.revokeObjectURL(customGarmentObjectUrl);
  customGarmentObjectUrl = URL.createObjectURL(file);
  selectedGarment = { id: "custom-upload", name: file.name, category: "Personalizada", price: "Prenda propia", file, image: customGarmentObjectUrl };
  customGarmentImage.src = customGarmentObjectUrl;
  customGarmentName.textContent = file.name;
  garmentUploadCard.classList.add("has-custom-file");
  customGarmentPreview.classList.remove("hidden");
  document.querySelectorAll(".garment-card").forEach(el => el.classList.remove("selected"));
  selectedInfo.textContent = "Seleccionaste tu propia prenda: " + file.name;
  statusMessage.textContent = "Tu prenda está lista. Ahora puedes probarla con tu fotografía.";
  updateTryButton();
}
garmentInput.addEventListener("change", event => setCustomGarment(event.target.files[0]));

document.getElementById("changeCustomGarment").addEventListener("click", () => {
  garmentInput.click();
});

document.getElementById("removeCustomGarment").addEventListener("click", () => {
  if (customGarmentObjectUrl) URL.revokeObjectURL(customGarmentObjectUrl);
  customGarmentObjectUrl = null;
  garmentInput.value = "";
  customGarmentPreview.classList.add("hidden");
  garmentUploadCard.classList.remove("has-custom-file");
  if (selectedGarment?.id === "custom-upload") {
    selectedGarment = null;
    selectedInfo.textContent = "Ninguna prenda seleccionada";
  }
  updateTryButton();
});

document.getElementById("categoryTabs").addEventListener("click", event => {
  const button = event.target.closest(".category");
  if (!button) return;
  document.querySelectorAll(".category").forEach(el => el.classList.remove("active"));
  button.classList.add("active");
  renderGarments(button.dataset.category);
});

// --- CONTROLADOR DE SUBIDA DE ARCHIVO ---
function setPhotoFromFile(file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    statusMessage.textContent = "Selecciona un archivo de imagen válido.";
    return;
  }
  if (file.size > 8 * 1024 * 1024) {
    statusMessage.textContent = "La imagen supera el límite de 8 MB.";
    return;
  }
  personFile = file;
  photoPreview.src = URL.createObjectURL(file);
  cameraModeWrap.classList.add("hidden");
  uploadModeWrap.classList.add("hidden");
  photoPreviewWrap.classList.remove("hidden");
  statusMessage.textContent = "Fotografía cargada. Selecciona una prenda y presiona Probar con IA.";
  updateTryButton();
}

personInput.addEventListener("change", e => setPhotoFromFile(e.target.files[0]));
uploadZone.addEventListener("dragover", e => { e.preventDefault(); uploadZone.classList.add("dragging"); });
uploadZone.addEventListener("dragleave", () => uploadZone.classList.remove("dragging"));
uploadZone.addEventListener("drop", e => {
  e.preventDefault();
  uploadZone.classList.remove("dragging");
  setPhotoFromFile(e.dataTransfer.files[0]);
});

// --- CONTROLADOR DE CÁMARA MULTIPLATAFORMA ---
async function startCamera(facingMode = "user") {
  stopCamera();
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Tu navegador no soporta acceso a cámara.");
    }
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: 1080 },
        height: { ideal: 1440 }
      },
      audio: false
    });

    cameraVideo.srcObject = mediaStream;
    currentFacingMode = facingMode;
    cameraStage.classList.toggle("mirror", facingMode === "user");

    cameraStartBox.classList.add("hidden");
    photoPreviewWrap.classList.add("hidden");
    cameraStage.classList.remove("hidden");
    statusMessage.textContent = "Cámara activa. Alinea tu cuerpo con la silueta y toma la foto.";
  } catch (err) {
    statusMessage.textContent = "No se detectó cámara en este equipo. Cambiando a modo Subir foto...";
    setTimeout(() => switchSourceMode("upload"), 1200);
  }
}

function stopCamera() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }
}

function takeSnapshot() {
  if (!cameraVideo.videoWidth) return;

  captureCanvas.width = cameraVideo.videoWidth;
  captureCanvas.height = cameraVideo.videoHeight;
  const ctx = captureCanvas.getContext("2d");

  ctx.drawImage(cameraVideo, 0, 0, captureCanvas.width, captureCanvas.height);

  captureCanvas.toBlob((blob) => {
    if (!blob) return;
    personFile = new File([blob], "captura-vestiia.jpg", { type: "image/jpeg" });
    photoPreview.src = URL.createObjectURL(personFile);

    stopCamera();
    cameraModeWrap.classList.add("hidden");
    photoPreviewWrap.classList.remove("hidden");
    statusMessage.textContent = "Fotografía capturada. Elige una prenda y presiona Probar con IA.";
    updateTryButton();
  }, "image/jpeg", 0.92);
}

startCameraBtn.addEventListener("click", () => startCamera("user"));

switchCameraBtn.addEventListener("click", () => {
  const nextMode = currentFacingMode === "user" ? "environment" : "user";
  startCamera(nextMode);
});

captureBtn.addEventListener("click", takeSnapshot);

timerCaptureBtn.addEventListener("click", () => {
  let seconds = 3;
  countdownBadge.textContent = seconds;
  countdownBadge.classList.remove("hidden");
  timerCaptureBtn.disabled = true;
  captureBtn.disabled = true;

  const interval = setInterval(() => {
    seconds -= 1;
    if (seconds > 0) {
      countdownBadge.textContent = seconds;
    } else {
      clearInterval(interval);
      countdownBadge.classList.add("hidden");
      timerCaptureBtn.disabled = false;
      captureBtn.disabled = false;
      takeSnapshot();
    }
  }, 1000);
});

retakePhotoBtn.addEventListener("click", () => {
  personFile = null;
  personInput.value = "";
  updateTryButton();
  photoPreviewWrap.classList.add("hidden");
  if (activeSourceMode === "camera") {
    cameraModeWrap.classList.remove("hidden");
    startCamera(currentFacingMode);
  } else {
    uploadModeWrap.classList.remove("hidden");
  }
});

function updateTryButton() {
  tryButton.disabled = !(personFile && selectedGarment);
}

tryButton.addEventListener("click", async () => {
  if (!personFile || !selectedGarment) return;
  tryButton.disabled = true;
  tryButton.textContent = "Procesando...";
  statusMessage.textContent = "Enviando imágenes al servicio de IA. Esto puede tardar un momento.";
  try {
    let garmentFile;
    if (selectedGarment.file) {
      garmentFile = selectedGarment.file;
    } else {
      const garmentResponse = await fetch(selectedGarment.image);
      if (!garmentResponse.ok) throw new Error("No se pudo cargar la imagen de la prenda del catálogo.");
      const garmentBlob = await garmentResponse.blob();
      garmentFile = new File([garmentBlob], `${selectedGarment.id}.jpg`, { type: garmentBlob.type || "image/jpeg" });
    }
    const form = new FormData();
    form.append("person", personFile);
    form.append("garment", garmentFile);

    const response = await fetch("/api/try-on", { method: "POST", body: form });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || data.error || "No se pudo generar la prueba virtual.");

    currentResultUrl = data.resultUrl;
    resultImage.src = currentResultUrl;
    resultImage.classList.remove("hidden");
    resultPlaceholder.classList.add("hidden");
    downloadButton.disabled = false;
    statusMessage.textContent = "¡Tu resultado está listo!";
  } catch (error) {
    statusMessage.textContent = error.message;
  } finally {
    tryButton.disabled = false;
    tryButton.textContent = "✦ Probar con IA";
    updateTryButton();
  }
});

downloadButton.addEventListener("click", async () => {
  if (!currentResultUrl) return;
  try {
    const response = await fetch(currentResultUrl);
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "mi-look-vestiia.png";
    link.click();
    URL.revokeObjectURL(link.href);
  } catch {
    window.open(currentResultUrl, "_blank", "noopener");
  }
});

document.getElementById("menuToggle").addEventListener("click", () => {
  document.getElementById("nav").classList.toggle("open");
});
document.querySelectorAll("#nav a").forEach(link => link.addEventListener("click", () => document.getElementById("nav").classList.remove("open")));
