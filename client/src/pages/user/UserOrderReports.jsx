import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileWarning,
  RefreshCw,
  XCircle,
  ChevronDown,
  ChevronUp,
  Store,
  ReceiptText,
  MessageSquareText,
  CalendarDays,
  CircleDollarSign,
} from "lucide-react";
import Swal from "sweetalert2";

import usefoodDelivery from "../../globalState/fooddeliveryStore";
import { getMyOrderReports } from "../../api/UserOrder";

const REPORT_TYPE_LABELS = {
  ORDER_NOT_DELIVERED: "ร้านยังไม่จัดส่ง",
  WRONG_ORDER: "ได้รับอาหารไม่ตรงกับที่สั่ง",
  MISSING_ITEM: "ได้รับอาหารไม่ครบ",
  OTHER: "อื่น ๆ",
};

const STATUS_CONFIG = {
  PENDING: {
    label: "รอตรวจสอบ",
    className: "bg-amber-50 text-amber-600 border-amber-200",
    dotClass: "bg-amber-400",
    icon: Clock3,
  },
  REVIEWING: {
    label: "กำลังตรวจสอบ",
    className: "bg-blue-50 text-blue-600 border-blue-200",
    dotClass: "bg-blue-400",
    icon: RefreshCw,
  },
  RESOLVED: {
    label: "ดำเนินการแล้ว",
    className: "bg-green-50 text-green-600 border-green-200",
    dotClass: "bg-green-500",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "ไม่รับเรื่อง",
    className: "bg-red-50 text-red-600 border-red-200",
    dotClass: "bg-red-500",
    icon: XCircle,
  },
};

const ORDER_STATUS_LABELS = {
  PENDING: "รอร้านยืนยัน",
  WAITING_PAYMENT: "รอชำระเงิน",
  CONFIRMED: "ยืนยันออเดอร์แล้ว",
  PREPARING: "กำลังทำอาหาร",
  READY: "ทำอาหารเสร็จแล้ว",
  COMPLETED: "ออเดอร์สำเร็จ",
  CANCELLED: "ยกเลิกออเดอร์",
};

