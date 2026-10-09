import { useState } from "react";
import Swal from "sweetalert2";
import usefoodDelivery from "../../globalState/fooddeliveryStore";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const UserRegister = () => {
  const navigate = useNavigate();

  const actionRegisterUser = usefoodDelivery(
    (state) => state.actionRegisterUser,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    username: "",
  });

  const handleOnChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const roleRedirect = (role) => {
    if (role === "CUSTOMER") {
      navigate("/user/homeUser");
    } else {
      navigate("/");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ตรวจสอบชื่อผู้ใช้
    if (!form.username.trim()) {
      return Swal.fire({
        icon: "warning",
        title: "กรุณากรอกชื่อผู้ใช้",
        confirmButtonColor: "#f97316",
      });
    }

    // ตรวจสอบเบอร์โทรศัพท์
    if (!/^0\d{9}$/.test(form.phone)) {
      return Swal.fire({
        icon: "warning",
        title: "เบอร์โทรศัพท์ไม่ถูกต้อง",
        text: "กรุณากรอกเบอร์โทรศัพท์ 10 หลัก และขึ้นต้นด้วย 0",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#f97316",
      });
    }

    // ตรวจสอบอีเมล
    if (
      !form.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      return Swal.fire({
        icon: "warning",
        title: "อีเมลไม่ถูกต้อง",
        text: "กรุณากรอกอีเมลให้ถูกต้อง",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#f97316",
      });
    }

    // ตรวจสอบรหัสผ่าน
    if (
      form.password.length < 8 ||
      form.password.length > 64 ||
      /\s/.test(form.password) ||
      !/[a-z]/.test(form.password) ||
      !/[A-Z]/.test(form.password) ||
      !/[0-9]/.test(form.password) ||
      !/[^A-Za-z0-9\s]/.test(form.password)
    ) {
      return Swal.fire({
        icon: "warning",
        title: "รหัสผ่านไม่ตรงตามเงื่อนไข",
        text: "ต้องมี 8-64 ตัวอักษร ประกอบด้วยตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก ตัวเลข และอักขระพิเศษ โดยไม่มีช่องว่าง",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#f97316",
      });
    }

    // ตรวจสอบยืนยันรหัสผ่าน
    if (form.password !== form.confirmPassword) {
      return Swal.fire({
        icon: "warning",
        title: "รหัสผ่านไม่ตรงกัน",
        text: "กรุณากรอกรหัสผ่านและยืนยันรหัสผ่านให้ตรงกัน",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#f97316",
      });
    }

    try {
      // ไม่ส่ง confirmPassword และ email ไป Backend
      const { username,email, phone, password } = form;

      const res = await actionRegisterUser({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        phone,
        password,
      });

      await Swal.fire({
        icon: "success",
        title: "สมัครใช้งานสำเร็จ",
        text: "กำลังเข้าสู่หน้าหลัก",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#f97316",
      });

      roleRedirect(res.data.payload.role);
    } catch (error) {
      const errMsg = error.response?.data?.message || "สมัครสมาชิกไม่สำเร็จ";

      Swal.fire({
        icon: "error",
        title: "สมัครสมาชิกไม่สำเร็จ",
        text: errMsg,
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#f97316",
      });

      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-3xl border border-orange-100 shadow-[0_20px_50px_-20px_rgba(42,27,18,0.25)] overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="px-8 py-8 sm:px-10 sm:py-10 md:px-12 md:py-12">
              {/* Header */}
              <div className="text-center mb-7">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  สร้างบัญชีสมาชิก
                </h1>

                <p className="text-sm text-gray-500 mt-2">
                  สมัครสมาชิกเพื่อเริ่มสั่งอาหาร
                </p>
              </div>

              {/* Username */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  ชื่อผู้ใช้
                </label>

                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleOnChange}
                  placeholder="username"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
                />
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  อีเมล
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleOnChange}
                  placeholder="example@email.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
                />
              </div>

              {/* Phone */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  โทรศัพท์
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);

                    setForm({
                      ...form,
                      phone: value,
                    });
                  }}
                  placeholder="089xxxxxxx"
                  maxLength={10}
                  inputMode="numeric"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
                />

                {form.phone.length > 0 && form.phone.length < 10 && (
                  <p className="mt-1 text-xs text-red-500">
                    กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  รหัสผ่าน
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleOnChange}
                    placeholder="********"
                    required
                    maxLength={64}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-500"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <div className="mt-2 space-y-1 text-xs">
                  <p
                    className={
                      form.password.length >= 8
                        ? "text-green-600"
                        : "text-gray-500"
                    }
                  >
                    {form.password.length >= 8 ? "✓" : "○"} ความยาวอย่างน้อย 8
                    ตัวอักษร
                  </p>

                  <p
                    className={
                      /[a-z]/.test(form.password)
                        ? "text-green-600"
                        : "text-gray-500"
                    }
                  >
                    {/[a-z]/.test(form.password) ? "✓" : "○"}{" "}
                    มีตัวอักษรภาษาอังกฤษตัวพิมพ์เล็ก (a-z)
                  </p>

                  <p
                    className={
                      /[A-Z]/.test(form.password)
                        ? "text-green-600"
                        : "text-gray-500"
                    }
                  >
                    {/[A-Z]/.test(form.password) ? "✓" : "○"}{" "}
                    มีตัวอักษรภาษาอังกฤษตัวพิมพ์ใหญ่ (A-Z)
                  </p>

                  <p
                    className={
                      /[0-9]/.test(form.password)
                        ? "text-green-600"
                        : "text-gray-500"
                    }
                  >
                    {/[0-9]/.test(form.password) ? "✓" : "○"} มีตัวเลขอย่างน้อย
                    1 ตัว
                  </p>

                  <p
                    className={
                      /[^A-Za-z0-9\s]/.test(form.password)
                        ? "text-green-600"
                        : "text-gray-500"
                    }
                  >
                    {/[^A-Za-z0-9\s]/.test(form.password) ? "✓" : "○"}{" "}
                    มีอักขระพิเศษ เช่น @ หรือ !
                  </p>

                  <p
                    className={
                      form.password && !/\s/.test(form.password)
                        ? "text-green-600"
                        : "text-gray-500"
                    }
                  >
                    {form.password && !/\s/.test(form.password) ? "✓" : "○"}{" "}
                    ไม่มีช่องว่าง
                  </p>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  ยืนยันรหัสผ่าน
                </label>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleOnChange}
                    placeholder="********"
                    required
                    maxLength={64}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={
                      showConfirmPassword
                        ? "ซ่อนรหัสผ่านที่ยืนยัน"
                        : "แสดงรหัสผ่านที่ยืนยัน"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-500"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* Register */}
              <button
                type="submit"
                className="w-full rounded-xl bg-orange-500 py-3 text-white font-semibold hover:bg-orange-600 active:scale-[0.99] transition"
              >
                สมัครสมาชิก
              </button>

              {/* Login */}
              <p className="text-center mt-6 text-sm text-gray-500">
                มีบัญชีอยู่แล้ว?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/UserLogin")}
                  className="text-orange-500 font-semibold hover:text-orange-600"
                >
                  เข้าสู่ระบบ
                </button>
              </p>
            </div>
          </form>
        </div>
        {/* Bottom text */}
        <p className="text-center text-xs text-gray-400 mt-5">
          © 2026 RobMorFood
        </p>
      </div>
    </div>
  );
};

export default UserRegister;
