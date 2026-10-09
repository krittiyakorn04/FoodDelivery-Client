import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "../pages/Home";
import Profile from "../pages/store/Profile";
import MenuCategory from "../pages/store/MenuCategory";
import Menu from "../pages/store/Menu";
import Order from "../pages/store/Order";
import Delivery from "../pages/store/Delivery";
import HomeUser from "../pages/user/HomeUser";
import Store from "../pages/store/Store";
import CartPage from "../pages/user/Cart";
import MyOrders from "../pages/user/UserD";
import CheckoutPage from "../pages/user/OrderUser";
import ProfileUser from "../pages/user/UserProfile";
import StoreLogin from "../pages/auth/StoreLogin";
import StoreRegister from "../pages/auth/StoreRegister";
import LayoutStore from "../layouts/LayoutStore";
import LayoutUser from "../layouts/LayoutUser";
import UserRegister from "../pages/auth/UserRegister";
import ProtectRouteStore from "./ProtectRouteStore";
import ProtectRouteUser from "./ProtectRouteUser";
import UserLogin from "../pages/auth/UserLogin";
import StoreEdit from "../pages/store/StoreEdit";
import EditMenu from "../pages/store/EditMenu";
import ProfileEdit from "../pages/store/ProfileEdit";
import FormOrdermode from "../components/store/FormOrdermode";
import FormOrderRound from "../components/store/FormOrderRound ";
import ChooseLogin from "../pages/auth/ChooseLogin";
import ChooseRegister from "../pages/auth/ChooseRegister";
import StoreSetting from "../components/store/FormEditProfile1";
import FormOpen from "../components/store/FormOpen";
import UserSetting from "../components/user/UserSetting";
import FormEditUserProfile from "../components/user/FormEditUserProfile";
import ReadStore from "../pages/user/ReadStore";
import FormAddress from "../components/user/FormAddress";
import FormAddStoreCategory from "../pages/admin/FormAddStoreCategory";
import OrderDetail from "../components/user/OrderDetail";
import FormVerifyStore from "../components/store/FormVerifyStore";
import MenuDetail from "../components/store/MenuDetail";
import StoreOrderDetail from "../components/store/StoreOrderDetail";
import DeliveryDetail from "../components/store/DeliveryDetail";
import FormUploadQr from "../components/store/FormUploadQr";
import UserPayment from "../components/user/UserPayment";
import AdminStoreStatus from "../pages/admin/AdminStoreStatus";
import MenuUserDetail from "../components/user/MenuUserDetail";
import DeliveryJobs from "../components/store/DeliveryJobs";
import StoreStaff from "../components/store/StoreStaff";
import ProtectRouteDelivery from "./ProtectRouteDelivery";
import ClientPublic from "../components/user/ClientPublic";
import AdminLogin from "../pages/admin/AdminLogin";
import AdminCustomerStatus from "../pages/admin/AdminCustomerStatus";
import StoreReviews from "../components/user/StoreReviews";
import ReviewStore from "../components/store/ReviewsStore";
import StoreReport from "../components/store/StoreReport";
import DeliveryRiderDetail from "../components/store/DeliveryRiderDetail";
import DeliveryNavbar from "../components/nav/DeliveryNavbar";
import CustomerChat from "../components/user/CustomerChat";
import StoreChat from "../components/store/StoreChat";
import DeliveryChat from "../components/user/DeliveryChat";
import StoreDeliveryChat from "../components/store/StoreDeliveryChat";
import DeliveryStaffChat from "../components/store/DeliveryStaffChat";
import AdminOrderReports from "../pages/admin/AdminOrderReports";
import UserOrderReports from "../pages/user/UserOrderReports";
import AllUserCart from "../components/user/AllUserCart";
import StoreOrderReports from "../components/store/StoreOrderReports";
import UserCart from "../components/user/UserCart";
const router = createBrowserRouter([
  {
    path: "/",
    children: [
      { index: true, element: <Home /> },
      ,
      { path: "ClientPublic/:id", element: <ClientPublic /> },
      { path: "ChooseRegister", element: <ChooseRegister /> },
      { path: "ChooseLoing", element: <ChooseLogin /> },
      { path: "storeRegister", element: <StoreRegister /> },
      { path: "storeLogin", element: <StoreLogin /> },
      { path: "userRegister", element: <UserRegister /> },
      { path: "userLogin", element: <UserLogin /> },
    ],
  },

  {
    path: "/store",
    // element: <LayoutStore />,
    element: <ProtectRouteStore element={<LayoutStore />} />,
    children: [
      { path: "Profile", element: <Profile /> },
      { path: "store", element: <Store /> },
      { path: "StoreReport", element: <StoreReport /> },
      { path: "reviews", element: <ReviewStore /> },
      { path: "menu/:id", element: <MenuDetail /> },
      { path: "storeEdit", element: <StoreEdit /> },
      { path: "UploadQr", element: <FormUploadQr /> },
      { path: "StoreSetting", element: <StoreSetting /> },
      { path: "editProfile", element: <ProfileEdit /> },
      { path: "Verify", element: <FormVerifyStore /> },
      { path: "FormOpen", element: <FormOpen /> },
      { path: "MenuCategory", element: <MenuCategory /> },
      { path: "Menu", element: <Menu /> },
      { path: "EditMenu/:id", element: <EditMenu /> },
      { path: "order-mode", element: <FormOrdermode /> },
      { path: "order-round", element: <FormOrderRound /> },
      { path: "Order", element: <Order /> },
      { path: "order-detail/:id", element: <StoreOrderDetail /> },
      { path: "Delivery", element: <Delivery /> },
      { path: "Delivery-detail/:id", element: <DeliveryDetail /> },
      { path: "StoreStaff", element: <StoreStaff /> },
      { path: "chat", element: <StoreChat /> },
      { path: "DeliveryChat/:deliveryId", element: <StoreDeliveryChat /> },
      { path: "StoreOrderReports", element: <StoreOrderReports /> },
    ],
  },

  {
    path: "/store/DeliveryJobs",
    element: (
      <ProtectRouteDelivery
        element={
          <>
            <DeliveryNavbar />
            <DeliveryJobs />
          </>
        }
      />
    ),
  },

  {
    path: "/store/DeliveryRiderDetail/:id",
    element: (
      <ProtectRouteDelivery
        element={
          <>
            <DeliveryNavbar />
            <DeliveryRiderDetail />
          </>
        }
      />
    ),
  },

  {
    path: "/store/DeliveryStaffChat/:deliveryId",
    element: (
      <ProtectRouteDelivery
        element={
          <>
            <DeliveryNavbar />
            <DeliveryStaffChat />
          </>
        }
      />
    ),
  },

  {
    path: "/user",
    // element: <LayoutUser />,
    element: <ProtectRouteUser element={<LayoutUser />} />,
    children: [
      { path: "userProfile", element: <ProfileUser /> },
      { path: "menu/:id", element: <MenuUserDetail /> },
      { path: "storeRead/:id", element: <ReadStore /> },
      { path: "store/:id/reviews", element: <StoreReviews /> },
      { path: "cart", element: <UserCart /> },
      { path: "cartAll", element: <AllUserCart /> },
      { path: "homeUser", element: <HomeUser /> },
      { path: "UserSetting", element: <UserSetting /> },
      { path: "AddressSetting", element: <FormAddress /> },
      { path: "editUser", element: <FormEditUserProfile /> },
      { path: "orderUser", element: <CheckoutPage /> },
      { path: "UserPayment", element: <UserPayment /> },
      { path: "orderDetail/:id", element: <OrderDetail /> },
      { path: "userDelivery", element: <MyOrders /> },
      { path: "chat/store/:storeId", element: <CustomerChat /> },
      { path: "deliveryChat/:deliveryId", element: <DeliveryChat /> },
      { path: "orderReports", element: <UserOrderReports /> },
    ],
  },

  {
    path: "/admin",
    children: [
      { path: "login", element: <AdminLogin /> },
      { path: "adminstore", element: <FormAddStoreCategory /> },
      { path: "AdminStoreStatus", element: <AdminStoreStatus /> },
      { path: "AdminCustomerStatus", element: <AdminCustomerStatus /> },
      { path: "order-reports", element: <AdminOrderReports /> },
    ],
  },
]);

const AppRoutes = () => {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};
export default AppRoutes;
