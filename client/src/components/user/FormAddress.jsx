import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Home,
  Navigation,
  Check,
  Star,
  Map,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  LocateFixed,
} from "lucide-react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

import usefoodDelivery from "../../globalState/fooddeliveryStore";

import {
  createAddress,
  getAddress,
  updateAddress,
  removeAddress,
} from "../../api/UserProfile";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

const LocationMarker = ({ setForm }) => {
  useMapEvents({
    click(e) {
      const lat = Number(e.latlng.lat.toFixed(6));
      const lng = Number(e.latlng.lng.toFixed(6));

      setForm((prev) => ({
        ...prev,
        lat,
        lng,
      }));
    },
  });

  return null;
};

const DraggableMarker = ({ form, setForm }) => {
  const position = [Number(form.lat), Number(form.lng)];

  return (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const position = marker.getLatLng();

          setForm((prev) => ({
            ...prev,
            lat: Number(position.lat.toFixed(6)),
            lng: Number(position.lng.toFixed(6)),
          }));
        },
      }}
    />
  );
};

const FormAddAddress = () => {
  const navigate = useNavigate();

  const token = usefoodDelivery((state) => state.token);

  const [form, setForm] = useState({
    label: "",
    address: "",
    lat: "",
    lng: "",
    isDefault: false,
  });

  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [editingId, setEditingId] = useState(null);

  // =========================
  // LOAD ADDRESS
  // =========================

  useEffect(() => {
    if (token) {
      loadAddresses();
    }
  }, [token]);

  const loadAddresses = async () => {
    try {
      setLoadingAddress(true);

      const res = await getAddress(token);

      setAddresses(res.data);
    } catch (error) {
      console.log("โหลดที่อยู่ไม่สำเร็จ =", error);
    } finally {
      setLoadingAddress(false);
    }
  };

  // =========================
  // GPS
  // =========================

  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      Swal.fire({
        icon: "error",
        title: "ไม่รองรับ GPS",
        text: "เบราว์เซอร์นี้ไม่รองรับการเข้าถึงตำแหน่ง",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#f97316",
      });

      return;
    }

    // =========================
    // LOADING
    // =========================

    Swal.fire({
      title: "กำลังค้นหาตำแหน่ง",
      text: "กรุณารอสักครู่...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setForm((prev) => ({
          ...prev,
          lat: latitude.toFixed(6),
          lng: longitude.toFixed(6),
        }));

        // =========================
        // SUCCESS
        // =========================

        Swal.fire({
          icon: "success",
          title: "พบตำแหน่งแล้ว",
          text: "ระบบได้รับตำแหน่งของคุณเรียบร้อยแล้ว",
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#f97316",
        });
      },

      (error) => {
        console.log("GPS error =", error);

        let title = "ไม่สามารถเข้าถึงตำแหน่งได้";
        let text = "ไม่สามารถดึงตำแหน่ง GPS ได้";

        if (error.code === 1) {
          title = "ไม่ได้รับอนุญาตให้เข้าถึงตำแหน่ง";
          text =
            "กรุณาอนุญาตให้เว็บไซต์เข้าถึงตำแหน่งของคุณในการตั้งค่าเบราว์เซอร์";
        } else if (error.code === 2) {
          title = "ไม่พบตำแหน่ง";
          text = "ไม่สามารถระบุตำแหน่งของคุณได้ กรุณาลองใหม่อีกครั้ง";
        } else if (error.code === 3) {
          title = "ค้นหาตำแหน่งหมดเวลา";
          text = "การค้นหาตำแหน่งใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง";
        }

        Swal.fire({
          icon: "warning",
          title,
          text,
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#f97316",
        });
      },
    );
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: "ลบที่อยู่?",
      text: `คุณต้องการลบ "${item.label}" ใช่หรือไม่`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#9ca3af",
      reverseButtons:true
    });

    if (!result.isConfirmed) return;

    try {
      await removeAddress(token, item.id);

      toast.success("ลบที่อยู่สำเร็จ");

      if (editingId === item.id) {
        handleCancelEdit();
      }

      await loadAddresses();
    } catch (error) {
      console.log("ลบที่อยู่ไม่สำเร็จ =", error);

      toast.error(error.response?.data?.message || "ลบที่อยู่ไม่สำเร็จ");
    }
  };

  // =========================
  // CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =========================
  // EDIT
  // =========================

  const handleEdit = (item) => {
    setEditingId(item.id);

    setForm({
      label: item.label || "",
      address: item.address || "",
      lat: item.lat ?? "",
      lng: item.lng ?? "",
      isDefault: item.isDefault || false,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.label.trim()) {
      toast.error("กรุณาระบุชื่อที่อยู่");
      return;
    }

    if (!form.address.trim()) {
      toast.error("กรุณากรอกที่อยู่");
      return;
    }

    try {
      setLoading(true);

      const data = {
        label: form.label.trim(),
        address: form.address.trim(),
        lat: form.lat === "" ? null : Number(form.lat),
        lng: form.lng === "" ? null : Number(form.lng),
        isDefault: form.isDefault,
      };

      if (editingId) {
        await updateAddress(token, editingId, data);
        toast.success("แก้ไขที่อยู่สำเร็จ");
      } else {
        await createAddress(token, data);
        toast.success("เพิ่มที่อยู่สำเร็จ");
      }

      resetForm();
      await loadAddresses();
    } catch (error) {
      console.log("บันทึกที่อยู่ไม่สำเร็จ =", error);

      toast.error(error.response?.data?.message || "บันทึกที่อยู่ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RESET
  // =========================

  const resetForm = () => {
    setForm({
      label: "",
      address: "",
      lat: "",
      lng: "",
      isDefault: false,
    });

    setEditingId(null);
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  // =========================
  // LOCATION
  // =========================

  const hasLocation =
    form.lat !== "" &&
    form.lng !== "" &&
    !Number.isNaN(Number(form.lat)) &&
    !Number.isNaN(Number(form.lng));

  // =========================
  // UI
  // =========================

  return (
    <div className="min-h-screen bg-[#FFF8F0] px-4 py-6 pb-24 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* =========================
            PAGE HEADER
        ========================= */}

        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="
              w-10 h-10
              rounded-xl
              bg-white
              border border-orange-100
              text-gray-500
              flex items-center justify-center
              hover:bg-orange-50
              hover:text-orange-500
              transition
              shrink-0
            "
          >
            <ChevronLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-[#2A1B12]">
              {editingId ? "แก้ไขที่อยู่" : "ที่อยู่จัดส่ง"}
            </h1>

            <p className="text-sm text-[#9A806D] mt-1">
              จัดการที่อยู่สำหรับการสั่งอาหาร
            </p>
          </div>
        </div>

        {/* =========================
            FORM CARD
        ========================= */}

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-3xl border border-orange-100 shadow-sm overflow-hidden">
            {/* FORM HEADER */}

            <div className="px-5 sm:px-7 py-5 bg-gradient-to-r from-orange-50 to-white border-b border-orange-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-orange-100 flex items-center justify-center">
                  {editingId ? (
                    <Pencil size={20} className="text-orange-500" />
                  ) : (
                    <Plus size={21} className="text-orange-500" />
                  )}
                </div>

                <div>
                  <h2 className="font-bold text-[#2A1B12]">
                    {editingId ? "แก้ไขข้อมูลที่อยู่" : "เพิ่มที่อยู่ใหม่"}
                  </h2>

                  <p className="text-xs text-gray-400 mt-1">
                    กรอกข้อมูลให้ครบเพื่อใช้ในการจัดส่ง
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-7 space-y-7">
              {/* =========================
                  LABEL
              ========================= */}

              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  ชื่อที่อยู่
                </label>

                <p className="text-xs text-gray-400 mb-3">
                  เลือกชื่อที่จำง่าย หรือกำหนดชื่อเอง
                </p>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  {["บ้าน", "หอพัก", "ที่ทำงาน"].map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          label: item,
                        }))
                      }
                      className={`
                        py-2.5
                        rounded-xl
                        border
                        text-sm
                        font-semibold
                        transition
                        ${
                          form.label === item
                            ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                            : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                        }
                      `}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  name="label"
                  value={form.label}
                  onChange={handleChange}
                  placeholder="เช่น หอพัก A"
                  className="
                    w-full
                    border border-gray-200
                    rounded-xl
                    px-4 py-3
                    outline-none
                    bg-gray-50
                    focus:bg-white
                    focus:border-orange-300
                    focus:ring-2
                    focus:ring-orange-100
                    transition
                  "
                />
              </div>

              {/* =========================
                  ADDRESS
              ========================= */}

              <div>
                <label className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
                  <Home size={17} className="text-orange-500" />
                  รายละเอียดที่อยู่
                </label>

                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="บ้านเลขที่ / หอพัก / ห้อง / ถนน / ตำบล / อำเภอ / จังหวัด"
                  rows={4}
                  className="
                    w-full
                    border border-gray-200
                    rounded-2xl
                    px-4 py-3
                    outline-none
                    resize-none
                    bg-gray-50
                    focus:bg-white
                    focus:border-orange-300
                    focus:ring-2
                    focus:ring-orange-100
                    transition
                  "
                />
              </div>

              {/* =========================
                  LOCATION
              ========================= */}

              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <label className="flex items-center gap-2 font-semibold text-gray-700">
                      <Navigation size={17} className="text-orange-500" />
                      ตำแหน่งจัดส่ง
                    </label>

                    <p className="text-xs text-gray-400 mt-1">
                      ใช้ GPS หรือเลือกตำแหน่งจากแผนที่
                    </p>
                  </div>

                  {hasLocation && (
                    <span className="hidden sm:flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                      <Check size={13} />
                      มีตำแหน่งแล้ว
                    </span>
                  )}
                </div>

                {/* GPS BUTTON */}

                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  className="
                    w-full
                    flex items-center justify-center gap-2
                    py-3
                    rounded-xl
                    bg-orange-500
                    hover:bg-orange-600
                    text-white
                    font-semibold
                    shadow-sm
                    transition
                  "
                >
                  <LocateFixed size={18} />
                  ใช้ตำแหน่งปัจจุบัน
                </button>

                {/* COORDINATES */}

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500">
                      Latitude
                    </label>

                    <input
                      type="number"
                      step="any"
                      name="lat"
                      value={form.lat}
                      onChange={handleChange}
                      placeholder="16.245000"
                      className="
                        mt-1
                        w-full
                        border border-gray-200
                        rounded-xl
                        px-3 py-3
                        bg-gray-50
                        outline-none
                        focus:bg-white
                        focus:border-orange-300
                        focus:ring-2
                        focus:ring-orange-100
                      "
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500">
                      Longitude
                    </label>

                    <input
                      type="number"
                      step="any"
                      name="lng"
                      value={form.lng}
                      onChange={handleChange}
                      placeholder="103.250000"
                      className="
                        mt-1
                        w-full
                        border border-gray-200
                        rounded-xl
                        px-3 py-3
                        bg-gray-50
                        outline-none
                        focus:bg-white
                        focus:border-orange-300
                        focus:ring-2
                        focus:ring-orange-100
                      "
                    />
                  </div>
                </div>

                {/* MAP */}

                <div className="mt-4 rounded-2xl overflow-hidden border border-orange-100">
                  {hasLocation ? (
                    <MapContainer
                      center={[Number(form.lat), Number(form.lng)]}
                      zoom={16}
                      scrollWheelZoom={true}
                      className="h-[320px] w-full"
                    >
                      <TileLayer
                        attribution="&copy; OpenStreetMap"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />

                      <LocationMarker setForm={setForm} />

                      <DraggableMarker form={form} setForm={setForm} />
                    </MapContainer>
                  ) : (
                    <div className="h-[280px] bg-gray-50 flex flex-col items-center justify-center text-center px-5">
                      <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                        <MapPin size={30} className="text-orange-300" />
                      </div>

                      <p className="font-semibold text-gray-500">
                        ยังไม่ได้เลือกตำแหน่ง
                      </p>

                      <p className="text-xs text-gray-400 mt-2 max-w-xs">
                        กดปุ่มใช้ตำแหน่งปัจจุบัน
                        หรือกดบนแผนที่เพื่อเลือกจุดจัดส่ง
                      </p>
                    </div>
                  )}
                </div>

                {hasLocation && (
                  <p className="text-xs text-gray-400 mt-2">
                    💡 สามารถลากหมุด
                    หรือกดตำแหน่งอื่นบนแผนที่เพื่อเปลี่ยนจุดจัดส่งได้
                  </p>
                )}
              </div>

              {/* =========================
                  DEFAULT
              ========================= */}

              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    isDefault: !prev.isDefault,
                  }))
                }
                className={`
                  w-full
                  flex items-center justify-between
                  gap-4
                  p-4
                  rounded-2xl
                  border
                  transition
                  ${
                    form.isDefault
                      ? "border-orange-300 bg-orange-50"
                      : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                  }
                `}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`
                      w-11 h-11
                      rounded-xl
                      flex items-center justify-center
                      shrink-0
                      ${
                        form.isDefault
                          ? "bg-orange-500 text-white"
                          : "bg-white text-gray-400"
                      }
                    `}
                  >
                    <Star
                      size={19}
                      fill={form.isDefault ? "currentColor" : "none"}
                    />
                  </div>

                  <div className="text-left min-w-0">
                    <p className="font-semibold text-gray-700">
                      ตั้งเป็นที่อยู่เริ่มต้น
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      ใช้ที่อยู่นี้อัตโนมัติเมื่อสั่งอาหาร
                    </p>
                  </div>
                </div>

                <div
                  className={`
                    w-11 h-6
                    rounded-full
                    p-1
                    transition
                    shrink-0
                    ${form.isDefault ? "bg-orange-500" : "bg-gray-300"}
                  `}
                >
                  <div
                    className={`
                      w-4 h-4
                      bg-white
                      rounded-full
                      transition
                      ${form.isDefault ? "translate-x-5" : "translate-x-0"}
                    `}
                  />
                </div>
              </button>

              {/* =========================
                  ACTION
              ========================= */}

              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full
                    bg-orange-500
                    hover:bg-orange-600
                    disabled:bg-gray-300
                    text-white
                    py-3.5
                    rounded-xl
                    font-bold
                    shadow-sm
                    transition
                  "
                >
                  {loading
                    ? "กำลังบันทึก..."
                    : editingId
                      ? "บันทึกการแก้ไข"
                      : "บันทึกที่อยู่"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="
                      w-full
                      border border-gray-200
                      text-gray-600
                      bg-white
                      py-3
                      rounded-xl
                      font-semibold
                      hover:bg-gray-50
                      transition
                    "
                  >
                    ยกเลิกการแก้ไข
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* =========================
            SAVED ADDRESSES
        ========================= */}

        <div className="mt-7">
          <div className="flex items-end justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-bold text-[#2A1B12]">
                ที่อยู่ของฉัน
              </h2>

              <p className="text-sm text-[#9A806D] mt-1">
                ที่อยู่ที่บันทึกไว้สำหรับจัดส่งอาหาร
              </p>
            </div>

            <span className="text-xs font-semibold bg-white border border-orange-100 text-orange-500 px-3 py-1.5 rounded-full shrink-0">
              {addresses.length} รายการ
            </span>
          </div>

          {loadingAddress ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="bg-white rounded-2xl border border-orange-100 p-5"
                >
                  <div className="flex gap-3">
                    <div className="w-11 h-11 rounded-xl bg-orange-100 shrink-0" />

                    <div className="flex-1 space-y-3">
                      <div className="h-4 w-28 rounded bg-gray-200" />
                      <div className="h-3 w-full rounded bg-gray-100" />
                      <div className="h-3 w-4/5 rounded bg-gray-100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : addresses.length === 0 ? (
            <div className="bg-white rounded-3xl border border-orange-100 p-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-50 flex items-center justify-center">
                <MapPin size={30} className="text-orange-300" />
              </div>

              <p className="font-bold text-[#2A1B12] mt-4">ยังไม่มีที่อยู่</p>

              <p className="text-sm text-gray-400 mt-1">
                เพิ่มที่อยู่ด้านบนเพื่อเริ่มใช้งาน
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((item) => (
                <div
                  key={item.id}
                  className={`
                    bg-white
                    rounded-2xl
                    border
                    p-5
                    shadow-sm
                    transition
                    ${
                      item.isDefault
                        ? "border-orange-300 bg-orange-50/30"
                        : "border-orange-100"
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    {/* ICON */}

                    <div
                      className={`
                        w-11 h-11
                        rounded-xl
                        flex items-center justify-center
                        shrink-0
                        ${
                          item.isDefault
                            ? "bg-orange-500 text-white"
                            : "bg-orange-50 text-orange-500"
                        }
                      `}
                    >
                      {item.isDefault ? (
                        <Star size={20} fill="currentColor" />
                      ) : (
                        <MapPin size={20} />
                      )}
                    </div>

                    {/* CONTENT */}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-[#2A1B12]">
                          {item.label || "ที่อยู่จัดส่ง"}
                        </h3>

                        {item.isDefault && (
                          <span className="text-[11px] font-semibold bg-orange-500 text-white px-2.5 py-1 rounded-full">
                            ที่อยู่เริ่มต้น
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                        {item.address || "-"}
                      </p>

                      {/* GPS */}

                      {item.lat !== null &&
                        item.lat !== undefined &&
                        item.lng !== null &&
                        item.lng !== undefined && (
                          <div className="mt-3">
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                              <Navigation size={13} />

                              <span>
                                {item.lat}, {item.lng}
                              </span>
                            </div>

                            {/* SAVED MAP */}

                            <div className="mt-3 overflow-hidden rounded-2xl border border-gray-100">
                              <iframe
                                title={`แผนที่ ${item.label}`}
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                                  Number(item.lng) - 0.005
                                },${Number(item.lat) - 0.005},${
                                  Number(item.lng) + 0.005
                                },${
                                  Number(item.lat) + 0.005
                                }&layer=mapnik&marker=${Number(
                                  item.lat,
                                )},${Number(item.lng)}`}
                                className="w-full h-[190px] border-0"
                                loading="lazy"
                              />
                            </div>
                          </div>
                        )}

                      {/* BUTTONS */}

                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="
                            flex items-center justify-center gap-2
                            py-2.5
                            rounded-xl
                            border border-orange-200
                            bg-orange-50
                            text-orange-600
                            text-sm
                            font-semibold
                            hover:bg-orange-100
                            transition
                          "
                        >
                          <Pencil size={15} />
                          แก้ไข
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="
                            flex items-center justify-center gap-2
                            py-2.5
                            rounded-xl
                            border border-red-200
                            bg-red-50
                            text-red-500
                            text-sm
                            font-semibold
                            hover:bg-red-100
                            transition
                          "
                        >
                          <Trash2 size={15} />
                          ลบ
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormAddAddress;
