import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  QrCode,
  Upload,
  Image as ImageIcon,
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

  // =====================================================
  // โหลดข้อมูลร้าน
  // =====================================================
  useEffect(() => {
    if (!token) return;

    getStore(token);
  }, [token, getStore]);

  // =====================================================
  // หา QR Code ของร้าน
  // =====================================================
  const paymentImage = stores?.images?.find((image) =>
    image.public_id?.startsWith("StoreQR2026"),
  );

  const paymentImageUrl =
    paymentImage?.secure_url || paymentImage?.url || null;

  // =====================================================
  // เลือกรูป QR
  // =====================================================
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

    // =====================================================
    // Preview
    // =====================================================
    const reader = new FileReader();

    reader.onloadend = () => {
      setPreview(reader.result);
    };

    reader.readAsDataURL(file);

    // =====================================================
    // Resize + Upload
    // =====================================================
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

          // โหลดข้อมูลร้านใหม่
          await getStore(token);

          // แสดงรูปจริงจากฐานข้อมูล
          setPreview(null);

          await Swal.fire({
            icon: "success",
            title: "อัปโหลดสำเร็จ",
            text: "อัปโหลด QR Code สำเร็จ",
            confirmButtonText: "ตกลง",
            confirmButtonColor: "#FF6B35",
            timer: 1800,
            timerProgressBar: true,
          });
        } catch (error) {
          console.error("Upload QR Error =", error);

          // ถ้าอัปโหลดไม่สำเร็จ เอา preview ออก
          setPreview(null);

          await Swal.fire({
            icon: "error",
            title: "อัปโหลดไม่สำเร็จ",
            text:
              error.response?.data?.message ||
              "อัปโหลด QR Code ไม่สำเร็จ",
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER */}
      <div className="sticky top-0 z-20 border-b bg-white">
        <div className="mx-auto flex max-w-xl items-center gap-4 px-5 py-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-500 transition hover:bg-orange-100"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-lg font-bold text-gray-800">
              การรับชำระเงิน
            </h1>

            <p className="text-xs text-gray-400">
              อัปโหลด QR Code สำหรับรับชำระเงิน
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-xl px-5 py-6">
        {/* INFO */}
        <div className="mb-5 flex gap-3 rounded-2xl border border-orange-100 bg-orange-50 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white">
            <QrCode size={22} />
          </div>

          <div>
            <h2 className="font-bold text-gray-800">
              QR Code การรับชำระเงิน
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              ลูกค้าจะใช้ QR Code นี้สำหรับชำระเงินค่าอาหาร
            </p>
          </div>
        </div>

        {/* QR EXAMPLE */}
        <div className="mb-5 overflow-hidden rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="font-bold text-gray-800">
              ตัวอย่างการรับชำระเงินของคุณ
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              กรุณาอัปโหลดรูป QR Code ที่เห็น QR ชัดเจนและไม่มีสิ่งอื่นบัง
            </p>
          </div>

          <div className="flex items-center justify-center rounded-2xl bg-gray-50 p-5">
            {paymentImageUrl ? (
              <img
                src={paymentImageUrl}
                alt="QR Code ร้าน"
                className="h-full max-h-[400px] w-full object-contain p-4"
              />
            ) : (
              <div className="flex min-h-[250px] flex-col items-center justify-center text-center">
                <ImageIcon
                  size={48}
                  className="mb-3 text-gray-300"
                />

                <p className="font-medium text-gray-500">
                  ยังไม่มี QR Code
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  กรุณาอัปโหลด QR Code ด้านล่าง
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 rounded-xl bg-orange-50 p-4">
            <p className="text-sm font-semibold text-orange-700">
              รูปที่ควรอัปโหลด
            </p>

            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              <li>✓ QR Code ต้องเห็นครบทั้งรูป</li>
              <li>✓ รูปต้องชัด สามารถสแกนได้</li>
              <li>✓ แนะนำให้ใช้รูปทรงสี่เหลี่ยม</li>
              <li>✓ ไม่ควรมีข้อความหรือรูปภาพบัง QR Code</li>
            </ul>
          </div>
        </div>

        {/* QR IMAGE */}
        <div className="overflow-hidden rounded-3xl border bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-800">
                รูป QR Code ของร้าน
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                แนะนำรูปภาพที่ชัดเจนและสแกนได้ง่าย
              </p>
            </div>

            <QrCode size={28} className="text-orange-500" />
          </div>

          {/* IMAGE PREVIEW / STORE QR */}
          <div className="flex min-h-[300px] items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
            {preview ? (
              <img
                src={preview}
                alt="QR Preview"
                className="h-full max-h-[400px] w-full object-contain p-4"
              />
            ) : paymentImageUrl ? (
              <img
                src={paymentImageUrl}
                alt="QR Code ร้าน"
                className="h-full max-h-[400px] w-full object-contain p-4"
              />
            ) : (
              <div className="p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                  <ImageIcon size={30} />
                </div>

                <p className="mt-4 font-medium text-gray-500">
                  ยังไม่มี QR Code
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  กดปุ่มด้านล่างเพื่ออัปโหลด QR Code
                </p>
              </div>
            )}
          </div>

          {/* IMAGE STATUS */}
          {paymentImageUrl && !preview && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-700">
              <span>✓</span>

              <span>
                ร้านของคุณมี QR Code สำหรับรับชำระเงินแล้ว
              </span>
            </div>
          )}

          {/* UPLOAD BUTTON */}
          <button
            type="button"
            disabled={loading}
            onClick={() => inputRef.current?.click()}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Upload size={20} />

            {loading
              ? "กำลังอัปโหลด..."
              : paymentImageUrl
                ? "เปลี่ยน QR Code"
                : "อัปโหลด QR Code"}
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default FormUploadQr;
