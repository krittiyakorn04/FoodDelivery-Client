import { NavLink } from "react-router-dom";
import {  ClipboardList, Bike, User, Store, Utensils } from "lucide-react";

const StoreNavigation = () => {
  const navClass = ({ isActive }) =>
    `flex flex-col items-center gap-1 px-4 py-2 transition ${
      isActive ? "text-orange-500" : "text-gray-500 hover:text-orange-500"
    }`;
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white shadow-lg ">
      <div className="mx-auto flex h-16 max-w-2xl items-center justify-around">

        <NavLink to="Store" end className={navClass}>
          <Store className="h-6 w-6" />
          <span className="text-xs font-medium">ร้านอาหาร</span>
        </NavLink>

        <NavLink to="storeEdit" end className={navClass}>
          <Utensils  className="h-6 w-6" />
          <span className="text-xs font-medium">เมนูอาหาร</span>
        </NavLink>

        <NavLink to="Order" className={navClass}>
          <ClipboardList className="h-6 w-6" />
          <span className="text-xs font-medium">ออเดอร์</span>
        </NavLink>

        <NavLink to="Delivery" className={navClass}>
          <Bike className="h-6 w-6" />
          <span className="text-xs font-medium">จัดส่ง</span>
        </NavLink>

        <NavLink to="Profile" className={navClass}>
          <User className="h-6 w-6" />
          <span className="text-xs font-medium">ฉัน</span>
        </NavLink>
      </div>
    </nav>
  );
};
export default StoreNavigation;
