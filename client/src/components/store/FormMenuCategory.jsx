import { useState, useEffect } from "react";
import {
  createCatagory,
  removeCatagory,
  updateCatagory,
} from "../../api/StoreMenuCategory";
import usefoodDelivery from "../../globalState/fooddeliveryStore";
import Swal from "sweetalert2";
import { Plus, Pencil, Trash2, Check, X, Search } from "lucide-react";

const FormMenuCategory = () => {
  const token = usefoodDelivery((state) => state.token);
  const categories = usefoodDelivery((state) => state.catagories);
  const getCategory = usefoodDelivery((state) => state.getCategory);

  const [nameCate, setname] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const swalButtonColor = "#FF6B35";

  useEffect(() => {
    if (token) getCategory(token);
  }, [token, getCategory]);

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
      setLoading(true);

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
      await Swal.fire({
        icon: "error",
        title: "เพิ่มหมวดหมู่ไม่สำเร็จ",
        text:
          error?.response?.data?.message ||
          "ไม่สามารถเพิ่มหมวดหมู่ได้ กรุณาลองใหม่",
        confirmButtonText: "ตกลง",
        confirmButtonColor: swalButtonColor,
      });
    } finally {
      setLoading(false);
    }
  };

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
      await removeCatagory(token, id);
      await getCategory(token);

      await Swal.fire({
        icon: "success",
        title: "ลบหมวดหมู่สำเร็จ",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
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

  const handleEdit = (item) => {
    setEditId(item.id);
    setEditName(item.nameCate);
  };

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
      setLoading(true);

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
      await Swal.fire({
        icon: "error",
        title: "แก้ไขหมวดหมู่ไม่สำเร็จ",
        text:
          error?.response?.data?.message ||
          "ไม่สามารถแก้ไขหมวดหมู่ได้ กรุณาลองใหม่",
        confirmButtonText: "ตกลง",
        confirmButtonColor: swalButtonColor,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditName("");
  };

  const filteredCategories = categories.filter((item) =>
    (item.nameCate || "")
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24 sm:p-6">
      <div className="mx-auto max-w-5xl">
        {/* หัวข้อ */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            จัดการหมวดหมู่เมนู
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            เพิ่ม แก้ไข และลบหมวดหมู่เมนูอาหาร
          </p>
        </div>

        {/* เพิ่มหมวดหมู่ */}
        <section className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-gray-800">
            เพิ่มหมวดหมู่
          </h2>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <input
              value={nameCate}
              onChange={(e) => setname(e.target.value)}
              maxLength={100}
              className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              placeholder="กรอกชื่อหมวดหมู่ เช่น เครื่องดื่ม"
            />

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#FF6B35] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#E8491D] disabled:opacity-60"
            >
              <Plus size={18} />
              เพิ่มหมวดหมู่
            </button>
          </form>
        </section>

        {/* รายการหมวดหมู่ */}
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-gray-800">
                รายการหมวดหมู่
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                ทั้งหมด {categories.length} หมวดหมู่
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-orange-500"
                placeholder="ค้นหาหมวดหมู่..."
              />
            </div>
          </div>

          {filteredCategories.length === 0 ? (
            <div className="border-t border-gray-100 py-10 text-center text-sm text-gray-500">
              {categories.length === 0
                ? "ยังไม่มีหมวดหมู่เมนูอาหาร"
                : "ไม่พบหมวดหมู่ที่ค้นหา"}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredCategories.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  {editId === item.id ? (
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      maxLength={100}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleUpdate(item.id);
                        }
                        if (e.key === "Escape") {
                          handleCancelEdit();
                        }
                      }}
                      className="min-w-0 flex-1 rounded-lg border border-orange-400 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-orange-400"
                    />
                  ) : (
                    <div className="min-w-0">
                      <p className="break-words font-medium text-gray-800">
                        {item.nameCate}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        หมวดหมู่เมนูอาหาร
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {editId === item.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdate(item.id)}
                          disabled={loading}
                          className="flex items-center justify-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-60"
                        >
                          <Check size={16} />
                          บันทึก
                        </button>

                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                        >
                          <X size={16} />
                          ยกเลิก
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
                        >
                          <Pencil size={15} />
                          แก้ไข
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemove(item.id)}
                          className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={15} />
                          ลบ
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default FormMenuCategory;