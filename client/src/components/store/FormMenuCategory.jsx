import { useState, useEffect } from "react";
import {
  createCatagory,
  removeCatagory,
  updateCatagory,
} from "../../api/StoreMenuCategory";
import usefoodDelivery from "../../globalState/fooddeliveryStore";
import Swal from "sweetalert2";

const FormMenuCategory = () => {
  const token = usefoodDelivery((state) => state.token);
  const categories = usefoodDelivery((state) => state.catagories);
  const getCategory = usefoodDelivery((state) => state.getCategory);

  const [nameCate, setname] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

  const swalButtonColor = "#FF6B35";

  // =========================
  // โหลดหมวดหมู่
  // =========================

  useEffect(() => {
    if (token) {
      getCategory(token);
    }
  }, [token, getCategory]);

  // =========================
  // เพิ่มหมวดหมู่
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = nameCate.trim();

    if (!trimmedName) {
      await Swal.fire({
        icon: "warning",
        title: "กรุณากรอกชื่อหมวดหมู่",
        confirmButtonText: "ตกลง",
        confirmButtonColor: swalButtonColor,
      });
      return;
    }

    try {
      const res = await createCatagory(token, {
        nameCate: trimmedName,
      });

      setname("");
      await getCategory(token);

      await Swal.fire({
        icon: "success",
        title: "เพิ่มหมวดหมู่สำเร็จ",
        text: `เพิ่ม ${res.data?.nameCate || trimmedName} สำเร็จ`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("เพิ่มหมวดหมู่ไม่สำเร็จ:", error);

      await Swal.fire({
        icon: "error",
        title: "เพิ่มหมวดหมู่ไม่สำเร็จ",
        text:
          error?.response?.data?.message ||
          "ไม่สามารถเพิ่มหมวดหมู่ได้ กรุณาลองใหม่",
        confirmButtonText: "ตกลง",
        confirmButtonColor: swalButtonColor,
      });
    }
  };

  // =========================
  // ลบหมวดหมู่
  // =========================

  const handleRemove = async (id) => {
    const item = categories.find(
      (category) => Number(category.id) === Number(id),
    );

    const result = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบหมวดหมู่",
      text: `ต้องการลบหมวดหมู่ "${item?.nameCate || ""}" หรือไม่?`,
      showCancelButton: true,
      confirmButtonText: "ลบหมวดหมู่",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#E8491D",
      cancelButtonColor: "#6B7280",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      const res = await removeCatagory(token, id);

      await getCategory(token);

      await Swal.fire({
        icon: "success",
        title: "ลบหมวดหมู่สำเร็จ",
        text: `ลบ ${res.data?.name || item?.nameCate || "หมวดหมู่"} สำเร็จ`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("ลบหมวดหมู่ไม่สำเร็จ:", error);

      await Swal.fire({
        icon: "error",
        title: "ลบหมวดหมู่ไม่สำเร็จ",
        text:
          error?.response?.data?.message ||
          "ไม่สามารถลบหมวดหมู่ได้ กรุณาลองใหม่",
        confirmButtonText: "ตกลง",
        confirmButtonColor: swalButtonColor,
      });
    }
  };

  // =========================
  // เริ่มแก้ไข
  // =========================

  const handleEdit = (item) => {
    setEditId(item.id);
    setEditName(item.nameCate);
  };

  // =========================
  // บันทึกการแก้ไข
  // =========================

  const handleUpdate = async (id) => {
    const trimmedName = editName.trim();

    if (!trimmedName) {
      await Swal.fire({
        icon: "warning",
        title: "กรุณากรอกชื่อหมวดหมู่",
        confirmButtonText: "ตกลง",
        confirmButtonColor: swalButtonColor,
      });
      return;
    }

    try {
      await updateCatagory(token, id, {
        nameCate: trimmedName,
      });

      await getCategory(token);

      setEditId(null);
      setEditName("");

      await Swal.fire({
        icon: "success",
        title: "แก้ไขหมวดหมู่สำเร็จ",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("แก้ไขหมวดหมู่ไม่สำเร็จ:", error);

      await Swal.fire({
        icon: "error",
        title: "แก้ไขหมวดหมู่ไม่สำเร็จ",
        text:
          error?.response?.data?.message ||
          "ไม่สามารถแก้ไขหมวดหมู่ได้ กรุณาลองใหม่",
        confirmButtonText: "ตกลง",
        confirmButtonColor: swalButtonColor,
      });
    }
  };

  // =========================
  // ยกเลิกการแก้ไข
  // =========================

  const handleCancelEdit = () => {
    setEditId(null);
    setEditName("");
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="min-h-screen bg-gray-100 p-5 pb-24">
      {/* เพิ่มหมวดหมู่ */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <h2 className="text-xl font-bold mb-4">
          เพิ่มหมวดหมู่
        </h2>

        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            value={nameCate}
            onChange={(e) => setname(e.target.value)}
            className="flex-1 min-w-0 border rounded-xl p-3"
            placeholder="เช่น เครื่องดื่ม"
          />

          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 rounded-xl"
          >
            เพิ่ม
          </button>
        </form>
      </div>

      {/* รายการหมวดหมู่ */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-2xl border p-10 text-center">
          <p className="text-gray-500">
            ยังไม่มีหมวดหมู่เมนูอาหาร
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border shadow-sm p-5"
            >
              {editId === item.id ? (
                <input
                  className="border rounded-lg w-full p-2 mb-4"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleUpdate(item.id);
                    }

                    if (e.key === "Escape") {
                      handleCancelEdit();
                    }
                  }}
                  autoFocus
                />
              ) : (
                <>
                  <h3 className="font-bold text-lg">
                    {item.nameCate}
                  </h3>

                  <p className="text-gray-400 text-sm mb-4">
                    หมวดหมู่เมนูอาหาร
                  </p>
                </>
              )}

              <div className="flex gap-2">
                {editId === item.id ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleUpdate(item.id)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-xl py-2"
                    >
                      บันทึก
                    </button>

                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 rounded-xl py-2"
                    >
                      ยกเลิก
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="flex-1 bg-yellow-400 hover:bg-yellow-500 rounded-xl py-2"
                    >
                      แก้ไข
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2"
                    >
                      ลบ
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormMenuCategory;
