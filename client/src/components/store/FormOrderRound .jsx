import { useState, useEffect } from "react";
import {
  Clock3,
  Users,
  Save,
  Trash2,
  Settings2,
  Truck,
  ArrowLeft,
} from "lucide-react";
import {
  createOrderRound,
  updateOrderRound,
  removeAllOrderRound,
} from "../../api/OrderRound";
import usefoodDelivery from "../../globalState/fooddeliveryStore";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const FormOrderRound = () => {
  const Navigate = useNavigate();
  const token = usefoodDelivery((state) => state.token);
  const getOrderRound = usefoodDelivery((state) => state.getOrderRound);
  const orderRound = usefoodDelivery((state) => state.orderRound);

  const [editingRoundId, setEditingRoundId] = useState(null);
  const [editMaxOrders, setEditMaxOrders] = useState("");
  const [editHasOrderLimit, setEditHasOrderLimit] = useState(false);

  const [form, setForm] = useState({
    durationMinutes: 60,
    hasOrderLimit: false,
    maxOrders: null,
  });

  useEffect(() => {
    if (token) {
      getOrderRound(token);
    }
  }, [token, getOrderRound]);

  const handleOnChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "maxOrders" || name === "durationMinutes"
            ? value === ""
              ? null
              : Number(value)
            : value,
    }));
  };

  const showError = (error, fallback = "เกิดข้อผิดพลาด") => {
    Swal.fire({
      title: "เกิดข้อผิดพลาด",
      text: error.response?.data?.message || fallback,
      icon: "error",
      confirmButtonText: "ตกลง",
      confirmButtonColor: "#F97316",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.durationMinutes || form.durationMinutes <= 0) {
      await Swal.fire({
        title: "กรุณาตรวจสอบข้อมูล",
        text: "กรุณาเลือกระยะเวลาต่อรอบ",
        icon: "warning",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#F97316",
      });
      return;
    }

    if (form.hasOrderLimit && (!form.maxOrders || form.maxOrders <= 0)) {
      await Swal.fire({
        title: "กรุณาตรวจสอบข้อมูล",
        text: "กรุณาระบุจำนวนออเดอร์สูงสุด",
        icon: "warning",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#F97316",
      });
      return;
    }

    const payload = {
      isManual: false,
      durationMinutes: Number(form.durationMinutes),
      hasOrderLimit: form.hasOrderLimit,
      maxOrders: form.hasOrderLimit ? Number(form.maxOrders) : null,
      cutoffMinutes: 0,
    };

    try {
      await createOrderRound(token, payload);
      await getOrderRound(token);

      await Swal.fire({
        title: "สำเร็จ",
        text: "สร้างรอบรับออเดอร์เรียบร้อย",
        icon: "success",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#F97316",
      });
    } catch (error) {
      console.error(error);
      showError(error);
    }
  };

  const handleUpdateRound = async (round) => {
    if (editHasOrderLimit && (!editMaxOrders || Number(editMaxOrders) <= 0)) {
      await Swal.fire({
        title: "กรุณาตรวจสอบข้อมูล",
        text: "กรุณาระบุจำนวนออเดอร์สูงสุด",
        icon: "warning",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#F97316",
      });
      return;
    }

    try {
      await updateOrderRound(token, round.id, {
        hasOrderLimit: editHasOrderLimit,
        maxOrders: editHasOrderLimit ? Number(editMaxOrders) : null,
      });

      setEditingRoundId(null);
      setEditMaxOrders("");
      setEditHasOrderLimit(false);

      await getOrderRound(token);

      await Swal.fire({
        title: "สำเร็จ",
        text: "แก้ไขจำนวนออเดอร์เรียบร้อย",
        icon: "success",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#F97316",
      });
    } catch (error) {
      console.error(error);
      showError(error, "ไม่สามารถแก้ไขรอบได้");
    }
  };

  const handleEditRound = (round) => {
    setEditingRoundId(round.id);
    setEditHasOrderLimit(round.hasOrderLimit ?? false);
    setEditMaxOrders(round.maxOrders ?? "");
  };

  const handleDeleteAll = async () => {
    const result = await Swal.fire({
      title: "ยืนยันการลบรอบทั้งหมด?",
      text: "คุณต้องการลบรอบรับออเดอร์ทั้งหมดใช่หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ยืนยันลบทั้งหมด",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#9CA3AF",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await removeAllOrderRound(token);
      await getOrderRound(token);

      await Swal.fire({
        title: "สำเร็จ",
        text: "ลบรอบทั้งหมดเรียบร้อย",
        icon: "success",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#F97316",
      });
    } catch (error) {
      console.error(error);
      showError(error);
    }
  };

  const handleCancelEdit = () => {
    setEditingRoundId(null);
    setEditMaxOrders("");
    setEditHasOrderLimit(false);
  };

  const rounds = Array.isArray(orderRound)
    ? orderRound
    : orderRound
      ? [orderRound]
      : [];

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-[#FFFCF7] via-[#FFF5E9] to-[#FFF8F0] px-3 py-6 pb-32 sm:px-5 sm:py-8 md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <button
          type="button"
          onClick={() => Navigate(-1)}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-white px-4 py-2 text-sm font-medium text-[#8A6A54] shadow-sm transition hover:border-orange-300 hover:text-orange-500"
        >
          <ArrowLeft size={16} />
          กลับหน้าก่อนหน้า
        </button>
        {/* Header */}
        <div className="mb-4 rounded-3xl border border-orange-100 bg-white p-4 shadow-sm sm:mb-5 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-500 sm:h-12 sm:w-12">
              <Clock3 size={22} strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-[#2A1B12] sm:text-2xl">
                ตั้งค่ารอบรับออเดอร์
              </h1>
              <p className="mt-1 text-xs leading-5 text-[#8A6A54] sm:text-sm">
                ระบบจะสร้างรอบอัตโนมัติจากเวลาเปิด-ปิดร้าน
              </p>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Duration */}
          <section className="mb-4 rounded-3xl border border-orange-100 bg-white p-4 shadow-sm sm:mb-5 sm:p-6">
            <div className="mb-4 flex items-start gap-3 sm:mb-5 sm:gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-500">
                <Clock3 size={22} />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-[#2A1B12] sm:text-lg">
                  ระยะเวลารับออเดอร์ต่อรอบ
                </h2>
                <p className="mt-1 text-xs leading-5 text-[#8A6A54] sm:text-sm">
                  ลูกค้าจะสามารถสั่งอาหารได้ตลอดช่วงเวลาของรอบ
                </p>
              </div>
            </div>

            <select
              name="durationMinutes"
              value={form.durationMinutes ?? ""}
              onChange={handleOnChange}
              className="h-12 w-full rounded-2xl border border-orange-100 bg-[#FFFDF9] px-4 text-sm font-semibold text-[#2A1B12] outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            >
              <option value={60}>1 ชั่วโมง</option>
              <option value={90}>1 ชั่วโมง 30 นาที</option>
              <option value={120}>2 ชั่วโมง</option>
            </select>
          </section>

          {/* Order Limit */}
          <section className="mb-4 rounded-3xl border border-orange-100 bg-white p-4 shadow-sm sm:mb-5 sm:p-6">
            <div className="mb-4 flex items-start gap-3 sm:mb-5 sm:gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-500">
                <Users size={22} />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-[#2A1B12] sm:text-lg">
                  จำกัดจำนวนออเดอร์
                </h2>
                <p className="mt-1 text-xs leading-5 text-[#8A6A54] sm:text-sm">
                  จำกัดจำนวนลูกค้าในแต่ละรอบ
                </p>
              </div>
            </div>

            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-orange-100 bg-[#FFFDF9] p-3.5 transition hover:border-orange-300 sm:p-4">
              <div>
                <span className="text-sm font-semibold text-[#2A1B12]">
                  เปิดใช้งาน
                </span>
                <p className="mt-0.5 text-xs text-[#8A6A54]">
                  กำหนดจำนวนออเดอร์สูงสุดต่อรอบ
                </p>
              </div>
              <input
                type="checkbox"
                name="hasOrderLimit"
                checked={form.hasOrderLimit}
                onChange={handleOnChange}
                className="h-5 w-5 shrink-0 accent-orange-500"
              />
            </label>

            {form.hasOrderLimit && (
              <div className="mt-4">
                <label className="mb-2 block text-sm font-semibold text-[#2A1B12]">
                  จำนวนสูงสุดต่อรอบ
                </label>
                <input
                  type="number"
                  min="1"
                  name="maxOrders"
                  value={form.maxOrders ?? ""}
                  onChange={handleOnChange}
                  placeholder="เช่น 20"
                  className="h-12 w-full rounded-2xl border border-orange-100 bg-white px-4 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </div>
            )}
          </section>

          {/* Delivery Time */}
          <section className="mb-4 rounded-3xl border border-orange-200 bg-orange-50 p-4 sm:mb-5 sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm">
                <Truck size={19} />
              </div>
              <h2 className="text-base font-bold text-orange-600 sm:text-lg">
                เวลาเตรียมและจัดส่ง
              </h2>
            </div>

            <div className="space-y-2.5 text-xs leading-5 text-[#6F5544] sm:text-sm sm:leading-6">
              <p>ลูกค้าสามารถสั่งอาหารได้ตลอดเวลาของรอบ</p>
              <p>
                หลังจบรอบ ระบบเผื่อเวลา
                <b className="text-orange-600">20 นาที</b> สำหรับเตรียมและจัดส่ง
              </p>
              <p>รอบถัดไปจะเริ่มหลังจากช่วงเวลา 20 นาที</p>
              <p>
                เวลา 20 นาที
                <b className="text-orange-600">ไม่รวมอยู่ในเวลารับออเดอร์</b>
              </p>
            </div>
          </section>

          {/* Preview */}
          <section className="mb-4 rounded-3xl border border-orange-100 bg-white p-4 shadow-sm sm:mb-5 sm:p-6">
            <div className="mb-4">
              <h2 className="text-base font-bold text-[#2A1B12] sm:text-lg">
                ตัวอย่างการทำงาน
              </h2>
              <p className="mt-1 text-xs text-[#8A6A54] sm:text-sm">
                ตัวอย่างลำดับเวลาของแต่ละรอบ
              </p>
            </div>

            <div className="space-y-3">
              {[
                { number: 1, start: "08:00", end: "09:00", next: "09:20" },
                { number: 2, start: "09:20", end: "10:20", next: "10:40" },
                { number: 3, start: "10:40", end: "11:40", next: "12:00" },
              ].map((item) => (
                <div
                  key={item.number}
                  className="rounded-2xl border border-orange-100 bg-[#FFFDF9] p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-xs font-bold text-orange-600">
                      {item.number}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#2A1B12]">
                        รอบ {item.number}
                      </p>
                      <p className="mt-1 text-xs text-orange-600 sm:text-sm">
                        {item.start} - {item.end} รับออเดอร์
                      </p>
                      <p className="mt-1 text-xs text-[#8A6A54] sm:text-sm">
                        {item.end} - {item.next} เตรียม/จัดส่ง
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Save */}
          <button
            type="submit"
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 active:scale-[0.99] sm:py-4 sm:text-base"
          >
            <Save size={19} />
            บันทึกการตั้งค่า
          </button>
        </form>
        {/* Existing Rounds */}
        <section className="rounded-3xl border border-orange-100 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-500">
              <Clock3 size={19} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-[#2A1B12] sm:text-xl">
                รอบรับออเดอร์ที่สร้างแล้ว
              </h2>
              <p className="mt-0.5 text-xs text-[#8A6A54] sm:text-sm">
                รายการรอบที่ระบบสร้างไว้
              </p>
            </div>
          </div>

          {rounds.length === 0 ? (
            <div className="rounded-2xl bg-[#FFF8F0] px-4 py-10 text-center">
              <Clock3 size={30} className="mx-auto mb-3 text-orange-300" />
              <p className="text-sm font-medium text-[#8A6A54]">
                ยังไม่มีรอบรับออเดอร์
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {rounds.map((round) => (
                <div
                  key={round.id}
                  className="rounded-2xl border border-orange-100 bg-[#FFFDF9] p-4 transition hover:border-orange-300 sm:p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                      <Clock3 size={19} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-base font-bold text-[#2A1B12]">
                          รอบที่ {round.roundNumber}
                        </h3>
                        <span
                          className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-bold sm:px-3 sm:text-xs ${
                            round.status === "OPEN"
                              ? "bg-green-100 text-green-600"
                              : round.status === "FULL"
                                ? "bg-orange-100 text-orange-600"
                                : round.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-600"
                                  : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {round.status === "OPEN"
                            ? "เปิดรับออเดอร์"
                            : round.status === "FULL"
                              ? "เต็ม"
                              : round.status === "PENDING"
                                ? "รอเปิดรอบ"
                                : "ปิดรอบ"}
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-semibold text-orange-600">
                        {round.startTime} - {round.endTime}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-[#8A6A54] sm:text-sm">
                        <Truck size={14} />
                        เตรียม/จัดส่งต่ออีก 20 นาที
                      </p>
                    </div>
                  </div>

                  {editingRoundId === round.id ? (
                    <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 p-3.5 sm:mt-5 sm:p-4">
                      <div className="flex items-start gap-3">
                        <Settings2
                          size={19}
                          className="mt-0.5 shrink-0 text-orange-500"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-[#2A1B12] sm:text-base">
                            แก้ไขจำนวนออเดอร์
                          </h4>
                          <p className="mt-1 text-xs leading-5 text-[#8A6A54] sm:text-sm">
                            สามารถแก้ไขจำนวนออเดอร์ได้ แม้รอบนี้จะมีออเดอร์แล้ว
                          </p>
                        </div>
                      </div>

                      <label className="mt-4 flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-white p-3.5 sm:p-4">
                        <span className="text-sm font-semibold text-[#2A1B12]">
                          จำกัดจำนวนออเดอร์
                        </span>
                        <input
                          type="checkbox"
                          checked={editHasOrderLimit}
                          onChange={(e) =>
                            setEditHasOrderLimit(e.target.checked)
                          }
                          className="h-5 w-5 shrink-0 accent-orange-500"
                        />
                      </label>

                      {editHasOrderLimit && (
                        <div className="mt-4">
                          <label className="mb-2 block text-sm font-semibold text-[#2A1B12]">
                            จำนวนสูงสุดต่อรอบ
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={editMaxOrders}
                            onChange={(e) => setEditMaxOrders(e.target.value)}
                            className="h-12 w-full rounded-xl border border-orange-100 bg-white px-4 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                            placeholder="เช่น 20"
                          />
                        </div>
                      )}

                      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => handleUpdateRound(round)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
                        >
                          <Save size={17} />
                          บันทึก
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="rounded-xl bg-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-300"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
                        <div className="rounded-xl bg-white p-3 ring-1 ring-orange-50">
                          <p className="text-xs text-[#8A6A54]">จำกัดจำนวน</p>
                          <p className="mt-1 text-sm font-bold text-[#2A1B12]">
                            {round.hasOrderLimit
                              ? `${round.maxOrders} ออเดอร์`
                              : "ไม่จำกัด"}
                          </p>
                        </div>
                        <div className="rounded-xl bg-white p-3 ring-1 ring-orange-50">
                          <p className="text-xs text-[#8A6A54]">
                            เวลาส่งหลังจบรอบ
                          </p>
                          <p className="mt-1 text-sm font-bold text-[#2A1B12]">
                            20 นาที
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleEditRound(round)}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white py-3 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
                      >
                        <Settings2 size={17} />
                        แก้ไขจำนวนออเดอร์
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
        {/* Delete */}
        <div className="mt-4 pb-10 sm:mt-5 sm:pb-16">
          <button
            type="button"
            onClick={handleDeleteAll}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white py-3 text-sm font-semibold text-red-500 shadow-sm transition hover:bg-red-50"
          >
            <Trash2 size={18} />
            ลบรอบทั้งหมด
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormOrderRound;
