import { useRef, useState, useEffect } from "react";

import {
  Upload,
  X,
  ShieldCheck,
  ImagePlus,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import Resizer from "react-image-file-resizer";
import Swal from "sweetalert2";

import usefoodDelivery from "../../globalState/fooddeliveryStore";

import {
  uploadFilesVerify,
  removeFilesVerify,
} from "../../api/createStore";

const FormVerifyStore = () => {
  const token = usefoodDelivery((state) => state.token);
  const stores = usefoodDelivery((state) => state.stores);
  const getStore = usefoodDelivery((state) => state.getStore);

  const inputRef = useRef(null);

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // ==========================================
  // โหลดข้อมูลร้าน
  // ==========================================
  useEffect(() => {
    if (token) {
      getStore(token);
    }
  }, [token, getStore]);

  // ==========================================
  // รูป Verify ที่อัปโหลดแล้ว
  // ==========================================
  const verifyImages =
    stores?.images?.filter((image) =>
      image.public_id?.startsWith("Verify2026"),
    ) || [];

  // ==========================================
  // เลือกรูป
  // ==========================================
  const handleSelectImages = (event) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    const invalidFile = files.find(
      (file) => !file.type.startsWith("image/"),
    );

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

    const largeFile = files.find(
      (file) => file.size > 10 * 1024 * 1024,
    );

    if (largeFile) {
      Swal.fire({
        icon: "warning",
        title: "ไฟล์มีขนาดใหญ่เกินไป",
        text: "รูปภาพต้องมีขนาดไม่เกิน 10 MB",
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

  // ==========================================
  // ลบรูปที่ยังไม่ได้อัปโหลด
  // ==========================================
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

  // ==========================================
  // Resize Image
  // ==========================================
  const resizeImage = (file) => {
    return new Promise((resolve, reject) => {
      try {
        Resizer.default.imageFileResizer(
          file,
          1000,
          1000,
          "JPEG",
          100,
          0,
          (data) => resolve(data),
          "base64",
        );
      } catch (error) {
        reject(error);
      }
    });
  };

  // ==========================================
  // Upload รูป Verify
  // ==========================================
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

      for (let index = 0; index < images.length; index++) {
        const image = images[index];

        const data = await resizeImage(image.file);

        console.log(
          `กำลังอัปโหลดรูปยืนยันตัวตน ${index + 1}/${images.length}`,
        );

        await uploadFilesVerify(token, data);
      }

      await getStore(token);

      images.forEach((image) => {
        if (image.preview) {
          URL.revokeObjectURL(image.preview);
        }
      });

      setImages([]);

      await Swal.fire({
        icon: "success",
        title: "อัปโหลดสำเร็จ",
        text: "อัปโหลดรูปยืนยันตัวตนสำเร็จ",
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
          "อัปโหลดรูปยืนยันตัวตนไม่สำเร็จ",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#FF6B35",
      });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ลบรูป Verify ที่อัปโหลดแล้ว
  // ==========================================
  const handleRemoveVerifyImage = async (image) => {
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
        text: "ลบรูปยืนยันตัวตนสำเร็จ",
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
          "ลบรูปไม่สำเร็จ",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#FF6B35",
      });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Cleanup Preview
  // ==========================================
  useEffect(() => {
    return () => {
      images.forEach((image) => {
        if (image.preview) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-5 pb-20">
      <div className="mx-auto max-w-xl space-y-6">
        {/* HEADER */}
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100">
              <ShieldCheck size={30} className="text-orange-500" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-[#2A1B12]">
                ยืนยันตัวตนร้าน
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                เพิ่มรูปสำหรับให้ผู้ดูแลระบบตรวจสอบ
              </p>
            </div>
          </div>
        </div>

        {/* STATUS */}
        <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={22}
              className="mt-0.5 text-yellow-600"
            />

            <div>
              <p className="font-bold text-yellow-700">
                รอการตรวจสอบ
              </p>

              <p className="mt-1 text-sm text-yellow-700/80">
                กรุณาเพิ่มรูปยืนยันตัวตนให้ครบถ้วน
                เพื่อให้ผู้ดูแลระบบตรวจสอบร้านของคุณ
              </p>
            </div>
          </div>
        </div>

        {/* GUIDE */}
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">
            รูปที่ต้องเตรียม
          </h2>

          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex gap-3">
              <span className="font-bold text-orange-500">1.</span>
              <p>รูปบัตรหรือเอกสารที่ใช้สำหรับยืนยันตัวตน</p>
            </div>

            <div className="flex gap-3">
              <span className="font-bold text-orange-500">2.</span>
              <p>รูปต้องเห็นข้อมูลชัดเจน ไม่เบลอ</p>
            </div>

            <div className="flex gap-3">
              <span className="font-bold text-orange-500">3.</span>
              <p>สามารถเพิ่มได้มากกว่า 1 รูป</p>
            </div>

            <div className="flex gap-3">
              <span className="font-bold text-orange-500">4.</span>
              <p>
                รูปที่อัปโหลดในหน้านี้ใช้สำหรับยืนยันตัวตนร้านเท่านั้น
              </p>
            </div>
          </div>
        </div>

        {/* UPLOAD */}
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">รูปยืนยันตัวตน</h2>

              <p className="mt-1 text-sm text-gray-400">
                เลือกรูปภาพที่ต้องการส่งตรวจสอบ
              </p>
            </div>

            <ImagePlus size={28} className="text-orange-500" />
          </div>

          {/* IMPORTANT NOTICE */}
          <div className="mb-5 rounded-2xl border border-orange-200 bg-orange-50 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={21}
                className="mt-0.5 shrink-0 text-orange-500"
              />

              <div>
                <p className="font-bold text-orange-700">
                  ใช้สำหรับยืนยันตัวตนเท่านั้น
                </p>

                <p className="mt-1 text-sm leading-6 text-orange-700/80">
                  รูปภาพที่อัปโหลดในส่วนนี้จะใช้สำหรับตรวจสอบและยืนยันตัวตนของร้านค้าเท่านั้น
                  กรุณาอย่าอัปโหลดรูปเมนู รูปอาหาร รูปหน้าร้าน
                  หรือรูปอื่นที่ไม่เกี่ยวข้องกับการยืนยันตัวตน
                </p>
              </div>
            </div>
          </div>

          {/* SELECT IMAGE BUTTON */}
          <button
            type="button"
            disabled={loading}
            onClick={() => inputRef.current?.click()}
            className="flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50 p-8 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-white">
              <ImagePlus size={28} />
            </div>

            <p className="font-bold text-gray-700">
              เพิ่มรูปยืนยันตัวตน
            </p>

            <p className="mt-1 text-sm text-gray-400">
              คลิกเพื่อเลือกรูปจากเครื่อง
            </p>

            <p className="mt-2 text-xs text-orange-500">
              รองรับเฉพาะรูปภาพสำหรับการยืนยันตัวตน
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

          {/* รูปที่เลือก แต่ยังไม่ Upload */}
          {images.length > 0 && (
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold text-gray-700">
                  รูปที่เลือก
                </p>

                <span className="text-sm text-orange-500">
                  {images.length} รูป
                </span>
              </div>

              <div className="mb-4 rounded-2xl border border-yellow-200 bg-yellow-50 p-3">
                <p className="text-sm leading-6 text-yellow-700">
                  กรุณาตรวจสอบรูปก่อนส่ง
                  รูปเหล่านี้ต้องเป็นเอกสารหรือรูปที่เกี่ยวข้องกับการยืนยันตัวตนร้านเท่านั้น
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className="relative overflow-hidden rounded-2xl border bg-gray-100"
                  >
                    <img
                      src={image.preview}
                      alt={`Preview ${index + 1}`}
                      className="h-48 w-full object-cover"
                    />

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        handleRemoveSelectedImage(image.id)
                      }
                      className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-red-500 disabled:opacity-50"
                    >
                      <X size={18} />
                    </button>

                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-3 py-2 text-xs text-white">
                      รูปที่เลือก {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* รูป Verify ที่ Upload แล้ว */}
          {verifyImages.length > 0 && (
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold text-gray-700">
                  รูปยืนยันตัวตนที่ส่งแล้ว
                </p>

                <span className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle2 size={16} />
                  {verifyImages.length} รูป
                </span>
              </div>

              <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-3">
                <p className="text-sm leading-6 text-green-700">
                  รูปเหล่านี้ถูกส่งให้ผู้ดูแลระบบเพื่อตรวจสอบและยืนยันตัวตนร้านแล้ว
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {verifyImages.map((image, index) => (
                  <div
                    key={image.id || image.public_id || index}
                    className="relative overflow-hidden rounded-2xl border bg-gray-100"
                  >
                    <img
                      src={image.secure_url || image.url}
                      alt={`รูปยืนยันตัวตน ${index + 1}`}
                      className="h-48 w-full object-cover"
                    />

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleRemoveVerifyImage(image)}
                      className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-red-500 disabled:opacity-50"
                    >
                      <X size={18} />
                    </button>

                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-3 py-2 text-xs text-white">
                      รูปยืนยันตัวตน {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EMPTY UPLOADED IMAGE */}
          {verifyImages.length === 0 && images.length === 0 && (
            <div className="mt-5 rounded-2xl bg-gray-50 p-4 text-center">
              <p className="text-sm text-gray-400">
                ยังไม่มีรูปยืนยันตัวตนที่ส่งแล้ว
              </p>
            </div>
          )}

          {/* UPLOAD BUTTON */}
          <button
            type="button"
            disabled={loading || images.length === 0}
            onClick={handleUpload}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 font-bold text-white shadow-lg transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                กำลังอัปโหลด...
              </>
            ) : (
              <>
                <Upload size={20} />
                ส่งรูปเพื่อยืนยันตัวตน
              </>
            )}
          </button>
        </div>

        {/* NOTE */}
        <div className="rounded-2xl bg-gray-100 p-4">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-700">
              หมายเหตุ:
            </span>{" "}
            ข้อมูลและรูปภาพจะถูกใช้สำหรับตรวจสอบและยืนยันตัวตนร้านค้าเท่านั้น
          </p>
        </div>
      </div>
    </div>
  );
};

export default FormVerifyStore;
