import { Outlet } from "react-router-dom";
import StoreNav from "../components/nav/StoreNav";
import StoreNavigation from "../components/nav/StoreNavigation";

const LayoutStore = () => {
  return (
    <div className="min-h-[100dvh]">
      <StoreNav />

      <main>
        <Outlet />
      </main>

      <StoreNavigation />
    </div>
  );
};

export default LayoutStore;