const UserOrderReports = () => {
  const tokenFromStore = usefoodDelivery((state) => state.token);

  const token =
    tokenFromStore ||
    localStorage.getItem("token") ||
    localStorage.getItem("userToken");

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const loadReports = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const res = await getMyOrderReports(token);

      setReports(res.data?.reports || []);
    } catch (error) {
      console.error("LOAD MY ORDER REPORTS ERROR =", error);

      Swal.fire({
        icon: "error",
        title: "โหลดข้อมูลไม่สำเร็จ",
        text:
          error.response?.data?.message || "ไม่สามารถโหลดรายการแจ้งปัญหาได้",
        confirmButtonColor: "#FF6B35",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [token]);

  const sortedReports = useMemo(() => {
    return [...reports].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [reports]);

  const summary = useMemo(() => {
    return {
      total: reports.length,
      pending: reports.filter((item) => item.status === "PENDING").length,
      reviewing: reports.filter((item) => item.status === "REVIEWING").length,
      resolved: reports.filter((item) => item.status === "RESOLVED").length,
    };
  }, [reports]);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getStatusConfig = (status) => {
    return (
      STATUS_CONFIG[status] || {
        label: status || "ไม่ทราบสถานะ",
        className: "bg-gray-50 text-gray-600 border-gray-200",
        dotClass: "bg-gray-400",
        icon: FileWarning,
      }
    );
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-6">
        {" "}
        <div className="bg-white rounded-[2rem] shadow-sm border border-orange-100 p-8 text-center max-w-md w-full">
          {" "}
          <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-5">
            {" "}
            <AlertTriangle className="w-8 h-8 text-orange-500" />{" "}
          </div>
          <h1 className="text-xl font-bold text-gray-800">กรุณาเข้าสู่ระบบ</h1>
          <p className="text-gray-500 mt-2 text-sm leading-6">
            กรุณาเข้าสู่ระบบก่อนดูรายการแจ้งปัญหาออเดอร์
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] px-4 py-6 pb-32 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#FF6B35] to-[#E8491D] rounded-[2rem] p-6 md:p-8 mb-6 shadow-lg shadow-orange-100">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute right-20 -bottom-16 w-32 h-32 rounded-full bg-white/10" />

          <div className="relative flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <FileWarning size={23} className="text-white" />
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  แจ้งปัญหาออเดอร์
                </h1>
              </div>

              <p className="text-white/80 text-sm md:text-base">
                ติดตามสถานะและการตอบกลับจากทีมงาน
              </p>
            </div>

            <button
              type="button"
              onClick={loadReports}
              disabled={loading}
              className="
            shrink-0
            w-11 h-11
            md:w-auto md:h-auto
            md:px-4 md:py-2.5
            rounded-2xl
            bg-white/15
            hover:bg-white/25
            border border-white/20
            text-white
            font-semibold
            flex items-center justify-center gap-2
            transition
            disabled:opacity-50
          "
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />

              <span className="hidden md:inline">รีเฟรช</span>
            </button>
          </div>
        </div>

        {/* ================= SUMMARY ================= */}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <div className="bg-white rounded-3xl border border-orange-100 p-4 md:p-5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs md:text-sm text-gray-500">
                    เรื่องทั้งหมด
                  </p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {summary.total}
                  </p>
                </div>

                <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center">
                  <FileWarning size={20} className="text-orange-500" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-amber-100 p-4 md:p-5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs md:text-sm text-gray-500">รอตรวจสอบ</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {summary.pending}
                  </p>
                </div>

                <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
                  <Clock3 size={20} className="text-amber-500" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-blue-100 p-4 md:p-5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs md:text-sm text-gray-500">
                    กำลังตรวจสอบ
                  </p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {summary.reviewing}
                  </p>
                </div>

                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <RefreshCw size={20} className="text-blue-500" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-green-100 p-4 md:p-5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs md:text-sm text-gray-500">
                    ดำเนินการแล้ว
                  </p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {summary.resolved}
                  </p>
                </div>

                <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-green-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= LOADING ================= */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-white rounded-[2rem] border border-orange-100 p-6 animate-pulse"
              >
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-200" />

                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= EMPTY ================= */}
        {!loading && sortedReports.length === 0 && (
          <div className="bg-white rounded-[2rem] border border-orange-100 shadow-sm p-10 md:p-14 text-center">
            <div className="w-20 h-20 rounded-[1.5rem] bg-orange-50 flex items-center justify-center mx-auto mb-5">
              <FileWarning size={36} className="text-orange-500" />
            </div>

            <h2 className="text-xl font-bold text-gray-800">
              ยังไม่มีเรื่องแจ้งปัญหา
            </h2>

            <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto leading-6">
              หากพบปัญหาเกี่ยวกับออเดอร์
              สามารถแจ้งปัญหาจากหน้ารายละเอียดออเดอร์ได้
            </p>
          </div>
        )}

        {/* ================= REPORT LIST ================= */}
        {!loading && sortedReports.length > 0 && (
          <div className="space-y-4">
            {sortedReports.map((report) => {
              const statusConfig = getStatusConfig(report.status);

              const StatusIcon = statusConfig.icon;

              const isExpanded = expandedId === report.id;

              return (
                <div
                  key={report.id}
                  className={`
                relative
                bg-white
                rounded-[2rem]
                border
                border-orange-100
                shadow-sm
                overflow-hidden
                transition-all
                duration-300
                ${isExpanded ? "shadow-md" : "hover:shadow-md"}
              `}
                >
                  {/* STATUS SIDE BAR */}
                  <div
                    className={`
                  absolute
                  left-0
                  top-0
                  bottom-0
                  w-1.5
                  ${statusConfig.dotClass}
                `}
                  />

                  {/* ================= CARD HEADER ================= */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : report.id)}
                    className="
                  w-full
                  text-left
                  p-5
                  md:p-6
                  pl-6
                  md:pl-7
                  hover:bg-orange-50/30
                  transition
                "
                  >
                    <div className="flex items-start gap-4">
                      {/* ICON */}
                      <div className="hidden sm:flex shrink-0 w-12 h-12 rounded-2xl bg-orange-50 items-center justify-center">
                        <ReceiptText size={22} className="text-orange-500" />
                      </div>

                      <div className="min-w-0 flex-1">
                        {/* ORDER + STATUS */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-800">
                            ออเดอร์ #{report.orderId}
                          </span>

                          <span
                            className={`
                          inline-flex
                          items-center
                          gap-1.5
                          px-3
                          py-1
                          rounded-full
                          border
                          text-xs
                          font-semibold
                          ${statusConfig.className}
                        `}
                          >
                            <StatusIcon size={13} />
                            {statusConfig.label}
                          </span>
                        </div>

                        {/* STORE */}
                        <div className="flex items-center gap-2 mt-2.5">
                          <Store
                            size={15}
                            className="text-orange-500 shrink-0"
                          />

                          <p className="text-sm font-semibold text-gray-700 truncate">
                            {report.store?.storeName || "ไม่พบชื่อร้าน"}
                          </p>
                        </div>

                        {/* REPORT TYPE */}
                        <div className="flex items-center gap-2 mt-1.5">
                          <MessageSquareText
                            size={15}
                            className="text-gray-400 shrink-0"
                          />

                          <p className="text-sm text-gray-500">
                            {REPORT_TYPE_LABELS[report.type] ||
                              report.type ||
                              "ไม่ระบุประเภท"}
                          </p>
                        </div>
                      </div>

                      {/* ARROW */}
                      <div className="shrink-0 w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                        {isExpanded ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </div>
                    </div>

                    {/* META */}
                    <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={14} />
                        แจ้งเมื่อ {formatDate(report.createdAt)}
                      </span>

                      {report.order?.totalPrice != null && (
                        <span className="flex items-center gap-1.5">
                          <CircleDollarSign size={14} />
                          ยอดออเดอร์{" "}
                          {Number(report.order.totalPrice).toLocaleString(
                            "th-TH",
                          )}{" "}
                          บาท
                        </span>
                      )}
                    </div>
                  </button>

                  {/* ================= EXPANDED ================= */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 px-5 pb-6 md:px-7">
                      <div className="pt-6 space-y-6">
                        {/* PROBLEM DETAIL */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
                              <MessageSquareText
                                size={16}
                                className="text-orange-500"
                              />
                            </div>

                            <p className="text-sm font-bold text-gray-800">
                              รายละเอียดปัญหา
                            </p>
                          </div>

                          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 md:p-5 text-sm text-gray-600 whitespace-pre-wrap leading-6">
                            {report.detail || "ไม่ได้ระบุรายละเอียดเพิ่มเติม"}
                          </div>
                        </div>

                        {/* ORDER INFO */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
                              <ReceiptText
                                size={16}
                                className="text-orange-500"
                              />
                            </div>

                            <p className="text-sm font-bold text-gray-800">
                              ข้อมูลออเดอร์
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="rounded-2xl bg-[#FFF8F0] border border-orange-100 p-4">
                              <p className="text-xs text-gray-500">
                                สถานะออเดอร์
                              </p>

                              <p className="font-semibold text-gray-800 mt-1.5">
                                {ORDER_STATUS_LABELS[report.order?.status] ||
                                  report.order?.status ||
                                  "-"}
                              </p>
                            </div>

                            <div className="rounded-2xl bg-[#FFF8F0] border border-orange-100 p-4">
                              <p className="text-xs text-gray-500">ยอดรวม</p>

                              <p className="font-semibold text-gray-800 mt-1.5">
                                {report.order?.totalPrice != null
                                  ? Number(
                                      report.order.totalPrice,
                                    ).toLocaleString("th-TH")
                                  : "-"}{" "}
                                บาท
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* ADMIN RESPONSE */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                              <MessageSquareText
                                size={16}
                                className="text-blue-500"
                              />
                            </div>

                            <p className="text-sm font-bold text-gray-800">
                              การตอบกลับจาก Admin
                            </p>
                          </div>

                          {report.adminNote ? (
                            <div
                              className={`
                            rounded-2xl
                            p-4
                            md:p-5
                            border
                            ${
                              report.status === "REJECTED"
                                ? "bg-red-50 border-red-100"
                                : report.status === "RESOLVED"
                                  ? "bg-green-50 border-green-100"
                                  : "bg-blue-50 border-blue-100"
                            }
                          `}
                            >
                              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-6">
                                {report.adminNote}
                              </p>
                            </div>
                          ) : (
                            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 md:p-5">
                              <p className="text-sm text-gray-400">
                                {report.status === "PENDING"
                                  ? "ยังไม่มีการตรวจสอบเรื่องนี้"
                                  : report.status === "REVIEWING"
                                    ? "Admin กำลังตรวจสอบเรื่องนี้"
                                    : "ยังไม่มีข้อความตอบกลับ"}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* FOOTER */}
                        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <span className="text-xs text-gray-400">
                            อัปเดตล่าสุด {formatDate(report.updatedAt)}
                          </span>

                          <span
                            className={`
                          inline-flex
                          items-center
                          justify-center
                          gap-1.5
                          px-4
                          py-2
                          rounded-full
                          border
                          text-xs
                          font-semibold
                          ${statusConfig.className}
                        `}
                          >
                            <StatusIcon size={14} />
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrderReports;
