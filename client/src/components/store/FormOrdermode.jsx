import { Clock3, Zap, Check, Settings2, ArrowRight, ArrowLeft } from "lucide-react";
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
      title: "เปลี่ยนรูปแบบการรับออเดอร์",
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
        title: "เปลี่ยนรูปแบบสำเร็จ",
        text: `ร้านของคุณเปลี่ยนเป็น${modeName}แล้ว`,
        icon: "success",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#F97316",
      });

      
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

  const isRealtime = stores?.orderMode === "REALTIME";
  const isRound = stores?.orderMode === "ROUND";

  const modes = [
    {
      id: "REALTIME",
      title: "รับออเดอร์ตลอดเวลา",
      description: "ลูกค้าสั่งอาหารได้ทันทีเมื่อร้านเปิดรับออเดอร์",
      detail: "เหมาะกับร้านที่ทำอาหารตามรายการสั่งซื้อ",
      icon: Zap,
      active: isRealtime,
    },
    {
      id: "ROUND",
      title: "รับออเดอร์เป็นรอบ",
      description: "ลูกค้าเลือกช่วงเวลาที่ต้องการรับอาหาร",
      detail: "กำหนดเวลาและจัดการรอบรับออเดอร์ได้",
      icon: Clock3,
      active: isRound,
    },
  ];

  return (
    
    <div className="mx-auto mt-6 w-full max-w-6xl px-3 pb-28 sm:mt-8 sm:px-5 ">
      <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-white px-4 py-2 text-sm font-medium text-[#8A6A54] shadow-sm transition hover:border-orange-300 hover:text-orange-500"
        >
          <ArrowLeft size={16} />
          กลับหน้าก่อนหน้า
        </button>
      <div className="overflow-hidden rounded-3xl border border-[#F1E5D9] bg-white shadow-[0_4px_24px_rgba(74,42,20,0.04)]">
        {/* Header */}
        <div className="border-b border-[#F4EAE1] px-5 py-6 sm:px-8 sm:py-7">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF1E7] text-[#F97316]">
              <Settings2 size={22} strokeWidth={2} />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold tracking-tight text-[#2A1B12] sm:text-xl">
                รูปแบบการรับออเดอร์
              </h2>
              <p className="mt-1 text-sm leading-6 text-[#948477]">
                เลือกวิธีรับรายการสั่งซื้อที่เหมาะกับร้านของคุณ
              </p>
            </div>
          </div>
        </div>

        {/* Current mode */}
        <div className="px-5 pt-5 sm:px-8 sm:pt-7">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[#514034]">
              เลือกรูปแบบที่ต้องการ
            </p>

            {(isRealtime || isRound) && (
              <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                กำลังใช้งาน
              </span>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            {modes.map((mode) => {
              const Icon = mode.icon;

              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => handleChangeOrderMode(mode.id)}
                  className={`group relative flex min-h-[190px] flex-col rounded-2xl border p-4 text-left transition duration-200 sm:p-5 ${
                    mode.active
                      ? "border-[#F97316] bg-[#FFFAF6] ring-1 ring-[#F97316]/10"
                      : "border-[#EEE5DC] bg-white hover:border-[#F6B98D] hover:bg-[#FFFCF9]"
                  }`}
                >
                  {/* Selected indicator */}
                  <div className="flex w-full items-start justify-between gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
                        mode.active
                          ? "bg-[#F97316] text-white"
                          : "bg-[#FFF1E7] text-[#E98A4A] group-hover:bg-[#FFE8D7]"
                      }`}
                    >
                      <Icon size={22} strokeWidth={2} />
                    </div>

                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                        mode.active
                          ? "border-[#F97316] bg-[#F97316] text-white"
                          : "border-[#E5D9CE] bg-white text-transparent"
                      }`}
                    >
                      <Check size={12} strokeWidth={3} />
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-base font-bold text-[#2A1B12]">
                      {mode.title}
                    </h3>

                    <p className="mt-1.5 text-sm leading-6 text-[#806F61]">
                      {mode.description}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-[#A29386]">
                      {mode.detail}
                    </p>
                  </div>

                  {mode.active && (
                    <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-[#FCE9DA] px-2.5 py-1 text-xs font-semibold text-[#B95719]">
                      <Check size={13} strokeWidth={2.5} />
                      รูปแบบปัจจุบัน
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Round management */}
        {isRound && (
          <div className="px-5 pt-5 sm:px-8 sm:pt-6">
            <div className="flex flex-col gap-4 rounded-2xl border border-[#F1E5D9] bg-[#FFFCF9] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#E98A4A] ring-1 ring-[#F1E5D9]">
                  <Clock3 size={20} />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#2A1B12] sm:text-base">
                    จัดการรอบรับออเดอร์
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-[#948477] sm:text-sm">
                    เพิ่ม แก้ไข และลบรอบเวลาของร้านได้ที่นี่
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/store/order-round")}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#F97316] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#EA680C] active:scale-[0.98] sm:w-auto"
              >
                จัดการรอบ
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 pb-5 pt-5 sm:px-8 sm:pb-7">
          <div className="rounded-xl bg-[#FAF7F3] px-4 py-3">
            <p className="text-xs leading-5 text-[#8E7D6E]">
              <span className="font-semibold text-[#6D5847]">หมายเหตุ:</span>{" "}
              การเปลี่ยนรูปแบบจะมีผลกับวิธีที่ลูกค้าสั่งอาหารจากร้านของคุณ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormOrdermode;