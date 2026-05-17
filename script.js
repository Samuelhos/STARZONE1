function whenFirebaseReady(callback){
  if(window.db && window.ref && window.onValue && window.set){
    callback();
  }else{
    window.addEventListener("firebase-ready", callback, { once:true });
  }
}

let bookings = {};
let bookingsRef;
let websiteRef;

const DEFAULT_IMAGES = {
  logo:"",
  hero:"",
  nintendoImage:"",
  playboxImage:""
};

whenFirebaseReady(() => {
  bookingsRef = ref(window.db, "bookings");
  websiteRef = ref(window.db, "websiteData");

  onValue(bookingsRef, (snapshot) => {
    bookings = snapshot.val() || {};
    generateSchedules();
    generateAdminSchedule();
  });

  onValue(websiteRef, (snapshot) => {
    const data = snapshot.val() || {};
    loadWebsiteData(data);
    fillAdminWebsiteForm(data);
  });
});

function generateSchedules(){
  const scheduleContainer = document.getElementById("schedule-list");
  if(!scheduleContainer) return;

  scheduleContainer.innerHTML = "";
  const today = new Date();

  for(let i = 0; i < 30; i++){
    const currentDate = new Date();
    currentDate.setDate(today.getDate() + i);
    const formatted = currentDate.toISOString().split("T")[0];
    const displayDate = currentDate.toLocaleDateString("id-ID", {
      day:"numeric", month:"long", year:"numeric"
    });

    const data = bookings[formatted] || {
      nintendo:"Ready",
      playbox:"Ready"
    };

    const card = document.createElement("div");
    card.classList.add("schedule-card");
    card.innerHTML = `
      <h3>${displayDate}</h3>
      <p>Nintendo OLED : <span class="${data.nintendo === "Ready" ? "available" : "booked"}">${data.nintendo}</span></p>
      <p>Playbox : <span class="${data.playbox === "Ready" ? "available" : "booked"}">${data.playbox}</span></p>
    `;
    scheduleContainer.appendChild(card);
  }
}

function generateAdminSchedule(){
  const adminContainer = document.getElementById("adminScheduleList");
  if(!adminContainer) return;

  adminContainer.innerHTML = "";
  const today = new Date();

  for(let i = 0; i < 30; i++){
    const currentDate = new Date();
    currentDate.setDate(today.getDate() + i);
    const formatted = currentDate.toISOString().split("T")[0];
    const displayDate = currentDate.toLocaleDateString("id-ID", {
      day:"numeric", month:"long", year:"numeric"
    });

    if(!bookings[formatted]){
      bookings[formatted] = {
        nintendo:"Ready",
        playbox:"Ready"
      };
    }

    const card = document.createElement("div");
    card.classList.add("schedule-card");
    card.innerHTML = `
      <h3>${displayDate}</h3>
      <p>Nintendo OLED</p>
      <button class="toggle-btn ${bookings[formatted].nintendo === "Ready" ? "ready" : "booked"}" onclick="toggleStatus('${formatted}','nintendo')">
        ${bookings[formatted].nintendo}
      </button>
      <p>Playbox</p>
      <button class="toggle-btn ${bookings[formatted].playbox === "Ready" ? "ready" : "booked"}" onclick="toggleStatus('${formatted}','playbox')">
        ${bookings[formatted].playbox}
      </button>
    `;
    adminContainer.appendChild(card);
  }
}

function toggleStatus(date, product){
  if(!bookings[date]){
    bookings[date] = { nintendo:"Ready", playbox:"Ready" };
  }

  bookings[date][product] = bookings[date][product] === "Ready" ? "Booked" : "Ready";

  set(bookingsRef, bookings)
    .catch(() => alert("Gagal update jadwal. Cek rules Firebase."));
}

function sendWhatsApp(){
  const nama = document.getElementById("nama").value.trim();
  const nomor = document.getElementById("nomor").value.trim();
  const paket = document.getElementById("paket").value;
  const tanggal = document.getElementById("tanggal").value;
  const durasi = document.getElementById("durasi").value;
  const alamat = document.getElementById("alamat").value.trim();

  if(!nama || !nomor || !paket || !tanggal || !durasi || !alamat){
    alert("Semua data wajib diisi!");
    return;
  }

  const message = `Halo Admin Star Game\n\nSaya ingin booking rental.\n\nNama : ${nama}\nNo WhatsApp : ${nomor}\nPaket : ${paket}\nTanggal Sewa : ${tanggal}\nDurasi : ${durasi}\nAlamat : ${alamat}`;
  const url = `https://wa.me/6287811030777?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

function readFile(file){
  return new Promise((resolve, reject) => {
    if(!file){
      resolve(null);
      return;
    }

    if(file.size > 950000){
      reject(new Error("Ukuran gambar maksimal sekitar 950KB. Kompres dulu gambarnya."));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error("Gagal membaca gambar."));
    reader.readAsDataURL(file);
  });
}

async function saveWebsiteData(){
  try{
    const oldSnapshot = await get(websiteRef);
    const oldData = oldSnapshot.val() || {};

    const logoFile = document.getElementById("logoInput").files[0];
    const heroFile = document.getElementById("heroInput").files[0];
    const nintendoFile = document.getElementById("nintendoImage").files[0];
    const playboxFile = document.getElementById("playboxImage").files[0];

    const [logo, hero, nintendoImage, playboxImage] = await Promise.all([
      readFile(logoFile),
      readFile(heroFile),
      readFile(nintendoFile),
      readFile(playboxFile)
    ]);

    const data = {
      ...oldData,
      nintendoPrice: document.getElementById("nintendoPrice").value.trim() || oldData.nintendoPrice || "80.000",
      playboxPrice: document.getElementById("playboxPrice").value.trim() || oldData.playboxPrice || "70.000"
    };

    if(logo) data.logo = logo;
    if(hero) data.hero = hero;
    if(nintendoImage) data.nintendoImage = nintendoImage;
    if(playboxImage) data.playboxImage = playboxImage;

    await set(websiteRef, data);
    alert("Website berhasil diupdate realtime!");
  }catch(error){
    alert(error.message || "Gagal simpan website. Cek koneksi/Firebase rules.");
  }
}

function loadWebsiteData(data){
  const logo = document.getElementById("websiteLogo");
  if(logo && data.logo){ logo.src = data.logo; }

  const hero = document.getElementById("heroBanner");
  if(hero){ hero.src = data.hero || data.nintendoImage || DEFAULT_IMAGES.hero; }

  const nintendoImg = document.getElementById("nintendoImg");
  if(nintendoImg && data.nintendoImage){ nintendoImg.src = data.nintendoImage; }

  const playboxImg = document.getElementById("playboxImg");
  if(playboxImg && data.playboxImage){ playboxImg.src = data.playboxImage; }

  const nintendoPrice = document.getElementById("nintendoPriceText");
  if(nintendoPrice && data.nintendoPrice){ nintendoPrice.innerHTML = `Rp ${data.nintendoPrice} / hari`; }

  const playboxPrice = document.getElementById("playboxPriceText");
  if(playboxPrice && data.playboxPrice){ playboxPrice.innerHTML = `Rp ${data.playboxPrice} / hari`; }
}

function fillAdminWebsiteForm(data){
  const nintendoPriceInput = document.getElementById("nintendoPrice");
  const playboxPriceInput = document.getElementById("playboxPrice");

  if(nintendoPriceInput && data.nintendoPrice){
    nintendoPriceInput.value = data.nintendoPrice;
  }
  if(playboxPriceInput && data.playboxPrice){
    playboxPriceInput.value = data.playboxPrice;
  }
}
