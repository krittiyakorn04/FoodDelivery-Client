import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Navigation,
  Store,
  Check,
} from "lucide-react";

import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import usefoodDelivery from "../../globalState/fooddeliveryStore";

// =============================================================
// FIX LEAFLET MARKER ICON
// =============================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// =============================================================
// DEFAULT LOCATION
// =============================================================

const DEFAULT_LAT = 16.2465;
const DEFAULT_LNG = 103.2505;

const MAX_CATEGORY = 3;
const INITIAL_CATEGORY_LIMIT = 6;

// =============================================================
// ALERT
// =============================================================

const showAlert = (icon, title, text = "") =>
  Swal.fire({
    icon,
    title,
    ...(text ? { text } : {}),
    confirmButtonText: "ตกลง",
    confirmButtonColor: "#f97316",
  });

// =============================================================
// PASSWORD VALIDATION
// =============================================================

const isValidPassword = (password) =>
  password.length >= 8 &&
  password.length <= 64 &&
  !/\s/.test(password) &&
  /[a-z]/.test(password) &&
  /[A-Z]/.test(password) &&
  /[0-9]/.test(password) &&
  /[^A-Za-z0-9\s]/.test(password);

// =============================================================
// MAP CONTROLLER
// =============================================================

const MapController = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (!position) return;

    map.setView([position.lat, position.lng], 17, {
      animate: true,
    });
  }, [position, map]);

  return null;
};

// =============================================================
// STORE REGISTER
// =============================================================

