import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  QrCode,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import Resizer from "react-image-file-resizer";
import Swal from "sweetalert2";

import usefoodDelivery from "../../globalState/fooddeliveryStore";
import { uploadFilesQR } from "../../api/createStore";

const FormUploadQr = () => {
  const navigate = useNavigate();

  const token = usefoodDelivery((state) => state.token);
  const stores = usefoodDelivery((state) => state.stores);
  const getStore = usefoodDelivery((state) => state.getStore);

  const inputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!token) return;
    getStore(token);
  }, [token, getStore]);

  const paymentImage = stores?.images?.find((image) =>
    image.public_id?.startsWith("StoreQR2026"),
  );

  const paymentImageUrl =
    paymentImage?.secure_url || paymentImage?.url || null;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: "warning",
        title: "ไฟล์ไม่ถูกต้อง",
        text: "กรุณาเลือกรูปภาพ",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#FF6B35",
      });

      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setPreview(reader.result);
    };

    reader.readAsDataURL(file);

    Resizer.default.imageFileResizer(
      file,
      1000,
      1000,
      "JPEG",
      100,
      0,
      async (data) => {
        try {
          setLoading(true);

          await uploadFilesQR(token, data);
          await getStore(token);

          setPreview(null);

          await Swal.fire({
            icon: "success",
            title: "อัปโหลดสำเร็จ",
            text: "บันทึก QR Code สำหรับรับชำระเงินเรียบร้อยแล้ว",
            confirmButtonText: "ตกลง",
            confirmButtonColor: "#FF6B35",
            timer: 1800,
            timerProgressBar: true,
          });
        } catch (error) {
          console.error("Upload QR Error =", error);
          setPreview(null);

          await Swal.fire({
            icon: "error",
            title: "อัปโหลดไม่สำเร็จ",
            text:
              error.response?.data?.message ||
              "ไม่สามารถอัปโหลด QR Code ได้ กรุณาลองใหม่อีกครั้ง",
            confirmButtonText: "ตกลง",
            confirmButtonColor: "#FF6B35",
          });
        } finally {
          setLoading(false);
        }
      },
      "base64",
    );

    e.target.value = "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFCF7] via-[#FFF7EE] to-[#FFF8F0] pb-12">
      {/* HEADER */}
      <header className="sticky top-0 z-20 border-b border-[#F1E5D9] bg-[#FFFCF8]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate("/store/store");
              }
            }}
            aria-label="กลับหน้าก่อนหน้า"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#F1E5D9] bg-white text-[#8A6A54] transition hover:border-[#FF6B35] hover:bg-orange-50 hover:text-[#FF6B35]"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="min-w-0">
            <h1 className="text-xl font-extrabold tracking-tight text-[#2A1B12]">
              การรับชำระเงิน
            </h1>
            <p className="mt-0.5 text-sm text-[#8B8179]">
              ตั้งค่า QR Code สำหรับรับเงินจากลูกค้า
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* PAGE INTRO */}
        <section className="mb-6 rounded-3xl border border-[#F1E5D9] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF0E5] text-[#FF6B35]">
              <QrCode size={25} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#2A1B12]">
                QR Code รับชำระเงิน
              </h2>
              <p className="mt-1 text-sm leading-6 text-[#8B8179]">
                อัปโหลด QR Code ของร้าน เพื่อให้ลูกค้าใช้สแกนชำระเงินค่าอาหาร
                กรุณาตรวจสอบให้แน่ใจว่ารูปชัดเจนและสามารถสแกนได้
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 rounded-2xl bg-[#FFF8F0] px-4 py-3 text-sm text-[#8A6A54]">
            <ShieldCheck size={19} className="shrink-0 text-[#FF6B35]" />
            ใช้ QR Code ที่ถูกต้องสำหรับบัญชีรับเงินของร้านคุณ
          </div>
        </section>

        {/* CURRENT QR */}
        <section className="mb-6 overflow-hidden rounded-3xl border border-[#F1E5D9] bg-white shadow-sm">
          <div className="border-b border-[#F5EAE0] px-5 py-4 sm:px-6">
            <h2 className="font-bold text-[#2A1B12]">
              QR Code ของร้าน
            </h2>
            <p className="mt-1 text-sm text-[#8B8179]">
              {preview
                ? "ตัวอย่างรูปภาพที่เลือก"
                : "รูปภาพที่ลูกค้าจะใช้สำหรับสแกนชำระเงิน"}
            </p>
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-[#F1E5D9] bg-[#FFFCF8] p-4 sm:min-h-[340px]">
              {preview || paymentImageUrl ? (
                <img
                  src={preview || paymentImageUrl}
                  alt="QR Code สำหรับรับชำระเงิน"
                  className="max-h-[360px] max-w-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center px-4 py-10 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF0E5] text-[#FFB184]">
                    <ImageIcon size={32} />
                  </div>
                  <p className="mt-4 font-semibold text-[#5E5046]">
                    ยังไม่ได้เพิ่ม QR Code
                  </p>
                  <p className="mt-1 text-sm text-[#A39A92]">
                    อัปโหลดรูป QR Code เพื่อเริ่มใช้งาน
                  </p>
                </div>
              )}
            </div>

            {paymentImageUrl && !preview && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
                <CheckCircle2 size={18} className="shrink-0" />
                ร้านของคุณมี QR Code สำหรับรับชำระเงินแล้ว
              </div>
            )}

            {preview && (
              <p className="mt-3 text-center text-xs text-[#A39A92]">
                กำลังบันทึกรูปภาพ กรุณารอสักครู่
              </p>
            )}
          </div>
        </section>

        {/* UPLOAD */}
        <section className="rounded-3xl border border-[#F1E5D9] bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4">
            <h2 className="font-bold text-[#2A1B12]">
              {paymentImageUrl ? "เปลี่ยน QR Code" : "เพิ่ม QR Code"}
            </h2>
            <p className="mt-1 text-sm text-[#8B8179]">
              เลือกรูปจากอุปกรณ์ของคุณ
            </p>
          </div>

          <div className="mb-5 rounded-2xl bg-[#FFF8F0] p-4">
            <p className="text-sm font-semibold text-[#8A5537]">
              คำแนะนำก่อนอัปโหลด
            </p>
            <ul className="mt-2 space-y-2 text-sm text-[#8B8179]">
              <li>• เห็น QR Code ครบทั้งรูป ไม่ถูกตัดขอบ</li>
              <li>• ภาพคมชัด ไม่มีแสงสะท้อนหรือสิ่งบัง</li>
              <li>• ตรวจสอบว่าลูกค้าสามารถสแกนได้จริง</li>
            </ul>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => inputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF6B35] px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-[#E8491D] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Upload size={19} />
            {loading
              ? "กำลังอัปโหลด..."
              : paymentImageUrl
                ? "เลือก QR Code รูปใหม่"
                : "อัปโหลด QR Code"}
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </section>
      </main>
    </div>
  );
};

export default FormUploadQr;