import { useRef, useState, useEffect } from "react";
import {
  Upload,
  X,
  ShieldCheck,
  ImagePlus,
  AlertCircle,
  Loader2,
  CheckCircle2,
  FileCheck2,
  ArrowLeft,
} from "lucide-react";

import Resizer from "react-image-file-resizer";
import Swal from "sweetalert2";

import usefoodDelivery from "../../globalState/fooddeliveryStore";

import { uploadFilesVerify, removeFilesVerify } from "../../api/createStore";
import {   useNavigate } from "react-router-dom";

const FormVerifyStore = () => {
  const Navigate = useNavigate();
  const token = usefoodDelivery((state) => state.token);
  const stores = usefoodDelivery((state) => state.stores);
  const getStore = usefoodDelivery((state) => state.getStore);

  const inputRef = useRef(null);

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (token) {
      getStore(token);
    }
  }, [token, getStore]);

  const verifyImages =
    stores?.images?.filter((image) =>
      image.public_id?.startsWith("Verify2026"),
    ) || [];

  // เลือกรูปยืนยันตัวตน
  const handleSelectImages = (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    const invalidFile = files.find((file) => !file.type.startsWith("image/"));

    if (invalidFile) {
      Swal.fire({
        icon: "warning",
        title: "ไฟล์ไม่ถูกต้อง",
        text: "กรุณาเลือกรูปภาพเท่านั้น",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#FF6B35",
      });

      event.target.value = "";
      return;
    }

    const largeFile = files.find((file) => file.size > 10 * 1024 * 1024);

    if (largeFile) {
      Swal.fire({
        icon: "warning",
        title: "ไฟล์มีขนาดใหญ่เกินไป",
        text: "รูปภาพแต่ละไฟล์ต้องมีขนาดไม่เกิน 10 MB",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#FF6B35",
      });

      event.target.value = "";
      return;
    }

    const newImages = files.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
    event.target.value = "";
  };

  // ลบรูปที่ยังไม่ได้อัปโหลด
  const handleRemoveSelectedImage = (id) => {
    if (loading) return;

    setImages((prev) => {
      const image = prev.find((item) => item.id === id);

      if (image?.preview) {
        URL.revokeObjectURL(image.preview);
      }

      return prev.filter((item) => item.id !== id);
    });
  };

  // ลดขนาดรูปก่อนอัปโหลด
  const resizeImage = (file) =>
    new Promise((resolve, reject) => {
      try {
        Resizer.default.imageFileResizer(
          file,
          1200,
          1200,
          "JPEG",
          85,
          0,
          (data) => resolve(data),
          "base64",
        );
      } catch (error) {
        reject(error);
      }
    });

  // อัปโหลดรูปยืนยันตัวตน
  const handleUpload = async () => {
    if (!token) {
      await Swal.fire({
        icon: "warning",
        title: "ไม่พบข้อมูลการเข้าสู่ระบบ",
        text: "กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#FF6B35",
      });
      return;
    }

    if (images.length === 0) {
      await Swal.fire({
        icon: "warning",
        title: "ยังไม่ได้เลือกรูป",
        text: "กรุณาเลือกรูปยืนยันตัวตนก่อนอัปโหลด",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#FF6B35",
      });
      return;
    }

    try {
      setLoading(true);
      setUploadProgress(0);

      const uploadedImages = [...images];

      for (let index = 0; index < uploadedImages.length; index++) {
        const image = uploadedImages[index];
        const data = await resizeImage(image.file);

        await uploadFilesVerify(token, data);

        setUploadProgress(
          Math.round(((index + 1) / uploadedImages.length) * 100),
        );
      }

      await getStore(token);

      uploadedImages.forEach((image) => {
        if (image.preview) {
          URL.revokeObjectURL(image.preview);
        }
      });

      setImages([]);

      await Swal.fire({
        icon: "success",
        title: "ส่งรูปสำเร็จ",
        text: "อัปโหลดรูปยืนยันตัวตนเรียบร้อยแล้ว",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#FF6B35",
        timer: 1800,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error("Upload Verify Error:", error);

      await Swal.fire({
        icon: "error",
        title: "อัปโหลดไม่สำเร็จ",
        text:
          error.response?.data?.message ||
          "ไม่สามารถอัปโหลดรูปยืนยันตัวตนได้ กรุณาลองใหม่อีกครั้ง",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#FF6B35",
      });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // ลบรูปที่อัปโหลดแล้ว
  const handleRemoveVerifyImage = async (image) => {
    if (loading) return;

    if (!token) {
      await Swal.fire({
        icon: "warning",
        title: "ไม่พบข้อมูลการเข้าสู่ระบบ",
        text: "กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#FF6B35",
      });
      return;
    }

    if (!image?.public_id) {
      await Swal.fire({
        icon: "error",
        title: "ไม่พบข้อมูลรูปภาพ",
        text: "ไม่สามารถลบรูปภาพนี้ได้",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#FF6B35",
      });
      return;
    }

    const result = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบรูปภาพ",
      text: "คุณต้องการลบรูปยืนยันตัวตนนี้ใช่หรือไม่?",
      showCancelButton: true,
      confirmButtonText: "ลบรูปภาพ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#E8491D",
      cancelButtonColor: "#9CA3AF",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);

      await removeFilesVerify(token, image.public_id);
      await getStore(token);

      await Swal.fire({
        icon: "success",
        title: "ลบสำเร็จ",
        text: "ลบรูปยืนยันตัวตนเรียบร้อยแล้ว",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#FF6B35",
        timer: 1800,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error("Remove Verify Error:", error);

      await Swal.fire({
        icon: "error",
        title: "ลบรูปไม่สำเร็จ",
        text:
          error.response?.data?.message ||
          "ไม่สามารถลบรูปได้ กรุณาลองใหม่อีกครั้ง",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#FF6B35",
      });
    } finally {
      setLoading(false);
    }
  };

  // คืนหน่วยความจำของรูปตัวอย่างเมื่อออกจากหน้า
  useEffect(() => {
    return () => {
      images.forEach((image) => {
        if (image.preview) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, [images]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFCF7] via-[#FFF7EE] to-[#FFF8F0] pb-12">
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <button
          type="button"
          onClick={() => {
            Navigate(-1);
          }}
          className="inline-flex mb-6 cursor-pointer items-center gap-2 rounded-full border border-orange-100 bg-white px-4 py-2 text-sm font-medium text-[#8A6A54] shadow-sm transition hover:border-orange-300 hover:text-orange-500"
        >
          <ArrowLeft size={16} />
          กลับหน้าก่อนหน้า
        </button>

        {/* HEADER */}
        <section className="mb-6 rounded-3xl border border-[#F1E5D9] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FFF0E5] text-[#FF6B35]">
              <ShieldCheck size={30} />
            </div>

            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-[#2A1B12] sm:text-2xl">
                ยืนยันตัวตนร้าน
              </h1>
              <p className="mt-1 text-sm leading-6 text-[#8B8179]">
                ส่งเอกสารหรือรูปภาพเพื่อให้ผู้ดูแลระบบตรวจสอบร้านของคุณ
              </p>
            </div>
          </div>
        </section>

        {/* STATUS */}
        <section className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle size={22} className="mt-0.5 shrink-0 text-amber-600" />

            <div>
              <p className="font-bold text-amber-800">
                {verifyImages.length > 0
                  ? "ส่งรูปยืนยันตัวตนแล้ว"
                  : "รอการยืนยันตัวตน"}
              </p>
              <p className="mt-1 text-sm leading-6 text-amber-800/80">
                {verifyImages.length > 0
                  ? "รูปที่ส่งแล้วแสดงอยู่ด้านล่าง คุณสามารถตรวจสอบรูปและลบรูปที่ไม่ต้องการได้"
                  : "กรุณาเพิ่มรูปยืนยันตัวตนที่ชัดเจน เพื่อให้ผู้ดูแลระบบตรวจสอบ"}
              </p>
            </div>
          </div>
        </section>

        {/* GUIDE */}
        <section className="mb-6 rounded-3xl border border-[#F1E5D9] bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-4 font-bold text-[#2A1B12]">รูปที่ต้องเตรียม</h2>

          <div className="space-y-3">
            {[
              "รูปบัตรหรือเอกสารที่ใช้สำหรับยืนยันตัวตน",
              "ภาพชัดเจน อ่านข้อมูลที่จำเป็นได้",
              "สามารถเพิ่มรูปได้มากกว่า 1 รูป",
              "อัปโหลดเฉพาะรูปที่เกี่ยวข้องกับการยืนยันตัวตนร้าน",
            ].map((text, index) => (
              <div key={text} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FFF0E5] text-xs font-bold text-[#FF6B35]">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-[#6F6258]">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* UPLOAD */}
        <section className="rounded-3xl border border-[#F1E5D9] bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF0E5] text-[#FF6B35]">
              <ImagePlus size={23} />
            </div>

            <div>
              <h2 className="font-bold text-[#2A1B12]">รูปยืนยันตัวตน</h2>
              <p className="mt-1 text-sm text-[#8B8179]">
                รองรับไฟล์รูปภาพขนาดไม่เกิน 10 MB ต่อรูป
              </p>
            </div>
          </div>

          <div className="mb-5 rounded-2xl border border-[#F1E5D9] bg-[#FFFCF8] p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={21}
                className="mt-0.5 shrink-0 text-[#FF6B35]"
              />
              <p className="text-sm leading-6 text-[#8A6A54]">
                รูปที่อัปโหลดจะใช้สำหรับตรวจสอบและยืนยันตัวตนร้านค้าเท่านั้น
                กรุณาอย่าอัปโหลดรูปเมนูหรือรูปอาหารในส่วนนี้
              </p>
            </div>
          </div>

          {/* SELECT */}
          <button
            type="button"
            disabled={loading}
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#F0C9AD] bg-[#FFFCF8] p-7 text-center transition hover:border-[#FF6B35] hover:bg-[#FFF7EE] disabled:cursor-not-allowed disabled:opacity-50 sm:p-9"
          >
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF6B35] text-white">
              <ImagePlus size={27} />
            </div>
            <p className="font-bold text-[#2A1B12]">เพิ่มรูปยืนยันตัวตน</p>
            <p className="mt-1 text-sm text-[#8B8179]">
              คลิกเพื่อเลือกรูปจากอุปกรณ์
            </p>
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleSelectImages}
          />

          {/* SELECTED IMAGES */}
          {images.length > 0 && (
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-[#2A1B12]">
                  รูปที่เลือกรอส่ง
                </h3>
                <span className="rounded-full bg-[#FFF0E5] px-3 py-1 text-xs font-semibold text-[#C65325]">
                  {images.length} รูป
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className="relative overflow-hidden rounded-2xl border border-[#F1E5D9] bg-[#FFFCF8]"
                  >
                    <img
                      src={image.preview}
                      alt={`รูปที่เลือกรอส่ง ${index + 1}`}
                      className="h-44 w-full object-contain p-2 sm:h-52"
                    />

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleRemoveSelectedImage(image.id)}
                      aria-label={`ลบรูปที่เลือก ${index + 1}`}
                      className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 text-[#8A6A54] shadow-sm transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      <X size={18} />
                    </button>

                    <div className="border-t border-[#F1E5D9] px-3 py-2 text-xs text-[#8B8179]">
                      รูปที่ {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* UPLOADED IMAGES */}
          {verifyImages.length > 0 && (
            <div className="mt-7 border-t border-[#F1E5D9] pt-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="font-bold text-[#2A1B12]">รูปที่ส่งแล้ว</h3>
                <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  <CheckCircle2 size={14} />
                  {verifyImages.length} รูป
                </span>
              </div>

              <div className="mb-4 rounded-2xl bg-green-50 p-3 text-sm leading-6 text-green-800">
                รูปเหล่านี้ถูกบันทึกไว้แล้ว หากมีรูปที่ไม่ต้องการ สามารถลบออกได้
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {verifyImages.map((image, index) => (
                  <div
                    key={image.id || image.public_id || index}
                    className="relative overflow-hidden rounded-2xl border border-[#F1E5D9] bg-[#FFFCF8]"
                  >
                    <img
                      src={image.secure_url || image.url}
                      alt={`รูปยืนยันตัวตน ${index + 1}`}
                      className="h-44 w-full object-contain p-2 sm:h-52"
                    />

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleRemoveVerifyImage(image)}
                      aria-label={`ลบรูปยืนยันตัวตน ${index + 1}`}
                      className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 text-[#8A6A54] shadow-sm transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      <X size={18} />
                    </button>

                    <div className="flex items-center gap-2 border-t border-[#F1E5D9] px-3 py-2 text-xs text-[#8B8179]">
                      <FileCheck2 size={14} className="text-green-600" />
                      รูปที่ {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EMPTY STATE */}
          {verifyImages.length === 0 && images.length === 0 && (
            <div className="mt-5 rounded-2xl bg-[#FFFCF8] px-4 py-6 text-center">
              <p className="text-sm text-[#A39A92]">
                ยังไม่มีรูปยืนยันตัวตนที่ส่งแล้ว
              </p>
            </div>
          )}

          {/* UPLOAD PROGRESS */}
          {loading && (
            <div className="mt-5 rounded-2xl border border-[#F1E5D9] bg-[#FFFCF8] p-4">
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 font-medium text-[#8A6A54]">
                  <Loader2 size={17} className="animate-spin" />
                  กำลังส่งรูป...
                </span>
                <span className="font-semibold text-[#FF6B35]">
                  {uploadProgress}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-[#F1E5D9]">
                <div
                  className="h-full rounded-full bg-[#FF6B35] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* UPLOAD BUTTON */}
          <button
            type="button"
            disabled={loading || images.length === 0}
            onClick={handleUpload}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF6B35] px-5 py-4 font-bold text-white shadow-sm transition hover:bg-[#E8491D] disabled:cursor-not-allowed disabled:bg-[#D6CEC7]"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                กำลังอัปโหลด {uploadProgress}%
              </>
            ) : (
              <>
                <Upload size={20} />
                ส่งรูปเพื่อยืนยันตัวตน
              </>
            )}
          </button>
        </section>

        {/* NOTE */}
        <div className="mt-5 rounded-2xl border border-[#F1E5D9] bg-white px-4 py-4">
          <p className="text-sm leading-6 text-[#8B8179]">
            <span className="font-semibold text-[#5E5046]">หมายเหตุ:</span>{" "}
            โปรดส่งเฉพาะรูปที่เกี่ยวข้องกับการยืนยันตัวตนร้านค้า
            และตรวจสอบความถูกต้องก่อนอัปโหลด
          </p>
        </div>
      </main>
    </div>
  );
};

export default FormVerifyStore;
