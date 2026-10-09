import { useState, useEffect, useMemo } from "react";
import {
  Store,
  SearchX,
  Search,
  Clock,
  Tags,
  ShoppingCart,
  Timer,
  ChefHat,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import usefoodDelivery from "../../globalState/fooddeliveryStore";
import { getCategoryStore } from "../../api/createStore";
import { getAllUserCarts } from "../../api/UserOrder";

import Swal from "sweetalert2";

export default function HomeUser() {
  const navigate = useNavigate();

  // =========================================================
  // ZUSTAND
  // =========================================================

  const stores = usefoodDelivery((state) => state.stores);
  const getAllStore = usefoodDelivery((state) => state.getAllStore);

  // =========================================================
  // STATE
  // =========================================================

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [categories, setCategories] = useState([]);

  const token = usefoodDelivery((state) => state.token);

  const [cartCount, setCartCount] = useState(0);

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadCartCount();
  }, [token]);

  const loadData = async () => {
    try {
      await getAllStore();

      const res = await getCategoryStore();

      const categoryData = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.categories)
          ? res.data.categories
          : [];

      setCategories(categoryData);
    } catch (error) {
      console.log("โหลดข้อมูลไม่สำเร็จ", error);

      Swal.fire({
        icon: "error",
        title: "โหลดข้อมูลไม่สำเร็จ",
        text:
          error.response?.data?.message ||
          "ไม่สามารถโหลดข้อมูลร้านอาหารได้ กรุณาลองใหม่อีกครั้ง",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#f97316",
      });
    }
  };

  const loadCartCount = async () => {
    if (!token) {
      setCartCount(0);
      return;
    }

    try {
      const res = await getAllUserCarts(token);

      const carts = Array.isArray(res.data?.carts)
        ? res.data.carts
        : Array.isArray(res.data)
          ? res.data
          : [];

      setCartCount(carts.length);
    } catch (error) {
      console.log("โหลดจำนวนตะกร้าไม่สำเร็จ", error);
      setCartCount(0);
    }
  };

  // =========================================================
  // STORE LIST
  // =========================================================

  const storeList = Array.isArray(stores) ? stores : [];

  // =========================================================
  // CATEGORY LIST
  // =========================================================

  const categoryList = useMemo(() => {
    return [
      {
        id: "all",
        name: "ทั้งหมด",
      },
      ...categories,
    ];
  }, [categories]);

  // =========================================================
  // TIME HELPER
  // =========================================================

  const timeToMinutes = (time) => {
    if (!time || typeof time !== "string") {
      return null;
    }

    const [hour, minute] = time.split(":").map(Number);

    if (Number.isNaN(hour) || Number.isNaN(minute)) {
      return null;
    }

    return hour * 60 + minute;
  };

  // =========================================================
  // CURRENT ROUND
  //
  // กฎ:
  // รอบรับออเดอร์ = startTime ถึง endTime
  // หลังจบรอบ = buffer 20 นาที
  //
  // เช่น
  // 08:00 - 09:00 = รับออเดอร์
  // 09:00 - 09:20 = เตรียม/จัดส่ง
  // 09:20 - 10:20 = รอบถัดไป
  // =========================================================

  const getCurrentRound = (store) => {
    const rounds = store.orderRound || [];

    if (!rounds.length) {
      return null;
    }

    const now = new Date();

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const round of rounds) {
      const start = timeToMinutes(round.startTime);
      const end = timeToMinutes(round.endTime);

      // กำลังเปิดรับออเดอร์
      if (currentMinutes >= start && currentMinutes < end) {
        return {
          ...round,
          roundStatus: "OPEN",
        };
      }

      // ช่วงเตรียมอาหาร/จัดส่ง 20 นาที
      if (currentMinutes >= end && currentMinutes < end + 20) {
        return {
          ...round,
          roundStatus: "PREPARING",
        };
      }
    }

    return null;
  };

  // =========================================================
  // SEARCH + FILTER
  // =========================================================

  const result = useMemo(() => {
    const q = search.trim().toLowerCase();

    return storeList
      .map((store) => {
        // =====================================================
        // CATEGORY
        // =====================================================

        const storeCategoryNames = [
          ...(Array.isArray(store.storeCategories)
            ? store.storeCategories
                .map((item) => item?.storeCategory?.name)
                .filter(Boolean)
            : []),

          store.storeCategory?.name,
        ]
          .filter(Boolean)
          .map((name) => name.toLowerCase());
        // =====================================================
        // FILTER CATEGORY
        // =====================================================

        if (selectedCategory !== "ทั้งหมด") {
          const hasSelectedCategory = storeCategoryNames.includes(
            selectedCategory.toLowerCase(),
          );

          if (!hasSelectedCategory) {
            return null;
          }
        }

        // =====================================================
        // ไม่ได้ค้นหา
        // แสดงเฉพาะร้านที่เปิด
        // =====================================================

        if (!q) {
          if (store.status !== "OPEN") {
            return null;
          }

          return {
            ...store,
            matchingMenus: [],
          };
        }

        // =====================================================
        // SEARCH STORE
        // =====================================================

        const storeName = (store.storeName || "").toLowerCase();

        const matchesStoreName = storeName.includes(q);

        // =====================================================
        // SEARCH CATEGORY
        // =====================================================

        const matchesCategory = storeCategoryNames.some((name) =>
          name.includes(q),
        );

        // =====================================================
        // SEARCH MENU
        // =====================================================

        const matchingMenus = Array.isArray(store.menus)
          ? store.menus.filter((menu) => {
              const menuName = (menu.menuItem || menu.name || "").toLowerCase();

              return menuName.includes(q);
            })
          : [];

        const matchesMenu = matchingMenus.length > 0;

        // =====================================================
        // ไม่เจออะไรเลย
        // =====================================================

        if (!matchesStoreName && !matchesCategory && !matchesMenu) {
          return null;
        }

        // =====================================================
        // เจอร้าน / หมวด / เมนู
        // =====================================================

        return {
          ...store,
          matchingMenus,
        };
      })
      .filter(Boolean);
  }, [storeList, selectedCategory, search]);

  // =========================================================
  // CHECK STORE OPEN
  // =========================================================

  const openStore = (store) => {
    if (store.status !== "OPEN") {
      Swal.fire({
        icon: "warning",
        title: "ร้านปิดอยู่",
        text: "ขณะนี้ร้านยังไม่เปิดให้บริการ",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#f97316",
      });

      navigate(`/user/storeRead/${store.id}`);
    }

    return true;
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-[#FFF8F0] pb-10">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Kanit:wght@600;700;800&family=Noto+Sans+Thai:wght@400;500;600;700&display=swap"
      />

      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <div className="relative overflow-hidden border-b border-orange-100 bg-gradient-to-b from-orange-50 to-[#FFF8F0]">
        <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 pb-8 pt-10">
          {/* ================================================= */}
          {/* TITLE */}
          {/* ================================================= */}

          <div className="mb-7 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-200">
                <Store className="h-6 w-6 text-white" />
              </div>

              <div>
                <h1 className="font-['Kanit'] text-3xl font-bold text-[#2A1B12]">
                  ร้านอาหาร
                </h1>

                <p className="font-['Noto_Sans_Thai'] text-[#6B5647]">
                  เลือกประเภทร้านที่คุณต้องการ
                </p>
              </div>
            </div>

            {/* ตะกร้ารวม */}

            <button
              type="button"
              onClick={() => navigate("/user/cartAll")}
              className="
                relative
                flex
                shrink-0
                items-center
                gap-2
                rounded-2xl
                border
                border-orange-100
                bg-white
                px-4
                py-3
                font-['Noto_Sans_Thai']
                text-sm
                font-semibold
                text-orange-600
                shadow-sm
                transition-all
                hover:border-orange-200
                hover:bg-orange-50
                hover:shadow-md
              "
            >
              <ShoppingCart className="h-5 w-5" />

              <span className="hidden sm:inline">ตะกร้าของคุณ</span>

              {cartCount > 0 && (
                <span
                  className="
                    absolute
                    -right-2
                    -top-2
                    flex
                    h-[22px]
                    min-w-[22px]
                    items-center
                    justify-center
                    rounded-full
                    border-2
                    border-[#FFF8F0]
                    bg-orange-500
                    px-1.5
                    text-[11px]
                    font-bold
                    text-white
                  "
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>
          </div>

          {/* ================================================= */}
          {/* CATEGORY */}
          {/* ================================================= */}

          <div className="mb-7">
            <div className="mb-4 flex items-center gap-2">
              <Tags className="h-5 w-5 text-orange-500" />

              <h2 className="font-['Kanit'] text-lg font-bold text-[#2A1B12]">
                ประเภทร้าน
              </h2>
            </div>

            <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-3">
              {categoryList.map((category) => {
                const isSelected = selectedCategory === category.name;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.name)}
                    className={`
                      relative
                      min-w-[140px]
                      shrink-0
                      rounded-2xl
                      border
                      p-4
                      text-left
                      transition-all
                      duration-200

                      ${
                        isSelected
                          ? `
                            scale-[1.02]
                            border-orange-500
                            bg-gradient-to-br
                            from-orange-400
                            to-orange-600
                            text-white
                            shadow-lg
                            shadow-orange-200
                          `
                          : `
                            border-orange-100
                            bg-white
                            text-[#2A1B12]
                            hover:-translate-y-1
                            hover:border-orange-300
                            hover:shadow-md
                          `
                      }
                    `}
                  >
                    <div
                      className={`
                        mb-3
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl

                        ${isSelected ? "bg-white/20" : "bg-orange-50"}
                      `}
                    >
                      <Tags
                        className={`
                          h-5
                          w-5

                          ${isSelected ? "text-white" : "text-orange-500"}
                        `}
                      />
                    </div>

                    <p className="overflow-hidden text-ellipsis whitespace-nowrap font-['Noto_Sans_Thai'] text-sm font-semibold">
                      {category.name}
                    </p>

                    {isSelected && (
                      <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ================================================= */}
          {/* SEARCH */}
          {/* ================================================= */}

          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#B0937E]" />

            <input
              className="
                w-full
                rounded-2xl
                border
                border-orange-100
                bg-white
                py-4
                pl-12
                pr-4
                font-['Noto_Sans_Thai']
                shadow-sm
                shadow-orange-100/60
                transition
                focus:outline-none
                focus:ring-2
                focus:ring-orange-300
              "
              placeholder="ค้นหาร้านอาหาร หรือ เมนู "
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ===================================================== */}
      {/* STORE LIST */}
      {/* ===================================================== */}

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* ================================================= */}
        {/* HEADER LIST */}
        {/* ================================================= */}

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-['Kanit'] text-2xl font-bold text-[#2A1B12]">
              ร้านค้าทั้งหมด
            </h2>

            {selectedCategory !== "ทั้งหมด" && (
              <p className="font-['Noto_Sans_Thai'] text-sm text-orange-500">
                ประเภท: {selectedCategory}
              </p>
            )}
          </div>

          <span className="font-['Noto_Sans_Thai'] text-sm text-[#8A6A54]">
            {result.length} ร้าน
          </span>
        </div>

        {/* ================================================= */}
        {/* NO RESULT */}
        {/* ================================================= */}

        {result.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-orange-200 bg-white py-20 text-center text-[#B0937E]">
            <SearchX className="mb-3 h-10 w-10" />

            <p className="font-['Kanit'] text-lg font-semibold text-[#2A1B12]">
              ไม่พบร้านที่ตรงกับคำค้นหา
            </p>

            <p className="mt-1 font-['Noto_Sans_Thai'] text-sm">
              ลองค้นหาด้วยชื่อร้าน เมนู หรือประเภทของร้าน
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {result.map((store) => {
              // =============================================
              // PROFILE IMAGE
              // =============================================

              const profileImage = Array.isArray(store.images)
                ? store.images.find((image) =>
                    image.public_id?.startsWith("StoreProfile2026"),
                  )
                : null;

              // =============================================
              // CATEGORY
              // =============================================

              const storeCategories = [];

              if (Array.isArray(store.storeCategories)) {
                store.storeCategories.forEach((category) => {
                  if (category?.storeCategory?.name) {
                    storeCategories.push(category.storeCategory.name);
                  }
                });
              }

              if (store.storeCategory?.name) {
                storeCategories.push(store.storeCategory.name);
              }

              const uniqueStoreCategories = [...new Set(storeCategories)];
              // =============================================
              // MATCHING MENUS
              // =============================================

              const hasMatchingMenus =
                search.trim() &&
                Array.isArray(store.matchingMenus) &&
                store.matchingMenus.length > 0;

              // =============================================
              // CURRENT ROUND
              // =============================================

              const currentRound = getCurrentRound(store);

              return (
                <div
                  key={store.id}
                  onClick={() => {
                    if (!openStore(store)) {
                      return;
                    }

                    navigate(`/user/storeRead/${store.id}`);
                  }}
                  className={`
                    group
                    cursor-pointer
                    overflow-hidden
                    rounded-2xl
                    border
                    border-orange-100
                    bg-white
                    shadow-sm
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:shadow-lg
                    hover:shadow-orange-100/60

                    ${hasMatchingMenus ? "md:col-span-2" : ""}
                  `}
                >
                  {/* ================================================= */}
                  {/* STORE TOP */}
                  {/* ================================================= */}

                  <div className="flex h-full min-h-[165px]">
                    {/* PROFILE IMAGE */}
                    <div className="relative min-h-[165px] w-[145px] shrink-0 overflow-hidden">
                      {profileImage?.url ? (
                        <img
                          src={profileImage.url}
                          alt={store.storeName || "ร้านอาหาร"}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-orange-100">
                          <Store className="h-10 w-10 text-orange-400" />
                        </div>
                      )}

                      {/* STATUS เปิด / ปิด */}
                      <span
                        className={`
      absolute left-2 top-2 z-10
      flex items-center gap-1.5
      rounded-full px-2.5 py-1
      font-['Noto_Sans_Thai'] text-[11px] font-semibold
      shadow-sm
      ${
        store.status === "OPEN"
          ? "bg-green-500/90 text-white"
          : "bg-gray-700/85 text-white"
      }
    `}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        {store.status === "OPEN" ? "เปิด" : "ปิด"}
                      </span>

                      {/* CURRENT ROUND บนรูป */}
                      {currentRound && (
                        <div
                          className={`
        absolute bottom-2 left-2 right-2 z-10
        rounded-lg px-2 py-1.5
        shadow-md backdrop-blur-sm
        ${
          currentRound.roundStatus === "OPEN"
            ? "bg-green-600/90 text-white"
            : "bg-orange-500/95 text-white"
        }
      `}
                        >
                          <div className="flex items-center gap-1">
                            {currentRound.roundStatus === "OPEN" ? (
                              <Timer className="h-3.5 w-3.5 shrink-0" />
                            ) : (
                              <ChefHat className="h-3.5 w-3.5 shrink-0" />
                            )}

                            <span className="font-['Noto_Sans_Thai'] text-[10px] font-semibold">
                              {currentRound.roundStatus === "OPEN"
                                ? "กำลังเปิดรับออเดอร์"
                                : "กำลังเตรียมอาหาร"}
                            </span>
                          </div>

                          <p className="mt-0.5 truncate font-['Noto_Sans_Thai'] text-[10px] font-medium">
                            {currentRound.roundNumber
                              ? `รอบ ${currentRound.roundNumber} · `
                              : ""}
                            {currentRound.startTime} - {currentRound.endTime}
                          </p>
                        </div>
                      )}
                    </div>
                    {/* STORE INFO */}
                    <div className="flex min-w-0 flex-1 flex-col p-4">
                      {/* NAME */}

                      <h3
                        className="
                          line-clamp-1
                          font-['Kanit']
                          text-lg
                          font-bold
                          text-[#2A1B12]
                          transition-colors
                          group-hover:text-orange-500
                        "
                      >
                        {store.storeName || "ไม่พบชื่อร้าน"}
                      </h3>

                      {/* CATEGORY */}

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {uniqueStoreCategories.length > 0 ? (
                          uniqueStoreCategories.map((categoryName) => (
                            <span
                              key={categoryName}
                              className="
                                  inline-flex
                                  items-center
                                  rounded-full
                                  border
                                  border-orange-100
                                  bg-orange-50
                                  px-2.5
                                  py-1
                                  font-['Noto_Sans_Thai']
                                  text-[11px]
                                  font-medium
                                  text-orange-600
                                "
                            >
                              {categoryName}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#9A7B66]">
                            ไม่ระบุประเภท
                          </span>
                        )}
                      </div>

                      {/* TIME */}

                      <div
                        className="
                          mt-3
                          flex
                          items-center
                          gap-1.5
                          font-['Noto_Sans_Thai']
                          text-xs
                          text-[#6B5647]
                        "
                      >
                        <Clock className="h-3.5 w-3.5 text-orange-400" />

                        <span>
                          {store.timeOpen || "--:--"}
                          {" - "}
                          {store.timeClose || "--:--"}
                        </span>
                      </div>



                      {/* BUTTON */}

                      <div className="mt-auto pt-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();

                            if (store.status !== "OPEN") {
                              Swal.fire({
                                icon: "warning",
                                title: "ร้านปิดอยู่",
                                text: "ขณะนี้ร้านยังไม่เปิดให้บริการ",
                                confirmButtonText: "ตกลง",
                                confirmButtonColor: "#f97316",
                              });

                              return;
                            }

                            navigate(`/user/storeRead/${store.id}`);
                          }}
                          className={`
                            w-full
                            rounded-lg
                            py-2
                            font-['Noto_Sans_Thai']
                            text-xs
                            font-semibold
                            transition-all

                            ${
                              store.status === "OPEN"
                                ? `
                                  bg-orange-50
                                  text-orange-600
                                  group-hover:bg-orange-500
                                  group-hover:text-white
                                `
                                : `
                                  cursor-not-allowed
                                  bg-gray-100
                                  text-gray-500
                                `
                            }
                          `}
                        >
                          {store.status === "OPEN" ? "ดูร้าน" : "ร้านปิด"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ================================================= */}
                  {/* MATCHING MENUS */}
                  {/* ================================================= */}

                  {hasMatchingMenus && (
                    <div className="border-t border-orange-100 bg-orange-50/30 p-4">
                      {/* TITLE */}

                      <div className="mb-3 flex items-center justify-between">
                        <p className="font-['Noto_Sans_Thai'] text-sm font-bold text-[#2A1B12]">
                          เมนูที่ตรงกับคำค้นหา
                        </p>

                        <span className="font-['Noto_Sans_Thai'] text-[11px] text-orange-500">
                          พบ {store.matchingMenus.length} เมนู
                        </span>
                      </div>

                      {/* MENU HORIZONTAL */}

                      <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
                        {store.matchingMenus.map((menu) => {
                          const menuImage =
                            menu.images?.[0]?.url ||
                            menu.images?.[0]?.secure_url ||
                            menu.imageUrl ||
                            menu.image ||
                            "";

                          const menuName =
                            menu.menuItem || menu.name || "ไม่พบชื่อเมนู";

                          const menuPrice = menu.price ?? 0;

                          const isAvailable = menu.isAvailable !== false;

                          return (
                            <div
                              key={menu.id}
                              onClick={(e) => {
                                e.stopPropagation();

                                if (!openStore(store)) {
                                  return;
                                }

                                if (!isAvailable) {
                                  Swal.fire({
                                    icon: "warning",
                                    title: "เมนูหมด",
                                    text: "เมนูนี้หมดชั่วคราว",
                                    confirmButtonText: "ตกลง",
                                    confirmButtonColor: "#f97316",
                                  });

                                  return;
                                }

                                navigate(`/user/menu/${menu.id}`);
                              }}
                              className={`
                                  w-[170px]
                                  shrink-0
                                  overflow-hidden
                                  rounded-2xl
                                  border
                                  shadow-sm
                                  transition-all

                                  ${
                                    isAvailable
                                      ? `
                                        cursor-pointer
                                        border-orange-100
                                        bg-white
                                        hover:-translate-y-0.5
                                        hover:shadow-md
                                      `
                                      : `
                                        cursor-not-allowed
                                        border-gray-200
                                        bg-gray-50
                                      `
                                  }
                                `}
                            >
                              {/* รูปเมนู */}

                              <div className="relative h-[125px] w-full overflow-hidden bg-orange-50">
                                {menuImage ? (
                                  <img
                                    src={menuImage}
                                    alt={menuName}
                                    className={`
                                        h-full
                                        w-full
                                        object-cover

                                        ${
                                          isAvailable
                                            ? "transition-transform duration-300 hover:scale-105"
                                            : "grayscale opacity-50"
                                        }
                                      `}
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                                    ไม่มีรูปเมนู
                                  </div>
                                )}

                                {/* แสดงหมดตอนค้นหา */}

                                {!isAvailable && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                    <span className="rounded-full bg-gray-700/90 px-4 py-1.5 font-['Noto_Sans_Thai'] text-sm font-bold text-white">
                                      หมด
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* ข้อมูลเมนู */}

                              <div className="p-3">
                                <p
                                  className={`
                                      truncate
                                      text-sm
                                      font-semibold

                                      ${
                                        isAvailable
                                          ? "text-[#2A1B12]"
                                          : "text-gray-400"
                                      }
                                    `}
                                >
                                  {menuName}
                                </p>

                                <div className="mt-1 flex items-center justify-between">
                                  <p
                                    className={`
                                        text-sm
                                        font-bold

                                        ${
                                          isAvailable
                                            ? "text-orange-500"
                                            : "text-gray-400"
                                        }
                                      `}
                                  >
                                    ฿{Number(menuPrice).toLocaleString()}
                                  </p>

                                  {!isAvailable && (
                                    <span className="font-['Noto_Sans_Thai'] text-xs font-semibold text-gray-500">
                                      หมด
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
