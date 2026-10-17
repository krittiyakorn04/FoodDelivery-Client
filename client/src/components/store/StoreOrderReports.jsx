import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileWarning,
  RefreshCw,
  XCircle,
  ChevronDown,
  ChevronUp,
  ReceiptText,
  User,
  CalendarDays,
  ArrowLeft,
} from "lucide-react";
import Swal from "sweetalert2";

import usefoodDelivery from "../../globalState/fooddeliveryStore";
import {
  getStoreOrderReports,
  updateStoreOrderReport,
} from "../../api/StoreReport";

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
    icon: Clock3,
  },

  REVIEWING: {
    label: "กำลังตรวจสอบ",
    className: "bg-blue-50 text-blue-600 border-blue-200",
    icon: RefreshCw,
  },

  RESOLVED: {
    label: "ดำเนินการแล้ว",
    className: "bg-green-50 text-green-600 border-green-200",
    icon: CheckCircle2,
  },

  REJECTED: {
    label: "ไม่รับเรื่อง",
    className: "bg-red-50 text-red-600 border-red-200",
    icon: XCircle,
  },
};

const StoreOrderReports = () => {
  const navigate = useNavigate();

  const tokenFromStore = usefoodDelivery((state) => state.token);

  const token =
    tokenFromStore ||
    localStorage.getItem("token") ||
    localStorage.getItem("storeToken");

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

      const res = await getStoreOrderReports(token);

      setReports(res.data?.reports || []);
    } catch (error) {
      console.error("LOAD STORE ORDER REPORTS ERROR =", error);

      Swal.fire({
        icon: "error",
        title: "โหลดข้อมูลไม่สำเร็จ",
        text:
          error.response?.data?.message || "ไม่สามารถโหลดเรื่องแจ้งปัญหาได้",
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
        icon: FileWarning,
      }
    );
  };

  // =====================================================
  // เปลี่ยนสถานะเรื่องแจ้งปัญหา
  // =====================================================
  const handleUpdateReport = async (reportId, status) => {
    if (!token) return;

    const statusConfig = STATUS_CONFIG[status];

    const result = await Swal.fire({
      icon: "question",
      title: "เปลี่ยนสถานะเรื่องแจ้งปัญหา?",
      text: `ต้องการเปลี่ยนสถานะเป็น "${statusConfig?.label || status}" ใช่หรือไม่`,
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#FF6B35",
      cancelButtonColor: "#9CA3AF",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      const res = await updateStoreOrderReport(token, reportId, status);

      const updatedReport = res.data?.report;

      setReports((prev) =>
        prev.map((item) =>
          item.id === reportId
            ? {
                ...item,
                status: updatedReport?.status || status,
                updatedAt: updatedReport?.updatedAt || new Date().toISOString(),
              }
            : item,
        ),
      );

      await Swal.fire({
        icon: "success",
        title: "อัปเดตเรียบร้อย",
        text: "เปลี่ยนสถานะเรื่องแจ้งปัญหาแล้ว",
        confirmButtonColor: "#FF6B35",
      });
    } catch (error) {
      console.error("UPDATE STORE ORDER REPORT ERROR =", error);

      Swal.fire({
        icon: "error",
        title: "อัปเดตไม่สำเร็จ",
        text:
          error.response?.data?.message ||
          "ไม่สามารถอัปเดตสถานะเรื่องแจ้งปัญหาได้",
        confirmButtonColor: "#FF6B35",
      });
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-orange-100 p-8 text-center max-w-md w-full">
          <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />

          <h1 className="text-xl font-bold text-gray-800">
            กรุณาเข้าสู่ระบบร้านค้า
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] px-4 py-6 md:px-8">
      <div className="max-w-5xl  mx-auto">
        <button
          type="button"
          onClick={() => {
            navigate(-1);
          }}
          className="inline-flex mb-6 cursor-pointer items-center gap-2 rounded-full border border-orange-100 bg-white px-4 py-2 text-sm font-medium text-[#8A6A54] shadow-sm transition hover:border-orange-300 hover:text-orange-500"
        >
          <ArrowLeft size={16} />
          กลับหน้าก่อนหน้า
        </button>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FF6B35] to-[#E8491D] rounded-[2rem] p-6 md:p-8 mb-6 shadow-lg shadow-orange-100">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <FileWarning className="text-white" size={25} />
                </div>

                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">
                    เรื่องแจ้งปัญหาออเดอร์
                  </h1>

                  <p className="text-white/80 text-sm mt-1">
                    รายการปัญหาที่ลูกค้าแจ้งเกี่ยวกับออเดอร์ของร้าน
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={loadReports}
              disabled={loading}
              className="
                w-11 h-11
                md:w-auto md:h-auto
                md:px-4 md:py-2.5
                rounded-2xl
                bg-white/15
                border border-white/20
                text-white
                flex items-center justify-center gap-2
                hover:bg-white/25
                transition
              "
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />

              <span className="hidden md:block">รีเฟรช</span>
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-white rounded-3xl p-6 animate-pulse"
              >
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && reports.length === 0 && (
          <div className="bg-white rounded-[2rem] border border-orange-100 p-12 text-center">
            <div className="w-20 h-20 rounded-3xl bg-orange-50 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={38} className="text-orange-500" />
            </div>

            <h2 className="text-xl font-bold text-gray-800">
              ยังไม่มีเรื่องแจ้งปัญหา
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              หากลูกค้าแจ้งปัญหาเกี่ยวกับออเดอร์ รายการจะแสดงที่หน้านี้
            </p>
          </div>
        )}

        {/* Reports */}
        {!loading && sortedReports.length > 0 && (
          <div className="space-y-4">
            {sortedReports.map((report) => {
              const statusConfig = getStatusConfig(report.status);
              const StatusIcon = statusConfig.icon;
              const isExpanded = expandedId === report.id;

              return (
                <div
                  key={report.id}
                  className="
                    bg-white
                    rounded-[2rem]
                    border border-orange-100
                    shadow-sm
                    overflow-hidden
                  "
                >
                  {/* Report Header */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : report.id)}
                    className="w-full text-left p-5 md:p-6 hover:bg-orange-50/30 transition"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
                        <ReceiptText size={22} className="text-orange-500" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-800">
                            ออเดอร์ #ORD
                            {String(report.orderId).padStart(4, "0")}
                          </span>

                          <span
                            className={`
                              inline-flex
                              items-center
                              gap-1.5
                              px-3 py-1
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

                        <div className="flex items-center gap-2 mt-2">
                          <User size={15} className="text-orange-500" />

                          <span className="text-sm font-semibold text-gray-700">
                            {report.customer?.username || "ลูกค้า"}
                          </span>
                        </div>

                        <p className="text-sm text-gray-500 mt-1">
                          {REPORT_TYPE_LABELS[report.type] ||
                            report.type ||
                            "ไม่ระบุประเภท"}
                        </p>
                      </div>

                      <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                        {isExpanded ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={14} />
                        แจ้งเมื่อ {formatDate(report.createdAt)}
                      </span>

                      {report.order?.totalPrice != null && (
                        <span>
                          ยอดออเดอร์{" "}
                          {Number(report.order.totalPrice).toLocaleString(
                            "th-TH",
                          )}{" "}
                          บาท
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Detail */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 px-5 pb-6 md:px-6">
                      <div className="pt-5 space-y-5">
                        {/* ดูรายละเอียดออเดอร์ */}
                        <div>
                          <p className="text-sm font-bold text-gray-800 mb-2">
                            ออเดอร์
                          </p>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();

                              navigate(`/store/order-detail/${report.orderId}`);
                            }}
                            className="
                              w-full
                              rounded-2xl
                              bg-orange-50
                              border border-orange-100
                              p-4
                              text-left
                              hover:bg-orange-100
                              transition
                            "
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-bold text-orange-700">
                                  #ORD
                                  {String(report.orderId).padStart(4, "0")}
                                </p>

                                <p className="text-xs text-orange-500 mt-1">
                                  ดูรายละเอียดออเดอร์
                                </p>
                              </div>

                              <ReceiptText
                                size={20}
                                className="text-orange-500"
                              />
                            </div>
                          </button>
                        </div>

                        {/* Problem */}
                        <div>
                          <p className="text-sm font-bold text-gray-800 mb-2">
                            ปัญหาที่ลูกค้าแจ้ง
                          </p>

                          <div className="rounded-2xl bg-orange-50 border border-orange-100 p-4">
                            <p className="text-sm font-semibold text-orange-700">
                              {REPORT_TYPE_LABELS[report.type] ||
                                report.type ||
                                "ไม่ระบุประเภท"}
                            </p>
                          </div>
                        </div>

                        {/* Detail */}
                        <div>
                          <p className="text-sm font-bold text-gray-800 mb-2">
                            รายละเอียด
                          </p>

                          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-6">
                              {report.detail ||
                                "ลูกค้าไม่ได้ระบุรายละเอียดเพิ่มเติม"}
                            </p>
                          </div>
                        </div>

                        {/* Customer */}
                        <div>
                          <p className="text-sm font-bold text-gray-800 mb-2">
                            ข้อมูลลูกค้า
                          </p>

                          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                            <p className="text-sm font-semibold text-gray-700">
                              {report.customer?.username || "-"}
                            </p>

                            {report.customer?.phone && (
                              <p className="text-sm text-gray-500 mt-1">
                                {report.customer.phone}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* เปลี่ยนสถานะ */}
                        <div className="pt-3 border-t border-gray-100">
                          <p className="text-sm font-bold text-gray-800 mb-3">
                            อัปเดตสถานะเรื่องแจ้งปัญหา
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {Object.entries(STATUS_CONFIG).map(
                              ([status, config]) => {
                                const Icon = config.icon;
                                const isCurrentStatus =
                                  report.status === status;

                                return (
                                  <button
                                    key={status}
                                    type="button"
                                    disabled={isCurrentStatus}
                                    onClick={(e) => {
                                      e.stopPropagation();

                                      handleUpdateReport(report.id, status);
                                    }}
                                    className={`
                                      flex items-center justify-center gap-2
                                      rounded-2xl
                                      px-4 py-3
                                      border
                                      text-sm
                                      font-semibold
                                      transition
                                      ${
                                        isCurrentStatus
                                          ? `${config.className} opacity-60 cursor-not-allowed`
                                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                      }
                                    `}
                                  >
                                    <Icon size={17} />
                                    {config.label}

                                    {isCurrentStatus && (
                                      <span className="text-xs">
                                        (ปัจจุบัน)
                                      </span>
                                    )}
                                  </button>
                                );
                              },
                            )}
                          </div>
                        </div>

                        {/* Status */}
                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-4">
                          <span className="text-xs text-gray-400">
                            อัปเดตล่าสุด {formatDate(report.updatedAt)}
                          </span>

                          <span
                            className={`
                              inline-flex
                              items-center
                              gap-1.5
                              px-3 py-1.5
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

export default StoreOrderReports;
