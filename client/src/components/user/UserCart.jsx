import { useNavigate } from "react-router-dom";
import { ShoppingCart, Plus, Minus, X } from "lucide-react";
import { getCart, removeCart, updateCart } from "../../api/UserOrder";

const UserCart = ({ token, storeId, cart, setCart, onClose }) => {
  const navigate = useNavigate();

  const reloadCart = async () => {
    try {
      const res = await getCart(token, storeId);
      setCart(res.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setCart(null);
      } else {
        console.log("โหลดตะกร้าไม่สำเร็จ =", error);
      }
    }
  };

  const handleIncrease = async (item) => {
    try {
      await updateCart(token, item.id, {
        count: Number(item.count) + 1,
      });

      await reloadCart();
    } catch (error) {
      console.log("เพิ่มจำนวนไม่สำเร็จ =", error);
      console.log("response =", error.response?.data);
    }
  };

  const handleDecrease = async (item) => {
    try {
      if (Number(item.count) <= 1) {
        await removeCart(token, item.id);
      } else {
        await updateCart(token, item.id, {
          count: Number(item.count) - 1,
        });
      }

      await reloadCart();
    } catch (error) {
      console.log("ลดจำนวนไม่สำเร็จ =", error);
      console.log("response =", error.response?.data);
    }
  };

  const handleRemoveCart = async (item) => {
    try {
      await removeCart(token, item.id);
      await reloadCart();
    } catch (error) {
      console.log("ลบสินค้าไม่สำเร็จ =", error);
    }
  };

  const cartItems = cart?.menus || [];

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h2 className="text-xl font-bold text-[#2A1B12]">ตะกร้าของฉัน</h2>

            <p className="text-sm text-gray-500">
              {cart?.totalItems || 0} รายการ
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ShoppingCart size={50} />

              <p className="mt-3">ยังไม่มีสินค้าในตะกร้า</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => {
                const menu = item.menu;
                const price = Number(item.price || 0);
                const count = Number(item.count || 1);

                let options = [];

                try {
                  options =
                    typeof item.options === "string"
                      ? JSON.parse(item.options)
                      : item.options || [];
                } catch {
                  options = [];
                }

                const totalPrice = price * count;

                return (
                  <div
                    key={item.id}
                    className="border border-orange-100 rounded-2xl p-3"
                  >
                    <div className="flex gap-3">
                      <img
                        src={
                          menu?.images?.[0]?.url ||
                          "https://picsum.photos/100/100"
                        }
                        alt={menu?.menuItem}
                        className="w-20 h-20 rounded-xl object-cover"
                      />

                      <div className="flex-1">
                        <div className="flex justify-between gap-2">
                          <h3 className="font-bold text-[#2A1B12]">
                            {menu?.menuItem || "สินค้า"}
                          </h3>

                          <button
                            onClick={() => handleRemoveCart(item)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X size={18} />
                          </button>
                        </div>

                        {options.length > 0 && (
                          <div className="mt-1 space-y-0.5">
                            {options.map((option, index) => (
                              <p
                                key={index}
                                className="text-xs text-gray-500 flex justify-between"
                              >
                                <span>{option.choiceName || option.name}</span>

                                {Number(option.extraPrice || 0) > 0 && (
                                  <span className="text-orange-500">
                                    +{Number(option.extraPrice).toFixed(2)}
                                  </span>
                                )}
                              </p>
                            ))}
                          </div>
                        )}

                        <p className="text-orange-500 font-bold mt-2">
                          ฿{price.toFixed(2)}
                        </p>

                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() => handleDecrease(item)}
                            className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-orange-50"
                          >
                            <Minus size={15} />
                          </button>

                          <span className="font-bold min-w-5 text-center">
                            {count}
                          </span>

                          <button
                            onClick={() => handleIncrease(item)}
                            className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600"
                          >
                            <Plus size={15} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between mt-3 pt-3 border-t text-sm">
                      <span className="text-gray-500">รวม</span>

                      <span className="font-bold">
                        ฿{totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t p-5">
            <div className="flex justify-between mb-4">
              <span className="text-gray-500">รวมทั้งหมด</span>

              <span className="text-xl font-bold text-orange-500">
                ฿
                {cartItems
                  .reduce((total, item) => {
                    const price = Number(item.price || 0);
                    const count = Number(item.count || 0);

                    return total + price * count;
                  }, 0)
                  .toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => {
                navigate("/user/orderUser", {
                  state: {
                    cartId: cart.cartId,
                    storeId: storeId,
                  },
                });
              }}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold"
            >
              ดำเนินการสั่งซื้อ
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCart;
