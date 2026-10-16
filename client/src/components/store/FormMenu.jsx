import { useState, useEffect } from "react";
import usefoodDelivery from "../../globalState/fooddeliveryStore";
import {
  createMenu,
  deleteMenu,
  changeMenuAvailability,
  uploadFilesMenu,
  getOptionFormats,
} from "../../api/StoreMenu";

import UploadFile from "./UploadFile";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, Trash2, Plus, FileText } from "lucide-react";
import Swal from "sweetalert2";
import Resizer from "react-image-file-resizer";
import { useNavigate } from "react-router-dom";

const FormMenu = () => {
  const token = usefoodDelivery((state) => state.token);
  const getCategory = usefoodDelivery((state) => state.getCategory);
  const categories = usefoodDelivery((state) => state.catagories);
  const getMenus = usefoodDelivery((state) => state.getMenus);
  const menus = usefoodDelivery((state) => state.menus);
  const navigate = useNavigate();
  // =========================
  // FORM
  // =========================

  const [form, setform] = useState({
    menuItem: "",
    categoryId: "",
    description: "",
    price: "",
    images: [],
    options: [],
    imageFile: null,
    imagePreview: null,
  });

  // =========================
  // FORMAT
  // =========================

  const [optionFormats, setOptionFormats] = useState([]);
  const [loadingFormats, setLoadingFormats] = useState(false);

  // =========================
  // โหลดข้อมูล
  // =========================

  useEffect(() => {
    if (!token) return;

    getCategory(token);
    getMenus(token);
    loadOptionFormats();
  }, [token]);

  // =========================
  // โหลด Format
  // =========================

  const loadOptionFormats = async () => {
    try {
      setLoadingFormats(true);

      const res = await getOptionFormats(token);

      setOptionFormats(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("โหลดรูปแบบตัวเลือกไม่สำเร็จ =", error);

      await Swal.fire({
        icon: "error",
        title: "โหลดรูปแบบตัวเลือกไม่สำเร็จ",
        text:
          error?.response?.data?.message || "ไม่สามารถโหลดรูปแบบตัวเลือกได้",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#FF6B35",
      });
    } finally {
      setLoadingFormats(false);
    }
  };

  // =========================
  // State สำหรับหด/ขยายตัวเลือก
  // =========================

  const [openOptions, setOpenOptions] = useState({});

  // =========================
  // INPUT
  // =========================

  const handleOnChacnge = (e) => {
    setform((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // =========================
  // OPTION CHANGE
  // =========================

  const handleOptionChange = (e, index) => {
    const { name, value, type, checked } = e.target;

    setform((prev) => {
      const options = [...prev.options];

      options[index] = {
        ...options[index],
        [name]: type === "checkbox" ? checked : value,
      };

      return {
        ...prev,
        options,
      };
    });
  };

  // =========================
  // CHOICE CHANGE
  // =========================

  const handleChoiceChange = (e, optionIndex, choiceIndex) => {
    const { name, value } = e.target;

    setform((prev) => {
      const options = [...prev.options];
      const choices = [...options[optionIndex].choices];

      choices[choiceIndex] = {
        ...choices[choiceIndex],
        [name]: value,
      };

      options[optionIndex] = {
        ...options[optionIndex],
        choices,
      };

      return {
        ...prev,
        options,
      };
    });
  };

  // =========================
  // เลือก FORMAT
  // =========================

  const applyFormatToOption = (optionIndex, formatId) => {
    if (!formatId) return;

    const format = optionFormats.find(
      (item) => Number(item.id) === Number(formatId),
    );

    if (!format) return;

    setform((prev) => {
      const options = [...prev.options];

      options[optionIndex] = {
        ...options[optionIndex],
        label: format.name || "",
        required: Boolean(format.required),
        maxRequire: Number(format.maxRequire || 1),
        choices: (format.choices || []).map((choice) => ({
          name: choice.name || "",
          extraPrice: Number(choice.extraPrice || 0),
        })),
        sourceFormatId: format.id,
        sourceFormatName: format.name,
      };

      return {
        ...prev,
        options,
      };
    });

    setOpenOptions((prev) => ({
      ...prev,
      [optionIndex]: true,
    }));
  };

  // =========================
  // CLEAR FORMAT
  // =========================

  const clearSelectedFormat = (optionIndex) => {
    setform((prev) => {
      const options = [...prev.options];

      options[optionIndex] = {
        ...options[optionIndex],
        sourceFormatId: null,
        sourceFormatName: null,
      };

      return {
        ...prev,
        options,
      };
    });
  };

  // =========================
  // TOGGLE AVAILABILITY
  // =========================

  const handleToggleAvailability = async (menu) => {
    try {
      const result = await changeMenuAvailability(token, menu.id);

      await Swal.fire({
        icon: "success",
        title: result.data.menu.isAvailable ? "เปิดเมนูแล้ว" : "ปิดเมนูแล้ว",
        timer: 1200,
        showConfirmButton: false,
      });

      await getMenus(token);
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error?.response?.data?.message || "ไม่สามารถเปลี่ยนสถานะเมนูได้",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#FF6B35",
      });
    }
  };

  // =========================
  // ADD OPTION
  // =========================

  const addOption = () => {
    const newIndex = form.options.length;

    setform((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        {
          label: "",
          required: false,
          maxRequire: 1,
          choices: [
            {
              name: "",
              extraPrice: 0,
            },
          ],
          sourceFormatId: null,
          sourceFormatName: null,
        },
      ],
    }));

    setOpenOptions((prev) => ({
      ...prev,
      [newIndex]: true,
    }));
  };

  // =========================
  // DELETE OPTION
  // =========================

  const deleteOption = async (optionIndex) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบหัวข้อ",
      text: "ต้องการลบหัวข้อตัวเลือกนี้หรือไม่?",
      showCancelButton: true,
      confirmButtonText: "ลบหัวข้อ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#E8491D",
      cancelButtonColor: "#6B7280",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setform((prev) => ({
      ...prev,
      options: prev.options.filter((_, index) => index !== optionIndex),
    }));

    setOpenOptions((prev) => {
      const newState = {};

      Object.keys(prev).forEach((key) => {
        const index = Number(key);

        if (index < optionIndex) {
          newState[index] = prev[index];
        }

        if (index > optionIndex) {
          newState[index - 1] = prev[index];
        }
      });

      return newState;
    });
  };

  // =========================
  // ADD CHOICE
  // =========================

  const addChoice = (optionIndex) => {
    setform((prev) => {
      const options = [...prev.options];

      options[optionIndex] = {
        ...options[optionIndex],
        choices: [
          ...options[optionIndex].choices,
          {
            name: "",
            extraPrice: 0,
          },
        ],
      };

      return {
        ...prev,
        options,
      };
    });
  };

  // =========================
  // DELETE CHOICE
  // =========================

  const deleteChoice = async (optionIndex, choiceIndex) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบตัวเลือก",
      text: "ต้องการลบตัวเลือกนี้หรือไม่?",
      showCancelButton: true,
      confirmButtonText: "ลบตัวเลือก",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#E8491D",
      cancelButtonColor: "#6B7280",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setform((prev) => {
      const options = [...prev.options];

      const choices = options[optionIndex].choices.filter(
        (_, index) => index !== choiceIndex,
      );

      options[optionIndex] = {
        ...options[optionIndex],
        choices,
      };

      return {
        ...prev,
        options,
      };
    });
  };

  // =========================
  // TOGGLE OPTION
  // =========================

  const toggleOption = (index) => {
    setOpenOptions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // =========================
  // RESIZE IMAGE
  // =========================

  const resizeImage = (file) => {
    return new Promise((resolve, reject) => {
      try {
        Resizer.default.imageFileResizer(
          file,
          1200,
          1200,
          "JPEG",
          90,
          0,
          (data) => resolve(data),
          "base64",
        );
      } catch (error) {
        reject(error);
      }
    });
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.menuItem.trim()) {
      await Swal.fire({
        icon: "warning",
        title: "กรุณากรอกชื่อเมนู",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#FF6B35",
      });
      return;
    }

    if (!form.categoryId) {
      await Swal.fire({
        icon: "warning",
        title: "กรุณาเลือกหมวดหมู่",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#FF6B35",
      });
      return;
    }

    if (
      form.price === "" ||
      !Number.isFinite(Number(form.price)) ||
      Number(form.price) <= 0
    ) {
      await Swal.fire({
        icon: "warning",
        title: "กรุณากรอกราคาเมนูให้ถูกต้อง",
        text: "ราคาต้องมากกว่า 0 บาท",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#FF6B35",
      });
      return;
    }

    try {
      const { imageFile, imagePreview, ...menuForm } = form;

      const data = {
        ...menuForm,
        price: Number(form.price),
        categoryId: Number(form.categoryId),
        options: (form.options || []).map((option) => ({
          label: option.label,
          required: Boolean(option.required),
          maxRequire: Math.max(1, Number(option.maxRequire || 1)),
          choices: (option.choices || []).map((choice) => ({
            name: choice.name,
            extraPrice: Number(choice.extraPrice || 0),
          })),
        })),
      };

      const res = await createMenu(token, data);
      const newMenu = res.data?.menu || res.data;
      const menuId = newMenu?.id;

      if (!menuId) {
        throw new Error("สร้างเมนูสำเร็จแต่ไม่พบรหัสเมนู");
      }

      if (imageFile) {
        const imageData = await resizeImage(imageFile);

        await uploadFilesMenu(token, imageData, menuId);
      }

      await getMenus(token);

      setform({
        menuItem: "",
        categoryId: "",
        description: "",
        price: "",
        images: [],
        options: [],
        imageFile: null,
        imagePreview: null,
      });

      setOpenOptions({});

      await Swal.fire({
        icon: "success",
        title: "เพิ่มเมนูสำเร็จ",
        text: `เพิ่มข้อมูล ${newMenu?.menuItem || form.menuItem} สำเร็จ`,
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#FF6B35",
      });
    } catch (error) {
      console.error("Create Menu Error =", error);

      await Swal.fire({
        icon: "error",
        title: "เพิ่มเมนูไม่สำเร็จ",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "เกิดข้อผิดพลาด กรุณาลองใหม่",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#FF6B35",
      });
    }
  };

  // =========================
  // DELETE MENU
  // =========================

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบเมนู",
      text: "คุณต้องการลบเมนูนี้หรือไม่?",
      showCancelButton: true,
      confirmButtonText: "ลบเมนู",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#E8491D",
      cancelButtonColor: "#6B7280",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await deleteMenu(token, id);
      await getMenus(token);

      await Swal.fire({
        icon: "success",
        title: "ลบเมนูสำเร็จ",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Delete Menu Error =", error);

      await Swal.fire({
        icon: "error",
        title: "ลบเมนูไม่สำเร็จ",
        text:
          error?.response?.data?.message || "ไม่สามารถลบเมนูได้ กรุณาลองใหม่",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#FF6B35",
      });
    }
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="min-h-screen bg-gray-50 mb-20">
      <form onSubmit={handleSubmit}>
        <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <h1 className="text-3xl font-bold text-gray-800">เพิ่มเมนูอาหาร</h1>
            <p className="text-gray-500 mt-1">กรอกข้อมูลเมนูของร้าน</p>
          </div>

          {/* ข้อมูลเมนู */}
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-5">ข้อมูลเมนู</h2>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block mb-2 font-medium">ชื่อเมนู</label>
                <input
                  className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  value={form.menuItem}
                  onChange={handleOnChacnge}
                  name="menuItem"
                  placeholder="เช่น ข้าวกะเพราหมู"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-medium">หมวดหมู่</label>

                  <button
                    type="button"
                    onClick={() => navigate("/store/MenuCategory")}
                    className="flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700"
                  >
                    <Plus className="w-4 h-4" />
                    เพิ่มหมวดหมู่
                  </button>
                </div>

                <select
                  className="w-full border rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleOnChacnge}
                >
                  <option value="">เลือกหมวดหมู่</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nameCate}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block mb-2 font-medium">รายละเอียด</label>
                <textarea
                  rows={4}
                  className="w-full border rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
                  value={form.description}
                  onChange={handleOnChacnge}
                  name="description"
                  placeholder="รายละเอียดเมนู"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">ราคา (บาท)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  value={form.price}
                  onChange={handleOnChacnge}
                  name="price"
                  placeholder="เช่น 50"
                />
              </div>
            </div>
          </div>

          {/* รูปภาพ */}
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-5">รูปเมนู</h2>
            <UploadFile form={form} setform={setform} />
          </div>

          {/* ตัวเลือกเมนู */}
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <div className="mb-5">
              <h2 className="text-xl font-bold">ตัวเลือกเมนู</h2>
              <p className="text-sm text-gray-500 mt-1">
                เช่น ความเผ็ด ขนาด หรือท็อปปิ้ง
              </p>
            </div>

            {form.options.length === 0 && (
              <div className="border border-dashed rounded-2xl p-8 text-center text-gray-400 bg-gray-50">
                <div className="text-4xl mb-2">⚙️</div>
                <p className="font-medium">ยังไม่มีตัวเลือก</p>
                <p className="text-sm mt-1">
                  กด "เพิ่มหัวข้อ" ด้านล่างเพื่อเพิ่มตัวเลือก
                </p>
              </div>
            )}

            <div className="space-y-4">
              {form.options.map((option, index) => {
                const isOpen = openOptions[index] !== false;

                return (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-2xl overflow-hidden bg-white"
                  >
                    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-gray-50 border-b">
                      <button
                        type="button"
                        onClick={() => toggleOption(index)}
                        className="flex items-center gap-3 flex-1 text-left"
                      >
                        {isOpen ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                        <div>
                          <p className="font-bold">หัวข้อที่ {index + 1}</p>
                          <p className="text-sm text-gray-500">
                            {option.label || "ยังไม่ได้ตั้งชื่อหัวข้อ"}
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteOption(index)}
                        className="flex items-center gap-1 text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition"
                      >
                        <Trash2 size={17} />
                        <span className="hidden sm:inline">ลบหัวข้อ</span>
                      </button>
                    </div>

                    {isOpen && (
                      <div className="p-5">
                        {/* FORMAT SELECTOR */}
                        <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50 p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <FileText size={18} className="text-orange-500" />
                            <div>
                              <p className="font-bold text-gray-800">
                                เลือกรูปแบบตัวเลือก
                              </p>
                              <p className="text-xs text-gray-500">
                                ข้อมูลที่เลือกจะเข้ามาในกล่องนี้ทันที
                              </p>
                            </div>
                          </div>

                          <select
                            value={option.sourceFormatId || ""}
                            onChange={(e) =>
                              applyFormatToOption(index, e.target.value)
                            }
                            className="w-full border border-orange-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                          >
                            <option value="">
                              {loadingFormats
                                ? "กำลังโหลดรูปแบบ..."
                                : "เลือก Format ที่ต้องการ"}
                            </option>
                            {optionFormats.map((format) => (
                              <option key={format.id} value={format.id}>
                                {format.name}
                              </option>
                            ))}
                          </select>

                          {option.sourceFormatName && (
                            <div className="mt-2 flex items-center justify-between">
                              <p className="text-xs text-orange-600">
                                ใช้ข้อมูลจากรูปแบบ:{" "}
                                <span className="font-semibold">
                                  {option.sourceFormatName}
                                </span>
                              </p>
                              <button
                                type="button"
                                onClick={() => clearSelectedFormat(index)}
                                className="text-xs text-gray-500 hover:text-red-500"
                              >
                                ยกเลิกการเลือก Format
                              </button>
                            </div>
                          )}
                        </div>

                        {/* OPTION SETTINGS */}
                        <div className="grid md:grid-cols-3 gap-4 mb-5">
                          <div>
                            <label className="block mb-2 text-sm font-medium">
                              ชื่อหัวข้อ
                            </label>
                            <input
                              className="w-full border rounded-xl p-3"
                              value={option.label}
                              name="label"
                              onChange={(e) => handleOptionChange(e, index)}
                              placeholder="เช่น ระดับความเผ็ด"
                            />
                          </div>

                          <div className="flex items-center md:justify-center">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                name="required"
                                checked={option.required}
                                onChange={(e) => handleOptionChange(e, index)}
                                className="w-4 h-4 accent-orange-500"
                              />
                              <span className="text-sm">บังคับเลือก</span>
                            </label>
                          </div>

                          <div>
                            <label className="block mb-2 text-sm font-medium">
                              เลือกได้สูงสุด
                            </label>
                            <input
                              type="number"
                              min="1"
                              name="maxRequire"
                              value={option.maxRequire}
                              onChange={(e) => handleOptionChange(e, index)}
                              className="w-full border rounded-xl p-3"
                            />
                          </div>
                        </div>

                        {/* CHOICES */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold">ตัวเลือก</h3>
                            <span className="text-sm text-gray-400">
                              {option.choices.length} รายการ
                            </span>
                          </div>

                          <div className="space-y-3">
                            {option.choices.map((choice, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <div className="flex-1">
                                  <input
                                    className="w-full border rounded-xl p-3"
                                    value={choice.name}
                                    name="name"
                                    onChange={(e) =>
                                      handleChoiceChange(e, index, i)
                                    }
                                    placeholder="ชื่อตัวเลือก เช่น ไม่เผ็ด"
                                  />
                                </div>

                                <div className="w-32 sm:w-40">
                                  <div className="relative">
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      className="w-full border rounded-xl p-3 pr-12"
                                      value={choice.extraPrice}
                                      name="extraPrice"
                                      onChange={(e) =>
                                        handleChoiceChange(e, index, i)
                                      }
                                      placeholder="0"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                                      บาท
                                    </span>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => deleteChoice(index, i)}
                                  className="w-10 h-10 flex items-center justify-center rounded-xl text-red-500 hover:bg-red-50 transition flex-shrink-0"
                                  title="ลบตัวเลือก"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => addChoice(index)}
                            className="mt-4 flex items-center gap-2 text-orange-500 hover:text-orange-600 font-semibold text-sm"
                          >
                            <Plus size={17} />
                            เพิ่มตัวเลือก
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={addOption}
              className="mt-5 w-full flex items-center justify-center gap-2 border-2 border-dashed border-orange-200 bg-orange-50 hover:bg-orange-100 hover:border-orange-300 text-orange-500 px-4 py-3 rounded-xl font-semibold transition"
            >
              <Plus size={18} />
              เพิ่มหัวข้อ
            </button>
          </div>

          {/* SAVE */}
          <div className="sticky bottom-4 z-10">
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg transition"
            >
              บันทึกเมนู
            </button>
          </div>
        </div>
      </form>

      {/* MENU LIST */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 pb-10">
        <hr className="my-8" />

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold">เมนูทั้งหมด</h2>
          <span className="text-gray-500">{menus.length} เมนู</span>
        </div>

        {menus.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border">
            <div className="text-6xl mb-3">🍜</div>
            <h3 className="text-xl font-semibold">ยังไม่มีเมนู</h3>
            <p className="text-gray-500 mt-2">เพิ่มเมนูแรกของร้านได้เลย</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {menus.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border hover:shadow-lg transition overflow-hidden"
              >
                {item.images?.length > 0 ? (
                  <img
                    src={item.images[0].url}
                    alt={item.menuItem}
                    className="w-full h-52 object-cover"
                  />
                ) : (
                  <div className="w-full h-52 bg-gray-100 flex items-center justify-center text-gray-400">
                    ไม่มีรูป
                  </div>
                )}

                <div className="p-5">
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-lg truncate">
                        {item.menuItem}
                      </h3>
                      <p className="text-gray-500 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm whitespace-nowrap">
                      ขาย {item.sold}
                    </span>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <span className="text-2xl font-bold text-orange-500">
                      ฿{item.price}
                    </span>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(item)}
                        className={`px-4 py-2 rounded-xl font-semibold ${
                          item.isAvailable
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : "bg-gray-400 hover:bg-gray-500 text-white"
                        }`}
                      >
                        {item.isAvailable ? "เปิดขาย" : "ปิดขาย"}
                      </button>

                      <Link
                        to={`/store/EditMenu/${item.id}`}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl"
                      >
                        แก้ไข
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl"
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormMenu;
