import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import usefoodDelivery from "../../globalState/fooddeliveryStore";
import {
  createMenu,
  readMenu,
  updateMenu,
  uploadFilesMenu,
} from "../../api/StoreMenu";

import Resizer from "react-image-file-resizer";
import UploadFile from "./UploadFile";
import { useNavigate, useParams } from "react-router-dom";

const initialState = {
  menuItem: "ข้าวมันไก่",
  categoryId: "",
  description: "อร่อย",
  price: 57,
  images: [],
  options: [
    {
      label: "ความเผ็ด",
      required: true,
      maxRequire: 1,
      choices: [
        { name: "ไม่เผ็ด", extraPrice: 0 },
        { name: "เผ็ดมาก", extraPrice: 5 },
      ],
    },
  ],
};

const FormEditMenu = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = usefoodDelivery((state) => state.token);
  const getCategory = usefoodDelivery((state) => state.getCategory);
  const categories = usefoodDelivery((state) => state.catagories);

  const [form, setform] = useState(initialState);

  useEffect(() => {
    getCategory(token);
    fetchMenu(token, id);
  }, []);

  // =========================
  // ดึงข้อมูลเมนู
  // =========================
  const fetchMenu = async (token, id) => {
    try {
      const res = await readMenu(token, id);

      console.log("ข้อมูลทั้งหมด", res.data);
      console.log("options", res.data.options);

      setform({
        ...res.data,
        imageFile: null,
        imagePreview:
          res.data.images?.[0]?.secure_url || res.data.images?.[0]?.url || null,
      });
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "โหลดข้อมูลเมนูไม่สำเร็จ",
        text: "ไม่สามารถโหลดข้อมูลเมนูได้",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#f97316",
      });
    }
  };

  // =========================
  // เปลี่ยนข้อมูลทั่วไป
  // =========================
  const handleOnChacnge = (e) => {
    console.log(e.target.name, e.target.value);

    setform({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

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
          (data) => {
            resolve(data);
          },
          "base64",
        );
      } catch (error) {
        reject(error);
      }
    });
  };

  // =========================
  // บันทึก
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // ==========================================
      // 1. แก้ไขข้อมูลเมนูก่อน
      // ==========================================

      const res = await updateMenu(token, id, {
        menuItem: form.menuItem,
        categoryId: form.categoryId,
        description: form.description,
        price: Number(form.price),
        options: (form.options || []).map((option) => ({
          label: option.label,
          required: Boolean(option.required),
          maxRequire: Number(option.maxRequire || 1),

          choices: (option.choices || []).map((choice) => ({
            name: choice.name,
            extraPrice: Number(choice.extraPrice || 0),
          })),
        })),
        formatIds: form.formatIds || [],
      });

      console.log("UPDATE MENU =", res.data);

      // ==========================================
      // 2. ถ้ามีเลือกรูปใหม่ -> Upload รูป
      // ==========================================

      if (form.imageFile) {
        console.log("กำลังอัปโหลดรูปใหม่...", {
          menuId: Number(id),
          file: form.imageFile.name,
        });

        const imageData = await resizeImage(form.imageFile);

        const uploadRes = await uploadFilesMenu(token, imageData, Number(id));

        console.log("UPLOAD IMAGE RESPONSE =", uploadRes.data);
      }

      // ==========================================
      // 3. สำเร็จ
      // ==========================================

      await Swal.fire({
        icon: "success",
        title: "แก้ไขเมนูสำเร็จ",
        text: `แก้ไขข้อมูล ${res.data.menu?.menuItem || form.menuItem} สำเร็จ`,
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#f97316",
      });

      navigate("/store/menu");
      
    } catch (error) {
      console.error("UPDATE MENU ERROR =", error);

      Swal.fire({
        icon: "error",
        title: "แก้ไขเมนูไม่สำเร็จ",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "ไม่สามารถแก้ไขเมนูได้",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#f97316",
      });
    }
  };

  // =========================
  // เปลี่ยนข้อมูล Option
  // =========================
  const handleOptionChange = (e, index) => {
    const { name, value, type, checked } = e.target;

    const options = [...form.options];

    options[index] = {
      ...options[index],
      [name]: type === "checkbox" ? checked : value,
    };

    setform({
      ...form,
      options,
    });
  };

  // =========================
  // เปลี่ยนข้อมูล Choice
  // =========================
  const handleChoiceChange = (e, optionIndex, choiceIndex) => {
    const { name, value } = e.target;

    const options = [...form.options];

    options[optionIndex].choices[choiceIndex] = {
      ...options[optionIndex].choices[choiceIndex],
      [name]: value,
    };

    setform({
      ...form,
      options,
    });
  };

  // =========================
  // เพิ่ม Option
  // =========================
  const addOption = () => {
    setform({
      ...form,
      options: [
        ...form.options,
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
        },
      ],
    });
  };

  // =========================
  // ลบ Option
  // =========================
  const removeOption = (optionIndex) => {
    const options = form.options.filter((_, index) => index !== optionIndex);

    setform({
      ...form,
      options,
    });
  };

  // =========================
  // เพิ่ม Choice
  // =========================
  const addChoice = (optionIndex) => {
    const options = [...form.options];

    options[optionIndex] = {
      ...options[optionIndex],
      choices: [
        ...(options[optionIndex].choices || []),
        {
          name: "",
          extraPrice: 0,
        },
      ],
    };

    setform({
      ...form,
      options,
    });
  };

  // =========================
  // ลบ Choice
  // =========================
  const removeChoice = (optionIndex, choiceIndex) => {
    const options = [...form.options];

    options[optionIndex] = {
      ...options[optionIndex],
      choices: options[optionIndex].choices.filter(
        (_, index) => index !== choiceIndex,
      ),
    };

    setform({
      ...form,
      options,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-6xl mx-auto p-5">
        <div className="bg-white rounded-3xl shadow-sm p-6">
          {/* =========================
              Header
          ========================= */}
          <h1 className="text-3xl font-bold text-gray-800 mb-1">
            แก้ไขเมนูอาหาร
          </h1>

          <p className="text-gray-500 mb-8">แก้ไขรายละเอียดเมนูของร้าน</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* =========================
                รูป
            ========================= */}
            <div>
              <label className="block font-semibold mb-3">รูปภาพเมนู</label>

              <UploadFile form={form} setform={setform} menuId={id} />
            </div>

            {/* =========================
                ชื่อเมนู
            ========================= */}
            <div>
              <label className="block font-semibold mb-2">ชื่อเมนู</label>

              <input
                name="menuItem"
                value={form.menuItem || ""}
                onChange={handleOnChacnge}
                className="w-full rounded-2xl border p-4 focus:ring-2 focus:ring-orange-400 outline-none"
                placeholder="เช่น ข้าวกะเพราไก่"
              />
            </div>

            {/* =========================
                หมวดหมู่
            ========================= */}
            <div>
              <label className="block font-semibold mb-2">หมวดหมู่</label>

              <select
                name="categoryId"
                value={form.categoryId || ""}
                onChange={handleOnChacnge}
                className="w-full rounded-2xl border p-4 focus:ring-2 focus:ring-orange-400 outline-none"
              >
                <option value="">เลือกหมวดหมู่</option>

                {categories?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nameCate}
                  </option>
                ))}
              </select>
            </div>

            {/* =========================
                รายละเอียด
            ========================= */}
            <div>
              <label className="block font-semibold mb-2">รายละเอียด</label>

              <textarea
                rows={4}
                name="description"
                value={form.description || ""}
                onChange={handleOnChacnge}
                className="w-full rounded-2xl border p-4 resize-none focus:ring-2 focus:ring-orange-400 outline-none"
                placeholder="รายละเอียดเมนู"
              />
            </div>

            {/* =========================
                ราคา
            ========================= */}
            <div>
              <label className="block font-semibold mb-2">ราคา (บาท)</label>

              <input
                type="number"
                name="price"
                value={form.price || ""}
                onChange={handleOnChacnge}
                className="w-full rounded-2xl border p-4 focus:ring-2 focus:ring-orange-400 outline-none"
              />
            </div>

            {/* =========================
                ตัวเลือกเมนู
            ========================= */}
            <div className="rounded-2xl border bg-white p-5 space-y-5">
              {/* Header Option */}
              <div className="flex justify-between items-center">
                <h2 className="font-bold text-xl">ตัวเลือกเมนู</h2>

                <button
                  type="button"
                  onClick={addOption}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl transition"
                >
                  + เพิ่มหัวข้อ
                </button>
              </div>

              {/* Options */}
              {form.options?.map((option, index) => (
                <div
                  key={index}
                  className="rounded-2xl border bg-orange-50 p-5 space-y-4"
                >
                  {/* =========================
                      Option Header
                  ========================= */}
                  <div className="flex justify-between items-center">
                    <h2 className="font-bold text-lg">ตัวเลือก {index + 1}</h2>

                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="text-red-500 hover:text-red-600 text-sm font-semibold"
                    >
                      ลบหัวข้อ
                    </button>
                  </div>

                  {/* Label */}
                  <input
                    value={option.label || ""}
                    name="label"
                    onChange={(e) => handleOptionChange(e, index)}
                    placeholder="หัวข้อ เช่น ระดับความเผ็ด"
                    className="w-full rounded-xl border p-3"
                  />

                  {/* Required */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={!!option.required}
                      name="required"
                      onChange={(e) => handleOptionChange(e, index)}
                    />

                    <span>จำเป็นต้องเลือก</span>
                  </div>

                  {/* Max Require */}
                  <input
                    type="number"
                    value={option.maxRequire ?? 1}
                    name="maxRequire"
                    min="1"
                    onChange={(e) => handleOptionChange(e, index)}
                    className="w-full rounded-xl border p-3"
                    placeholder="เลือกได้สูงสุด"
                  />

                  {/* =========================
                      Choices
                  ========================= */}
                  <div className="space-y-3">
                    <h3 className="font-semibold">ตัวเลือก</h3>

                    {option.choices?.map((choice, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center"
                      >
                        {/* ชื่อ Choice */}
                        <input
                          value={choice.name || ""}
                          name="name"
                          onChange={(e) => handleChoiceChange(e, index, i)}
                          className="rounded-xl border p-3 min-w-0"
                          placeholder="ชื่อ"
                        />

                        {/* ราคาเพิ่ม */}
                        <input
                          type="number"
                          value={choice.extraPrice ?? 0}
                          name="extraPrice"
                          onChange={(e) => handleChoiceChange(e, index, i)}
                          className="rounded-xl border p-3 min-w-0"
                          placeholder="ราคาเพิ่ม"
                        />

                        {/* ลบ Choice */}
                        <button
                          type="button"
                          onClick={() => removeChoice(index, i)}
                          className="px-3 py-3 rounded-xl bg-red-100 text-red-500 hover:bg-red-200 font-semibold transition"
                        >
                          ลบ
                        </button>
                      </div>
                    ))}

                    {/* =========================
                        เพิ่ม Choice
                    ========================= */}
                    <button
                      type="button"
                      onClick={() => addChoice(index)}
                      className="text-orange-500 hover:text-orange-600 font-semibold text-sm"
                    >
                      + เพิ่มตัวเลือก
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* =========================
                ปุ่มบันทึก
            ========================= */}
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg transition"
            >
              บันทึกการแก้ไข
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormEditMenu;
