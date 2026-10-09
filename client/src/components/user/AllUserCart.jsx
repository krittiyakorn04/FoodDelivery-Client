import { useEffect, useState } from "react";
import {
  Store,
  ShoppingCart,
  Trash2,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import usefoodDelivery from "../../globalState/fooddeliveryStore";
import { getAllUserCarts, removeCart } from "../../api/UserOrder";

export default function AllUserCart() {
  const navigate = useNavigate();

  const token = usefoodDelivery((state) => state.token);

  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCarts = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await getAllUserCarts(token);

      setCarts(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("โหลดตะกร้าไม่สำเร็จ =", error);

      Swal.fire({
        icon: "error",
        title: "โหลดตะกร้าไม่สำเร็จ",
        text: error?.response?.data?.message || "ไม่สามารถโหลดตะกร้าสินค้าได้",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#f97316",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCarts();
  }, [token]);

  const handleRemove = async (item) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "ลบสินค้า?",
      text: `ต้องการลบ "${item.menuName}" ออกจากตะกร้าหรือไม่`,
      showCancelButton: true,
      confirmButtonText: "ลบสินค้า",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#9ca3af",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await removeCart(token, item.id);
      await loadCarts();
    } catch (error) {
      console.error("ลบสินค้าไม่สำเร็จ =", error);

      Swal.fire({
        icon: "error",
        title: "ลบสินค้าไม่สำเร็จ",
        text: error?.response?.data?.message || "ไม่สามารถลบสินค้าได้",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#f97316",
      });
    }
  };

  const handleCheckout = (cart) => {
    navigate("/user/orderUser", {
      state: {
        cartId: cart.cartId,
        storeId: cart.storeId || cart.store?.id,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F7F9] animate-pulse">
        <div className="mx-auto max-w-6xl px-4 py-8">
          {/* หัวข้อ */}
          <div className="h-8 w-40 rounded-lg bg-gray-200" />

          {/* ร้าน */}
          <div className="mt-6 rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gray-200" />

              <div className="flex-1 space-y-3">
                <div className="h-5 w-48 rounded-lg bg-gray-200" />
                <div className="h-4 w-32 rounded-lg bg-gray-100" />
              </div>
            </div>

            {/* รายการอาหาร */}
            <div className="mt-6 space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-4 border-b border-gray-100 pb-4"
                >
                  {/* รูปอาหาร */}
                  <div className="h-20 w-20 shrink-0 rounded-2xl bg-gray-200" />

                  {/* ข้อมูลอาหาร */}
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-48 rounded-lg bg-gray-200" />
                    <div className="h-4 w-24 rounded-lg bg-gray-100" />

                    <div className="h-4 w-32 rounded-lg bg-gray-100" />
                  </div>

                  {/* จำนวน */}
                  <div className="h-9 w-24 rounded-full bg-gray-200" />
                </div>
              ))}
            </div>
          </div>

          {/* สรุปยอด */}
          <div className="mt-5 rounded-3xl bg-white p-5 shadow-sm">
            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="h-4 w-24 rounded bg-gray-200" />
                <div className="h-4 w-20 rounded bg-gray-200" />
              </div>

              <div className="flex justify-between">
                <div className="h-4 w-24 rounded bg-gray-100" />
                <div className="h-4 w-16 rounded bg-gray-100" />
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between">
                  <div className="h-6 w-24 rounded bg-gray-200" />
                  <div className="h-6 w-28 rounded bg-orange-100" />
                </div>
              </div>

              {/* ปุ่ม */}
              <div className="h-12 w-full rounded-2xl bg-orange-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9] mb-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* PAGE HEADER */}

        <div className="mb-9">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-200">
              <ShoppingCart size={24} className="text-white" />
            </div>

            <div>
              <h1 className="font-['Kanit'] text-2xl sm:text-3xl font-bold text-[#241A15]">
                ตะกร้าสินค้า
              </h1>

              <p className="text-sm text-gray-500 mt-0.5">
                แต่ละร้านจะแยกเป็นคนละออเดอร์
              </p>
            </div>
          </div>
        </div>

        {/* EMPTY */}

        {carts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
            <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mx-auto">
              <ShoppingCart size={36} className="text-orange-300" />
            </div>

            <h2 className="font-['Kanit'] text-xl font-bold text-[#241A15] mt-5">
              ตะกร้าของคุณยังว่าง
            </h2>

            <p className="text-sm text-gray-400 mt-1">
              เลือกอาหารจากร้านที่คุณชอบแล้วเพิ่มลงตะกร้าได้เลย
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {carts.map((cart) => (
              <div
                key={cart.cartId}
                className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden"
              >
                {/* STORE HEADER */}

                <div className="px-5 sm:px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
                        <Store size={22} className="text-orange-500" />
                      </div>

                      <div className="min-w-0">
                        <h2 className="font-['Kanit'] text-lg font-bold text-[#241A15] truncate">
                          {cart.store?.storeName || "ไม่พบชื่อร้าน"}
                        </h2>

                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                          <MapPin size={12} />

                          <span>{cart.totalItems} รายการ</span>
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:block">
                      <span className="px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold">
                        {cart.totalItems} รายการ
                      </span>
                    </div>
                  </div>
                </div>

                {/* PRODUCTS */}

                <div className="border-t border-gray-100">
                  {cart.menus.map((item) => (
                    <div
                      key={item.id}
                      className="px-5 sm:px-6 py-4 flex gap-4 hover:bg-gray-50/70 transition"
                    >
                      {/* IMAGE */}

                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.menuName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart size={25} className="text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* PRODUCT INFO */}

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-[#241A15] truncate">
                              {item.menuName}
                            </h3>

                            <p className="text-sm text-gray-400 mt-1">
                              จำนวน {item.count}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="font-bold text-[#241A15]">
                              ฿{Number(item.subTotal || 0).toLocaleString()}
                            </p>

                            <p className="text-xs text-gray-400 mt-1">
                              ฿{Number(item.price || 0).toLocaleString()} / ชิ้น
                            </p>
                          </div>
                        </div>

                        {/* OPTIONS */}

                        {Array.isArray(item.options) &&
                          item.options.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {item.options.map((option, index) => (
                                <span
                                  key={option.choiceId || index}
                                  className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-500"
                                >
                                  {option.choiceName || option.name}
                                </span>
                              ))}
                            </div>
                          )}

                        {/* REMOVE */}

                        <button
                          type="button"
                          onClick={() => handleRemove(item)}
                          className="mt-3 text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition"
                        >
                          <Trash2 size={13} />
                          ลบสินค้า
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* STORE TOTAL */}

                <div className="bg-[#FAFAFA] border-t border-gray-100 px-5 sm:px-6 py-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500">ยอดรวมของร้านนี้</p>

                      <p className="text-xs text-gray-400 mt-0.5">
                        ยังไม่รวมค่าจัดส่ง
                      </p>
                    </div>

                    <p className="text-2xl font-bold text-orange-500">
                      ฿{Number(cart.cartTotal || 0).toLocaleString()}
                    </p>
                  </div>

                  {/* CHECKOUT */}

                  <button
                    type="button"
                    onClick={() => handleCheckout(cart)}
                    className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-sm shadow-orange-200 transition"
                  >
                    ดำเนินการสั่งซื้อ
                    <ChevronRight size={19} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
