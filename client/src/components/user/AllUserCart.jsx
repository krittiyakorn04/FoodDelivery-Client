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
      setCarts([]);
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
        confirmButtonColor: "#F07836",
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
      confirmButtonColor: "#DC4444",
      cancelButtonColor: "#9CA3AF",
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
        confirmButtonColor: "#F07836",
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

  // LOADING
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffefd] animate-pulse">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3 mb-7">
            <div className="w-11 h-11 rounded-2xl bg-orange-100" />
            <div className="space-y-2">
              <div className="h-6 w-36 rounded-lg bg-gray-200" />
              <div className="h-4 w-48 rounded-lg bg-gray-100" />
            </div>
          </div>

          {[1, 2].map((item) => (
            <div
              key={item}
              className="mb-5 rounded-3xl bg-white border border-orange-100/70 p-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-36 rounded bg-gray-200" />
                  <div className="h-3 w-24 rounded bg-gray-100" />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {[1, 2].map((row) => (
                  <div key={row} className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-gray-100" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 w-32 rounded bg-gray-200" />
                      <div className="h-3 w-20 rounded bg-gray-100" />
                      <div className="h-7 w-24 rounded-xl bg-red-50" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 border-t border-gray-100 pt-5">
                <div className="h-12 rounded-2xl bg-orange-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffbfb] pb-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* PAGE HEADER */}
        <div className="mb-7">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-orange-100 flex items-center justify-center">
              <ShoppingCart
                size={22}
                className="text-orange-600"
                strokeWidth={1.8}
              />
            </div>

            <div>
              <h1 className="font-['Kanit'] text-2xl sm:text-3xl font-semibold text-[#2A1B12]">
                ตะกร้าสินค้า
              </h1>

              <p className="text-sm text-gray-400 mt-0.5">
                ตรวจสอบรายการอาหารก่อนสั่งซื้อ
              </p>
            </div>
          </div>
        </div>

        {/* EMPTY CART */}
        {carts.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-orange-100/70">
            <div className="w-20 h-20 rounded-3xl bg-orange-50 flex items-center justify-center mx-auto">
              <ShoppingCart
                size={34}
                className="text-orange-300"
                strokeWidth={1.6}
              />
            </div>

            <h2 className="font-['Kanit'] text-xl font-semibold text-[#2A1B12] mt-5">
              ตะกร้าของคุณยังว่าง
            </h2>

            <p className="text-sm text-gray-400 mt-2">
              เลือกอาหารจากร้านที่คุณชอบแล้วเพิ่มลงตะกร้าได้เลย
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {carts.map((cart) => (
              <div
                key={cart.cartId}
                className="bg-white rounded-3xl border border-orange-100/70 overflow-hidden"
              >
                {/* STORE HEADER */}
                {/* STORE HEADER */}
                <div className="px-5 sm:px-6 py-5 bg-gradient-to-r from-orange-50/80 to-white border-b border-orange-100/70">
                  <div className="flex items-center gap-4">
                    {(() => {
                      const storeImage =
                        cart.store?.images?.find((image) =>
                          String(image.public_id || "").startsWith(
                            "StoreProfile",
                          ),
                        )?.url ||
                        cart.store?.images?.[0]?.url ||
                        "";

                      return (
                        <div className="relative shrink-0">
                          <div className="w-[76px] h-[76px] rounded-2xl overflow-hidden bg-white border-2 border-white shadow-md ring-1 ring-orange-200 flex items-center justify-center">
                            {storeImage ? (
                              <img
                                src={storeImage}
                                alt={cart.store?.storeName || "ร้านอาหาร"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Store
                                size={30}
                                className="text-[#F07836]"
                                strokeWidth={1.8}
                              />
                            )}
                          </div>

                          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full bg-[#F07836] text-white text-[10px] font-medium shadow-sm">
                            ร้านอาหาร
                          </span>
                        </div>
                      );
                    })()}

                    <div className="min-w-0 flex-1 pl-1">
                      <p className="text-[11px] font-medium text-orange-500 mb-1">
                        สั่งอาหารจากร้าน
                      </p>

                      <h2 className="font-['Kanit'] text-lg sm:text-xl font-semibold text-[#2A1B12] truncate">
                        {cart.store?.storeName || "ไม่พบชื่อร้าน"}
                      </h2>

                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1.5">
                        <ShoppingCart size={13} className="text-orange-500" />
                        <span>{cart.totalItems} รายการในตะกร้า</span>
                      </div>
                    </div>

                    <div className="hidden sm:flex w-10 h-10 rounded-xl bg-white border border-orange-100 items-center justify-center shrink-0">
                      <Store size={19} className="text-[#F07836]" />
                    </div>
                  </div>
                </div>

                {/* PRODUCTS */}
                <div className="border-t border-gray-100">
                  {cart.menus.map((item) => (
                    <div
                      key={item.id}
                      className="px-5 sm:px-6 py-4 flex gap-3 sm:gap-4 border-b border-gray-50 last:border-b-0 hover:bg-orange-50/30 transition-colors"
                    >
                      {/* IMAGE */}
                      <div className="w-[76px] h-[76px] sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.menuName || "อาหาร"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart size={24} className="text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* PRODUCT INFO */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-3">
                          <div className="min-w-0">
                            <h3 className="font-medium text-sm sm:text-base text-[#2A1B12] break-words">
                              {item.menuName || "สินค้า"}
                            </h3>

                            <p className="text-xs sm:text-sm text-gray-400 mt-1">
                              จำนวน {item.count}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="font-semibold text-[#2A1B12]">
                              ฿
                              {Number(item.subTotal || 0).toLocaleString(
                                "th-TH",
                                { maximumFractionDigits: 2 },
                              )}
                            </p>

                            <p className="text-xs text-gray-400 mt-1">
                              ฿
                              {Number(item.price || 0).toLocaleString("th-TH", {
                                maximumFractionDigits: 2,
                              })}{" "}
                              / ชิ้น
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
                                  className="px-2 py-1 bg-[#FFF8F0] rounded-lg text-xs text-gray-500"
                                >
                                  {option.choiceName || option.name}
                                </span>
                              ))}
                            </div>
                          )}

                        {/* REMOVE BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleRemove(item)}
                          className="mt-3 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 hover:border-red-200 active:scale-[0.98] transition-all duration-200"
                        >
                          <Trash2 size={14} strokeWidth={2} />
                          <span className="text-xs font-semibold">
                            ลบสินค้า
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* STORE TOTAL */}
                <div className="bg-[#FFFAF6] border-t border-orange-50 px-5 sm:px-6 py-5">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="text-sm font-medium text-[#2A1B12]">
                        ยอดรวมของร้านนี้
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        ยังไม่รวมค่าจัดส่ง
                      </p>
                    </div>

                    <p className="text-xl sm:text-2xl font-semibold text-[#F07836] shrink-0">
                      ฿
                      {Number(cart.cartTotal || 0).toLocaleString("th-TH", {
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  {/* CHECKOUT BUTTON */}
                  <button
                    type="button"
                    onClick={() => handleCheckout(cart)}
                    className="w-full bg-[#F07836] hover:bg-[#E96927] active:scale-[0.99] text-white py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all duration-200"
                  >
                    ดำเนินการสั่งซื้อ
                    <ChevronRight size={19} strokeWidth={2} />
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
