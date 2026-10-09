import { Clock3, Zap, Check, Settings2 } from "lucide-react";
import usefoodDelivery from "../../globalState/fooddeliveryStore";
import { changeOrderMode } from "../../api/createStore";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const FormOrdermode = () => {
const navigate = useNavigate();

const token = usefoodDelivery((state) => state.token);
const getStore = usefoodDelivery((state) => state.getStore);
const stores = usefoodDelivery((state) => state.stores);

const handleChangeOrderMode = async (mode) => {
if (stores?.orderMode === mode) {
if (mode === "ROUND") {
navigate("/store/order-round");
}
return;
}


const modeName =
  mode === "ROUND" ? "รับออเดอร์เป็นรอบ" : "รับออเดอร์ตลอดเวลา";

const result = await Swal.fire({
  title: "ยืนยันการเปลี่ยนรูปแบบ?",
  text: `คุณต้องการเปลี่ยนเป็น${modeName}ใช่หรือไม่`,
  icon: "question",
  showCancelButton: true,
  confirmButtonText: "ยืนยัน",
  cancelButtonText: "ยกเลิก",
  confirmButtonColor: "#F97316",
  cancelButtonColor: "#9CA3AF",
  reverseButtons: true,
});

if (!result.isConfirmed) return;

try {
  await changeOrderMode(token, { orderMode: mode });

  await getStore(token);

  await Swal.fire({
    title: "สำเร็จ",
    text: "เปลี่ยนรูปแบบการรับออเดอร์สำเร็จ",
    icon: "success",
    confirmButtonText: "ตกลง",
    confirmButtonColor: "#F97316",
  });

  if (mode === "ROUND") {
    navigate("/store/order-round");
  } else {
    navigate("/store/profile");
  }
} catch (err) {
  console.error(err);

  Swal.fire({
    title: "เกิดข้อผิดพลาด",
    text:
      err.response?.data?.message ||
      "ไม่สามารถเปลี่ยนรูปแบบการรับออเดอร์ได้",
    icon: "error",
    confirmButtonText: "ตกลง",
    confirmButtonColor: "#F97316",
  });
}

};

return ( <div className="mx-auto mt-8 w-full max-w-6xl rounded-3xl border border-orange-100 bg-white p-4 shadow-sm sm:p-5 md:p-6"> <div className="mb-5 flex items-start gap-3 sm:mb-6"> <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-500 sm:h-11 sm:w-11 sm:rounded-2xl"> <Zap size={20} strokeWidth={2.5} className="sm:hidden" /> <Zap size={22} strokeWidth={2.5} className="hidden sm:block" /> </div>


    <div className="min-w-0">
      <h2 className="text-lg font-bold text-[#2A1B12] sm:text-xl">
        รูปแบบการรับออเดอร์
      </h2>
      <p className="mt-1 text-xs leading-5 text-[#8A6A54] sm:text-sm">
        เลือกรูปแบบที่เหมาะกับการจัดการออเดอร์ของร้าน
      </p>
    </div>
  </div>

  <div className="space-y-3 sm:space-y-4">
    {/* REALTIME */}
    <button
      type="button"
      onClick={() => handleChangeOrderMode("REALTIME")}
      className={`w-full rounded-2xl border-2 p-4 text-left transition-all sm:p-5 ${
        stores?.orderMode === "REALTIME"
          ? "border-orange-400 bg-orange-50 shadow-sm"
          : "border-orange-100 bg-white hover:border-orange-300 hover:bg-orange-50/40"
      }`}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:h-14 sm:w-14 sm:rounded-2xl ${
            stores?.orderMode === "REALTIME"
              ? "bg-orange-500 text-white"
              : "bg-orange-100 text-orange-500"
          }`}
        >
          <Zap size={22} strokeWidth={2.5} className="sm:hidden" />
          <Zap size={27} strokeWidth={2.5} className="hidden sm:block" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-[#2A1B12] sm:text-lg">
            รับออเดอร์ตลอดเวลา
          </h3>
          <p className="mt-0.5 text-xs leading-5 text-[#8A6A54] sm:mt-1 sm:text-sm">
            ลูกค้าสามารถสั่งอาหารได้ทันที
          </p>
        </div>

        {stores?.orderMode === "REALTIME" && (
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs">
            <Check size={12} strokeWidth={3} className="sm:hidden" />
            <Check size={14} strokeWidth={3} className="hidden sm:block" />
            <span className="hidden xs:inline">ใช้งานอยู่</span>
            <span className="xs:hidden">✓</span>
          </div>
        )}
      </div>
    </button>

    {/* ROUND */}
    <div
      className={`w-full overflow-hidden rounded-2xl border-2 transition-all ${
        stores?.orderMode === "ROUND"
          ? "border-orange-400 bg-orange-50 shadow-sm"
          : "border-orange-100 bg-white"
      }`}
    >
      <button
        type="button"
        onClick={() => handleChangeOrderMode("ROUND")}
        className="w-full p-4 text-left transition hover:bg-orange-50/50 sm:p-5"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:h-14 sm:w-14 sm:rounded-2xl ${
              stores?.orderMode === "ROUND"
                ? "bg-orange-500 text-white"
                : "bg-orange-100 text-orange-500"
            }`}
          >
            <Clock3 size={22} strokeWidth={2.5} className="sm:hidden" />
            <Clock3 size={27} strokeWidth={2.5} className="hidden sm:block" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-bold text-[#2A1B12] sm:text-lg">
              รับออเดอร์เป็นรอบ
            </h3>
            <p className="mt-0.5 text-xs leading-5 text-[#8A6A54] sm:mt-1 sm:text-sm">
              ลูกค้าเลือกช่วงเวลาที่ต้องการรับอาหาร
            </p>
          </div>

          {stores?.orderMode === "ROUND" && (
            <div className="flex shrink-0 items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs">
              <Check size={12} strokeWidth={3} className="sm:hidden" />
              <Check size={14} strokeWidth={3} className="hidden sm:block" />
              <span className="hidden xs:inline">ใช้งานอยู่</span>
              <span className="xs:hidden">✓</span>
            </div>
          )}
        </div>
      </button>

      {/* จัดการรอบ */}
      {stores?.orderMode === "ROUND" && (
        <div className="border-t border-orange-200/70 px-4 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-5">
          <div className="rounded-2xl border border-orange-100 bg-white p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-500 sm:h-10 sm:w-10">
                  <Settings2 size={17} strokeWidth={2.5} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-[#2A1B12] sm:text-base">
                    จัดการรอบรับออเดอร์
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-[#8A6A54] sm:text-sm">
                    เพิ่ม แก้ไข หรือลบรอบรับออเดอร์ของร้าน
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/store/order-round")}
                className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 active:scale-[0.98] sm:w-auto sm:px-5 sm:py-3"
              >
                <Settings2 size={17} />
                จัดการรอบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>

  {/* Footer */}
  <div className="mt-4 rounded-2xl bg-[#FFF8F0] px-3 py-2.5 sm:mt-5 sm:px-4 sm:py-3">
    <p className="text-[11px] leading-5 text-[#8A6A54] sm:text-xs">
      💡 สามารถเปลี่ยนรูปแบบการรับออเดอร์ได้ตามการจัดการของร้าน
    </p>
  </div>
</div>


);
};

export default FormOrdermode;