const StoreRegister = () => {
  const navigate = useNavigate();

  const storeCategory = usefoodDelivery((state) => state.storeCategory);
  const getStoreCategory = usefoodDelivery((state) => state.getStoreCategory);
  const actionRegisterStore = usefoodDelivery(
    (state) => state.actionRegisterStore,
  );

  const [page, setPage] = useState(1);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    phone: "",
    storeName: "",
    address: "",
    storeCategoryIds: [],
    dayOpen: "",
    timeOpen: "",
    timeClose: "",
    openAuto: false,
    Notice: "",
    lat: null,
    lng: null,
  });

  const [locationFound, setLocationFound] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [markerPosition, setMarkerPosition] = useState(null);

  useEffect(() => {
    getStoreCategory();
  }, [getStoreCategory]);

  // ===========================================================
  // HANDLE INPUT
  // ===========================================================

  const handleOnChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ===========================================================
  // CATEGORY
  // ===========================================================

  const handleCategoryChange = async (categoryId) => {
    const id = Number(categoryId);
    const exists = form.storeCategoryIds.includes(id);

    if (exists) {
      setForm((prev) => ({
        ...prev,
        storeCategoryIds: prev.storeCategoryIds.filter((item) => item !== id),
      }));
      return;
    }

    if (form.storeCategoryIds.length >= MAX_CATEGORY) {
      await showAlert(
        "warning",
        `เลือกประเภทร้านอาหารได้สูงสุด ${MAX_CATEGORY} ประเภท`,
      );
      return;
    }

    setForm((prev) => ({
      ...prev,
      storeCategoryIds: [...prev.storeCategoryIds, id],
    }));
  };

  const visibleCategories = useMemo(() => {
    if (showAllCategories) return storeCategory || [];

    return (storeCategory || []).slice(0, INITIAL_CATEGORY_LIMIT);
  }, [storeCategory, showAllCategories]);

  const hasMoreCategories =
    (storeCategory || []).length > INITIAL_CATEGORY_LIMIT;

  // ===========================================================
  // NEXT PAGE
  // ===========================================================

  const handleNext = async (e) => {
    e.preventDefault();

    if (!form.username.trim()) {
      await showAlert("warning", "กรุณากรอกชื่อผู้ใช้งาน");
      return;
    }

    if (!isValidPassword(form.password)) {
      await showAlert(
        "warning",
        "รหัสผ่านไม่ตรงตามเงื่อนไข",
        "ต้องมี 8-64 ตัวอักษร ประกอบด้วยตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ ตัวเลข และอักขระพิเศษ โดยไม่มีช่องว่าง",
      );
      return;
    }

    if (!form.confirmPassword) {
      await showAlert("warning", "กรุณายืนยันรหัสผ่าน");
      return;
    }

    if (form.password !== form.confirmPassword) {
      await showAlert("warning", "รหัสผ่านไม่ตรงกัน");
      return;
    }

    setPage(2);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ===========================================================
  // BACK
  // ===========================================================

  const handleBack = () => {
    setPage(1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ===========================================================
  // FIND LOCATION
  // ===========================================================

  const handleFindLocation = () => {
    if (!navigator.geolocation) {
      showAlert("error", "เบราว์เซอร์นี้ไม่รองรับการค้นหาตำแหน่ง");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const newPosition = { lat, lng };

        setMarkerPosition(newPosition);

        setForm((prev) => ({
          ...prev,
          lat,
          lng,
        }));

        setLocationFound(true);
        setLocationLoading(false);

        showAlert(
          "success",
          "ค้นหาพิกัดสำเร็จ",
          "สามารถลากหมุดเพื่อปรับตำแหน่งร้านได้",
        );
      },
      (error) => {
        console.error("LOCATION ERROR:", error);
        setLocationLoading(false);

        if (error.code === error.PERMISSION_DENIED) {
          showAlert("warning", "กรุณาอนุญาตให้เว็บไซต์เข้าถึงตำแหน่งของคุณ");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          showAlert("error", "ไม่สามารถระบุตำแหน่งได้");
        } else if (error.code === error.TIMEOUT) {
          showAlert("warning", "ค้นหาพิกัดหมดเวลา กรุณาลองใหม่");
        } else {
          showAlert("error", "ค้นหาพิกัดไม่สำเร็จ");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  };

  // ===========================================================
  // DRAG MARKER
  // ===========================================================

  const handleMarkerDragEnd = (event) => {
    if (!locationFound) return;

    const position = event.target.getLatLng();
    const lat = position.lat;
    const lng = position.lng;

    setMarkerPosition({ lat, lng });

    setForm((prev) => ({
      ...prev,
      lat,
      lng,
    }));
  };

  // ===========================================================
  // SUBMIT
  // ===========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username.trim()) {
      await showAlert("warning", "กรุณากรอกชื่อผู้ใช้งาน");
      setPage(1);
      return;
    }

    if (!isValidPassword(form.password)) {
      await showAlert(
        "warning",
        "รหัสผ่านไม่ตรงตามเงื่อนไข",
        "ต้องมี 8-64 ตัวอักษร ประกอบด้วยตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ ตัวเลข และอักขระพิเศษ โดยไม่มีช่องว่าง",
      );
      setPage(1);
      return;
    }

    if (form.password !== form.confirmPassword) {
      await showAlert("warning", "รหัสผ่านไม่ตรงกัน");
      setPage(1);
      return;
    }

    if (!form.storeName.trim()) {
      await showAlert("warning", "กรุณากรอกชื่อร้านอาหาร");
      return;
    }

    if (form.storeCategoryIds.length === 0) {
      await showAlert("warning", "กรุณาเลือกประเภทร้านอย่างน้อย 1 ประเภท");
      return;
    }

    if (form.storeCategoryIds.length > MAX_CATEGORY) {
      await showAlert(
        "warning",
        `เลือกประเภทร้านอาหารได้สูงสุด ${MAX_CATEGORY} ประเภท`,
      );
      return;
    }

    if (!/^0\d{9}$/.test(form.phone)) {
      await showAlert(
        "warning",
        "เบอร์โทรศัพท์ไม่ถูกต้อง",
        "กรุณากรอกเบอร์โทรศัพท์ 10 หลัก และขึ้นต้นด้วย 0",
      );
      return;
    }

    if (!form.address.trim()) {
      await showAlert("warning", "กรุณากรอกรายละเอียดที่อยู่ร้าน");
      return;
    }

    if (
      !locationFound ||
      form.lat == null ||
      form.lng == null ||
      !Number.isFinite(Number(form.lat)) ||
      !Number.isFinite(Number(form.lng))
    ) {
      await showAlert("warning", "กรุณาค้นหาพิกัดร้านก่อนสมัคร");
      return;
    }

    const data = {
      username: form.username.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      phone: form.phone,
      storeName: form.storeName.trim(),
      address: form.address.trim(),
      storeCategoryIds: form.storeCategoryIds,
      dayOpen: form.dayOpen,
      timeOpen: form.timeOpen,
      timeClose: form.timeClose,
      openAuto: form.openAuto,
      Notice: form.Notice,
      lat: Number(form.lat),
      lng: Number(form.lng),
    };

    try {
      const res = await actionRegisterStore(data);
      const role = res?.data?.payload?.role;

      await showAlert(
        "success",
        "สมัครร้านอาหารสำเร็จ",
        "กำลังเข้าสู่หน้าร้าน",
      );

      if (role === "MERCHANT") {
        navigate("/store/store");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("REGISTER STORE ERROR:", error);

      const message = error.response?.data?.message || "สมัครร้านไม่สำเร็จ";

      await showAlert("error", "สมัครร้านไม่สำเร็จ", message);
    }
  };

  // ===========================================================
  // PASSWORD REQUIREMENTS
  // ===========================================================

  const passwordRequirements = [
    {
      label: "ความยาว 8-64 ตัวอักษร",
      valid: form.password.length >= 8 && form.password.length <= 64,
    },
    {
      label: "มีตัวอักษรภาษาอังกฤษตัวพิมพ์เล็ก (a-z)",
      valid: /[a-z]/.test(form.password),
    },
    {
      label: "มีตัวอักษรภาษาอังกฤษตัวพิมพ์ใหญ่ (A-Z)",
      valid: /[A-Z]/.test(form.password),
    },
    {
      label: "มีตัวเลขอย่างน้อย 1 ตัว",
      valid: /[0-9]/.test(form.password),
    },
    {
      label: "มีอักขระพิเศษ เช่น @ หรือ !",
      valid: /[^A-Za-z0-9\s]/.test(form.password),
    },
    {
      label: "ไม่มีช่องว่าง",
      valid: form.password.length > 0 && !/\s/.test(form.password),
    },
  ];

  // ===========================================================
  // RENDER
  // ===========================================================

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* PROGRESS */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                page >= 1
                  ? "bg-orange-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {page > 1 ? <Check size={18} /> : "1"}
            </div>

            <div
              className={`w-16 h-1 rounded-full ${
                page >= 2 ? "bg-orange-500" : "bg-gray-200"
              }`}
            />

            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                page >= 2
                  ? "bg-orange-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              2
            </div>
          </div>

          <div className="flex justify-center gap-16 mt-2">
            <span className="text-xs text-gray-500">บัญชีผู้ใช้</span>
            <span className="text-xs text-gray-500">ข้อมูลร้าน</span>
          </div>
        </div>

        {/* CARD */}
        <div className="bg-white rounded-3xl border border-orange-100 shadow-[0_20px_50px_-20px_rgba(42,27,18,0.25)] p-6 md:p-8">
          {/* PAGE 1 */}
          {page === 1 && (
            <form onSubmit={handleNext}>
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                    <Store className="text-orange-500" />
                  </div>

                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                      สร้างบัญชีร้านอาหาร
                    </h1>
                    <p className="text-gray-500 mt-1">ขั้นตอนที่ 1 จาก 2</p>
                  </div>
                </div>

                <p className="text-gray-500 mt-4">
                  สร้างบัญชีสำหรับเข้าสู่ระบบจัดการร้าน
                </p>
              </div>

              {/* USERNAME */}
              <div className="mb-5">
                <label className="text-sm text-gray-600 mb-2 block">
                  ชื่อผู้ใช้งาน
                </label>

                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleOnChange}
                  placeholder="username"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              {/* EMAIL */}
              <div className="mb-5">
                <label className="text-sm text-gray-600 mb-2 block">
                  อีเมล
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleOnChange}
                  placeholder="example@email.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              {/* PASSWORD */}
              <div className="mb-5">
                <label className="text-sm text-gray-600 mb-2 block">
                  รหัสผ่าน
                </label>

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleOnChange}
                  placeholder="********"
                  required
                  maxLength={64}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />

                <div className="mt-2 space-y-1 text-xs">
                  {passwordRequirements.map((item) => (
                    <p
                      key={item.label}
                      className={
                        item.valid ? "text-green-600" : "text-gray-500"
                      }
                    >
                      {item.valid ? "✓" : "○"} {item.label}
                    </p>
                  ))}
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="mb-8">
                <label className="text-sm text-gray-600 mb-2 block">
                  ยืนยันรหัสผ่าน
                </label>

                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleOnChange}
                  placeholder="********"
                  required
                  maxLength={64}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-orange-500 py-3 text-white font-semibold hover:bg-orange-600 transition flex items-center justify-center gap-2"
              >
                ถัดไป
                <ArrowRight size={18} />
              </button>

              <p className="text-center mt-6 text-gray-500">
                มีบัญชีร้านอยู่แล้ว?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/store/login")}
                  className="text-orange-500 font-semibold hover:text-orange-600"
                >
                  เข้าสู่ระบบ
                </button>
              </p>
            </form>
          )}

          {/* PAGE 2 */}
          {page === 2 && (
            <form onSubmit={handleSubmit}>
              <div className="mb-8">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-orange-100 transition"
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                      ข้อมูลร้านอาหาร
                    </h1>
                    <p className="text-gray-500 mt-1">ขั้นตอนที่ 2 จาก 2</p>
                  </div>
                </div>
              </div>

              {/* STORE NAME */}
              <div className="mb-5">
                <label className="text-sm text-gray-600 mb-2 block">
                  ชื่อร้านอาหาร
                </label>

                <input
                  type="text"
                  name="storeName"
                  value={form.storeName}
                  onChange={handleOnChange}
                  placeholder="เช่น ครัวอิ่มสุข"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              {/* CATEGORY */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-600">
                    ประเภทร้านอาหาร
                  </label>
                  <span className="text-xs text-gray-400">
                    เลือกได้สูงสุด {MAX_CATEGORY} ประเภท
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(storeCategory || []).length === 0 ? (
                    <div className="col-span-full text-center text-sm text-gray-400 py-5 border rounded-xl bg-gray-50">
                      กำลังโหลดประเภทอาหาร...
                    </div>
                  ) : (
                    visibleCategories.map((category) => {
                      const id = Number(category.id);
                      const checked = form.storeCategoryIds.includes(id);
                      const disabled =
                        form.storeCategoryIds.length >= MAX_CATEGORY &&
                        !checked;

                      return (
                        <label
                          key={category.id}
                          className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition ${
                            disabled
                              ? "border-gray-200 bg-gray-100 cursor-not-allowed opacity-50"
                              : "cursor-pointer"
                          } ${
                            checked
                              ? "border-orange-400 bg-orange-50"
                              : !disabled
                                ? "border-gray-200 bg-gray-50 hover:border-orange-300"
                                : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={disabled}
                            onChange={() => handleCategoryChange(category.id)}
                            className="w-4 h-4 accent-orange-500"
                          />

                          <span
                            className={
                              checked
                                ? "text-orange-600 font-semibold"
                                : "text-gray-700"
                            }
                          >
                            {category.name}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>

                {hasMoreCategories && (
                  <button
                    type="button"
                    onClick={() => setShowAllCategories((prev) => !prev)}
                    className="w-full mt-3 py-2.5 rounded-xl border border-orange-200 bg-orange-50 text-orange-600 text-sm font-semibold hover:bg-orange-100 transition"
                  >
                    {showAllCategories
                      ? "แสดงน้อยลง"
                      : `แสดงเพิ่มเติม (${
                          storeCategory.length - INITIAL_CATEGORY_LIMIT
                        } ประเภท)`}
                  </button>
                )}

                {form.storeCategoryIds.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2">
                      เลือกแล้ว{" "}
                      <span className="font-semibold text-orange-500">
                        {form.storeCategoryIds.length}
                      </span>{" "}
                      / {MAX_CATEGORY} ประเภท
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {form.storeCategoryIds.map((id) => {
                        const category = (storeCategory || []).find(
                          (item) => Number(item.id) === Number(id),
                        );

                        return (
                          <span
                            key={id}
                            className="px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs font-medium"
                          >
                            {category?.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* PHONE */}
              <div className="mb-6">
                <label className="text-sm text-gray-600 mb-2 block">
                  เบอร์โทรศัพท์
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={(e) => {
                    const phone = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);

                    setForm((prev) => ({
                      ...prev,
                      phone,
                    }));
                  }}
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="0891234567"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />

                {form.phone.length > 0 && form.phone.length < 10 && (
                  <p className="mt-1 text-xs text-red-500">
                    กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก
                  </p>
                )}
              </div>

              {/* LOCATION */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-600 font-medium">
                    ตำแหน่งร้าน
                  </label>

                  {locationFound && (
                    <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                      <Check size={14} />
                      พบพิกัดแล้ว
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleFindLocation}
                  disabled={locationLoading}
                  className="w-full mb-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white py-3 font-semibold flex items-center justify-center gap-2 transition"
                >
                  {locationLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      กำลังค้นหาพิกัด...
                    </>
                  ) : (
                    <>
                      <Navigation size={18} />
                      {locationFound ? "ค้นหาพิกัดใหม่" : "ค้นหาพิกัดของฉัน"}
                    </>
                  )}
                </button>

                <div className="relative overflow-hidden rounded-2xl border border-orange-100 h-[350px]">
                  <MapContainer
                    center={[DEFAULT_LAT, DEFAULT_LNG]}
                    zoom={13}
                    scrollWheelZoom
                    className="w-full h-full"
                  >
                    <TileLayer
                      attribution="&copy; OpenStreetMap contributors"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {markerPosition && (
                      <>
                        <MapController position={markerPosition} />
                        <Marker
                          position={[markerPosition.lat, markerPosition.lng]}
                          draggable={locationFound}
                          eventHandlers={{
                            dragend: handleMarkerDragEnd,
                          }}
                        />
                      </>
                    )}
                  </MapContainer>

                  {!locationFound && (
                    <div className="absolute inset-0 z-[500] bg-white/60 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                      <div className="bg-white rounded-2xl shadow-lg border border-orange-100 px-5 py-4 text-center">
                        <MapPin
                          className="mx-auto text-orange-500 mb-2"
                          size={28}
                        />
                        <p className="font-semibold text-gray-800">
                          กรุณาค้นหาพิกัดก่อน
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          เมื่อพบพิกัดแล้ว สามารถลากหมุดเพื่อปรับตำแหน่งได้
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {locationFound && form.lat != null && form.lng != null && (
                  <div className="mt-3 rounded-xl bg-green-50 border border-green-200 p-3">
                    <div className="flex items-start gap-2">
                      <MapPin
                        size={18}
                        className="text-green-600 mt-0.5 shrink-0"
                      />

                      <div>
                        <p className="text-sm font-semibold text-green-700">
                          ตำแหน่งร้าน
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          ละติจูด: {Number(form.lat).toFixed(6)}
                        </p>
                        <p className="text-xs text-gray-600">
                          ลองจิจูด: {Number(form.lng).toFixed(6)}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          สามารถลากหมุดบนแผนที่เพื่อปรับตำแหน่งได้
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ADDRESS */}
              <div className="mb-6">
                <label className="text-sm text-gray-600 mb-2 block">
                  รายละเอียดที่อยู่ร้าน
                </label>

                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleOnChange}
                  placeholder="เช่น บ้านเลขที่ อาคาร ถนน หรือจุดสังเกตใกล้ร้าน"
                  rows={3}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                />

                <p className="text-xs text-gray-400 mt-2">
                  ใช้แผนที่ระบุตำแหน่งร้าน
                  และกรอกรายละเอียดเพิ่มเติมได้ที่ช่องนี้
                </p>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={!locationFound}
                className="w-full rounded-xl bg-orange-500 py-3 text-white font-semibold hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                <Check size={18} />
                สมัครร้านอาหาร
              </button>

              {!locationFound && (
                <p className="text-center text-xs text-red-500 mt-3">
                  กรุณากด “ค้นหาพิกัดของฉัน” ก่อนสมัครร้าน
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreRegister;
