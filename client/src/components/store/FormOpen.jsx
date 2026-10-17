import { useEffect, useState } from "react";
import usefoodDelivery from "../../globalState/fooddeliveryStore";
import { Clock, CalendarDays, Check, Save, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { updateStoreProfile } from "../../api/createStore";
import Swal from "sweetalert2";

const FormOpen = () => {
  const navigate = useNavigate();

  const token = usefoodDelivery((state) => state.token);
  const getStore = usefoodDelivery((state) => state.getStore);
  const stores = usefoodDelivery((state) => state.stores);

  const getStoreCategory = usefoodDelivery((state) => state.getStoreCategory);

  const [editForm, setEditForm] = useState({
    dayOpen: "",
    timeOpen: "",
    timeClose: "",
  });

  useEffect(() => {
    if (stores) {
      setEditForm({
        dayOpen: stores.dayOpen || "",
        timeOpen: stores.timeOpen ? String(stores.timeOpen).slice(0, 5) : "",
        timeClose: stores.timeClose ? String(stores.timeClose).slice(0, 5) : "",
      });
    }
  }, [stores]);

  useEffect(() => {
    getStoreCategory();
  }, [getStoreCategory]);

  const days = [
    { label: "จ.", full: "จันทร์", value: "MON" },
    { label: "อ.", full: "อังคาร", value: "TUE" },
    { label: "พ.", full: "พุธ", value: "WED" },
    { label: "พฤ.", full: "พฤหัสบดี", value: "THU" },
    { label: "ศ.", full: "ศุกร์", value: "FRI" },
    { label: "ส.", full: "เสาร์", value: "SAT" },
    { label: "อา.", full: "อาทิตย์", value: "SUN" },
  ];

  const openPresets = ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00"];
  const closePresets = ["15:00", "17:00", "18:00", "20:00", "21:00", "22:00"];

  const formatTimeThai = (time) => {
    if (!time) return "";

    const [hour, minute] = time.split(":");

    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(
      2,
      "0",
    )} น.`;
  };

  const handleOnChange = (e) => {
    setEditForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const setTime = (name, value) => {
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleDay = (value) => {
    const current = editForm.dayOpen
      ? editForm.dayOpen.split(",").filter(Boolean)
      : [];

    const next = current.includes(value)
      ? current.filter((d) => d !== value)
      : [...current, value];

    setEditForm((prev) => ({
      ...prev,
      dayOpen: next.join(","),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // =========================
    // ตรวจสอบวัน
    // =========================
    if (!editForm.dayOpen) {
      Swal.fire({
        icon: "warning",
        title: "ยังไม่ได้เลือกวัน",
        text: "กรุณาเลือกวันเปิดร้านอย่างน้อย 1 วัน",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#f97316",
      });

      return;
    }

    // =========================
    // ตรวจสอบเวลา
    // =========================
    if (!editForm.timeOpen || !editForm.timeClose) {
      Swal.fire({
        icon: "warning",
        title: "กรุณาระบุเวลา",
        text: "กรุณาระบุทั้งเวลาเปิดและเวลาปิดร้าน",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#f97316",
      });

      return;
    }

    if (editForm.timeOpen === editForm.timeClose) {
      Swal.fire({
        icon: "error",
        title: "เวลาไม่ถูกต้อง",
        text: "เวลาเปิดและเวลาปิดร้านไม่สามารถเป็นเวลาเดียวกันได้",
        confirmButtonText: "แก้ไข",
        confirmButtonColor: "#f97316",
      });

      return;
    }

    try {
      await updateStoreProfile(token, {
        dayOpen: editForm.dayOpen,
        timeOpen: editForm.timeOpen,
        timeClose: editForm.timeClose,
        openAuto: stores?.openAuto ?? false,
      });
      await getStore(token);

      // =========================
      // สำเร็จ
      // =========================
      await Swal.fire({
        icon: "success",
        title: "บันทึกสำเร็จ",
        text: "แก้ไขเวลาทำการของร้านเรียบร้อยแล้ว",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#f97316",
      });

      navigate("/store/Profile");
    } catch (error) {
      console.log(error);

      // =========================
      // Error
      // =========================
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error?.response?.data?.message || "ไม่สามารถแก้ไขข้อมูลร้านได้",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#f97316",
      });
    }
  };

  const selectedDays = editForm.dayOpen
    ? editForm.dayOpen.split(",").filter(Boolean)
    : [];

  const timeInvalid =
    Boolean(editForm.timeOpen) &&
    Boolean(editForm.timeClose) &&
    editForm.timeOpen === editForm.timeClose;

  // =========================
  // ตัวเลือกเวลาแบบ 24 ชั่วโมง (ไม่มี AM/PM)
  // =========================
  const hourOptions = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0"),
  );

  const baseMinutes = Array.from({ length: 12 }, (_, i) =>
    String(i * 5).padStart(2, "0"),
  );

  const renderTimePicker = (name) => {
    const [h = "", m = ""] = editForm[name] ? editForm[name].split(":") : [];

    // ถ้าค่านาทีเดิมไม่อยู่ในชุด 5 นาที (เช่น 08:07) ให้ยังเลือกค้างไว้ได้
    const minuteOptions =
      m && !baseMinutes.includes(m) ? [...baseMinutes, m].sort() : baseMinutes;

    const selectCls =
      "h-16 w-full cursor-pointer appearance-none rounded-2xl border border-orange-100 bg-white px-2 text-center text-2xl font-bold tabular-nums text-[#2A1B12] outline-none transition [text-align-last:center] focus:border-orange-400 focus:ring-4 focus:ring-orange-100";

    return (
      <div className="flex items-center gap-2">
        <select
          aria-label="ชั่วโมง"
          value={h}
          onChange={(e) => setTime(name, `${e.target.value}:${m || "00"}`)}
          className={selectCls}
        >
          <option value="" disabled>
            --
          </option>
          {hourOptions.map((hour) => (
            <option key={hour} value={hour}>
              {hour}
            </option>
          ))}
        </select>

        <span className="text-2xl font-bold text-[#8A6A54]">:</span>

        <select
          aria-label="นาที"
          value={m}
          onChange={(e) => setTime(name, `${h || "00"}:${e.target.value}`)}
          className={selectCls}
        >
          <option value="" disabled>
            --
          </option>
          {minuteOptions.map((minute) => (
            <option key={minute} value={minute}>
              {minute}
            </option>
          ))}
        </select>

        <span className="shrink-0 text-sm font-semibold text-[#8A6A54]">
          น.
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFCF7] via-[#FFF3E4] to-[#FFF8F0]">
      {/* =========================
          ตรงนี้ใส่ Navbar เดิมของคุณ
      ========================= */}
      {/* <NavbarStore /> */}

      <div className="px-4 py-6 pb-28">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-white px-4 py-2 text-sm font-medium text-[#8A6A54] shadow-sm transition hover:border-orange-300 hover:text-orange-500"
            >
              <ArrowLeft size={16} />
              กลับหน้าก่อนหน้า
            </button>

            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-[#E8491D] shadow-lg shadow-orange-500/25">
                <Clock className="text-white" size={28} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-[#2A1B12]">
                  เวลาทำการร้าน
                </h1>

                <p className="mt-1 text-sm text-[#8A6A54]">
                  ตั้งค่าวันและเวลาที่ร้านเปิดให้บริการ
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* =========================
                ขั้นที่ 1 : วันเปิด
            ========================= */}

            <section className="rounded-3xl border border-orange-50 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                    <CalendarDays size={20} />
                  </span>

                  <div>
                    <h2 className="font-bold text-[#2A1B12]">
                      1. เลือกวันเปิดร้าน
                    </h2>

                    <p className="text-xs text-[#8A6A54]">
                      แตะที่วันเพื่อเลือก แตะซ้ำเพื่อยกเลิก
                    </p>
                  </div>
                </div>

               
              </div>

              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {days.map((day) => {
                  const active = selectedDays.includes(day.value);

                  return (
                    <button
                      type="button"
                      key={day.value}
                      onClick={() => toggleDay(day.value)}
                      title={day.full}
                      aria-pressed={active}
                      className={`relative flex h-16 flex-col items-center justify-center rounded-2xl border font-semibold transition-all duration-200 active:scale-95 sm:h-[72px] ${
                        active
                          ? "border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-500/30"
                          : "border-orange-100 bg-[#FFF8F0] text-[#8A6A54] hover:border-orange-300 hover:bg-orange-50 hover:text-orange-500"
                      }`}
                    >
                      {active && (
                        <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white/25">
                          <Check size={10} strokeWidth={3.5} />
                        </span>
                      )}

                      <span className="text-base sm:text-lg">{day.label}</span>

                      <span
                        className={`mt-0.5 hidden text-[10px] font-medium sm:block ${
                          active ? "text-white/80" : "text-[#B7A390]"
                        }`}
                      >
                        {day.full}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 rounded-2xl border border-orange-100 bg-[#FFF8F0] px-4 py-3">
                <p className="mb-0.5 text-xs text-[#8A6A54]">
                  วันที่เปิดให้บริการ
                </p>

                <p
                  className={`text-sm font-semibold ${
                    selectedDays.length > 0
                      ? "text-orange-600"
                      : "text-[#B7A390]"
                  }`}
                >
                  {selectedDays.length > 0
                    ? days
                        .filter((day) => selectedDays.includes(day.value))
                        .map((day) => day.full)
                        .join(" • ")
                    : "ยังไม่ได้เลือกวัน"}
                </p>
              </div>
            </section>

            {/* =========================
                ขั้นที่ 2 : เวลา
            ========================= */}

            <section className="rounded-3xl border border-orange-50 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                  <Clock size={20} />
                </span>

                <div>
                  <h2 className="font-bold text-[#2A1B12]">
                    2. กำหนดเวลาให้บริการ
                  </h2>

                  <p className="text-xs text-[#8A6A54]">
                    ระบุเวลาเปิดและเวลาปิดร้าน
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* เวลาเปิด */}
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 transition hover:border-emerald-300">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <Clock size={17} />
                    </span>

                    <div>
                      <p className="text-sm font-bold text-[#2A1B12]">
                        เวลาเปิด
                      </p>

                      <p className="text-xs text-[#8A6A54]">
                        ร้านเริ่มให้บริการ
                      </p>
                    </div>
                  </div>

                  <p className="mb-2 text-xs font-medium text-[#8A6A54]">
                    เลือกเวลาที่ใช้บ่อย
                  </p>

                  <div className="mb-4 grid grid-cols-3 gap-2">
                    {openPresets.map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setTime("timeOpen", t)}
                        className={`rounded-xl border py-2.5 text-sm font-bold tabular-nums transition active:scale-95 ${
                          editForm.timeOpen === t
                            ? "border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                            : "border-emerald-100 bg-white text-[#2A1B12] hover:border-emerald-300"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <p className="mb-2 text-xs font-medium text-[#8A6A54]">
                    หรือเลือกเวลาเอง (24 ชั่วโมง)
                  </p>

                  {renderTimePicker("timeOpen")}

                  {editForm.timeOpen && (
                    <div className="mt-3 text-center">
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-1.5 text-base font-bold text-emerald-700">
                        {formatTimeThai(editForm.timeOpen)}
                      </span>
                    </div>
                  )}
                </div>

                {/* เวลาปิด */}
                <div className="rounded-2xl border border-red-100 bg-red-50/50 p-4 transition hover:border-red-300">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-500">
                      <Clock size={17} />
                    </span>

                    <div>
                      <p className="text-sm font-bold text-[#2A1B12]">
                        เวลาปิด
                      </p>

                      <p className="text-xs text-[#8A6A54]">
                        ร้านหยุดให้บริการ
                      </p>
                    </div>
                  </div>

                  <p className="mb-2 text-xs font-medium text-[#8A6A54]">
                    เลือกเวลาที่ใช้บ่อย
                  </p>

                  <div className="mb-4 grid grid-cols-3 gap-2">
                    {closePresets.map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setTime("timeClose", t)}
                        className={`rounded-xl border py-2.5 text-sm font-bold tabular-nums transition active:scale-95 ${
                          editForm.timeClose === t
                            ? "border-red-500 bg-red-500 text-white shadow-md shadow-red-500/25"
                            : "border-red-100 bg-white text-[#2A1B12] hover:border-red-300"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <p className="mb-2 text-xs font-medium text-[#8A6A54]">
                    หรือเลือกเวลาเอง (24 ชั่วโมง)
                  </p>

                  {renderTimePicker("timeClose")}

                  {editForm.timeClose && (
                    <div className="mt-3 text-center">
                      <span className="inline-flex items-center rounded-full bg-red-100 px-4 py-1.5 text-base font-bold text-red-600">
                        {formatTimeThai(editForm.timeClose)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* เตือนทันทีถ้าเวลาไม่ถูกต้อง */}
              {timeInvalid && (
                <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  ⚠️ เวลาเปิดและเวลาปิดร้านไม่สามารถเป็นเวลาเดียวกันได้
                </p>
              )}
            </section>

            {/* =========================
                สรุปก่อนบันทึก
            ========================= */}
            {editForm.timeOpen && editForm.timeClose && !timeInvalid && (
              <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-[#8A6A54]">
                      เวลาทำการของร้าน
                    </p>

                    <p className="mt-1 text-2xl font-bold text-[#2A1B12]">
                      {formatTimeThai(editForm.timeOpen)}
                      <span className="mx-2 text-[#B7A390]">-</span>
                      {formatTimeThai(editForm.timeClose)}
                    </p>

                    {selectedDays.length > 0 && (
                      <p className="mt-2 text-sm text-[#8A6A54]">
                        {days
                          .filter((day) => selectedDays.includes(day.value))
                          .map((day) => day.full)
                          .join(" • ")}
                      </p>
                    )}
                  </div>

                  <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 sm:flex">
                    <Clock size={24} />
                  </div>
                </div>
              </section>
            )}

            {/* Save */}
            <button
              type="submit"
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600 active:scale-[0.99]"
            >
              <Save size={20} />
              บันทึกเวลาทำการ
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormOpen;
