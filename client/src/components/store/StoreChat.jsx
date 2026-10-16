import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  MessageCircle,
  Send,
  User,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import socket from "../../socket";

import usefoodDelivery from "../../globalState/fooddeliveryStore";

import {
  getStoreChatRooms,
  getStoreChatMessages,
  sendStoreMessage,
} from "../../api/Chat";

const StoreChat = () => {
  const navigate = useNavigate();

  const token = usefoodDelivery((state) => state.token);

  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);

  const [message, setMessage] = useState("");

  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  // =====================================================
  // โหลดรายการห้องแชท
  // =====================================================
  const loadRooms = async () => {
    if (!token) return;

    try {
      setLoadingRooms(true);

      const res = await getStoreChatRooms(token);

      const data = Array.isArray(res.data?.rooms) ? res.data.rooms : [];

      setRooms(data);

      if (data.length > 0 && !selectedRoom) {
        setSelectedRoom(data[0]);
      }

      if (selectedRoom && !data.some((room) => room.id === selectedRoom.id)) {
        setSelectedRoom(data[0] || null);
      }
    } catch (error) {
      console.error("loadStoreChatRooms Error =", error);

      Swal.fire({
        icon: "error",
        title: "โหลดแชทไม่สำเร็จ",
        text: error.response?.data?.message || "ไม่สามารถโหลดรายการแชทได้",
        confirmButtonText: "ตกลง",
      });
    } finally {
      setLoadingRooms(false);
    }
  };

  // =====================================================
  // โหลดข้อความ
  // =====================================================
  const loadMessages = async (roomId) => {
    if (!token || !roomId) return;

    try {
      setLoadingMessages(true);

      const res = await getStoreChatMessages(token, roomId);

      setMessages(Array.isArray(res.data?.messages) ? res.data.messages : []);
    } catch (error) {
      console.error("loadStoreChatMessages Error =", error);

      Swal.fire({
        icon: "error",
        title: "โหลดข้อความไม่สำเร็จ",
        text: error.response?.data?.message || "ไม่สามารถโหลดข้อความได้",
        confirmButtonText: "ตกลง",
      });
    } finally {
      setLoadingMessages(false);
    }
  };

  // =====================================================
  // Socket
  // =====================================================
  useEffect(() => {
    if (!selectedRoom?.id) return;

    socket.connect();

    socket.emit("joinChatRoom", selectedRoom.id);

    const handleNewMessage = (newMessage) => {
      if (newMessage.roomId !== selectedRoom.id) return;

      setMessages((prev) => {
        const exists = prev.some((item) => item.id === newMessage.id);

        if (exists) {
          return prev;
        }

        return [...prev, newMessage];
      });

      setRooms((prev) =>
        prev.map((room) =>
          room.id === selectedRoom.id
            ? {
                ...room,
                updatedAt: newMessage.createdAt,
                messages: [newMessage],
              }
            : room,
        ),
      );
    };

    socket.on("newChatMessage", handleNewMessage);

    return () => {
      socket.emit("leaveChatRoom", selectedRoom.id);
      socket.off("newChatMessage", handleNewMessage);
      socket.disconnect();
    };
  }, [selectedRoom?.id]);

  // =====================================================
  // โหลดห้องครั้งแรก
  // =====================================================
  useEffect(() => {
    loadRooms();
  }, [token]);

  // =====================================================
  // เมื่อเลือกห้อง
  // =====================================================
  useEffect(() => {
    if (!selectedRoom?.id) return;

    loadMessages(selectedRoom.id);
  }, [selectedRoom?.id]);

  // =====================================================
  // Scroll ล่างสุด
  // =====================================================
  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, 50);
  }, [messages]);

  // =====================================================
  // ส่งข้อความ
  // =====================================================
  const handleSend = async () => {
    const text = message.trim();

    if (!text || !selectedRoom || sending) return;

    try {
      setSending(true);

      await sendStoreMessage(token, selectedRoom.id, text);

      setMessage("");

      await loadRooms();
    } catch (error) {
      console.error("sendStoreMessage Error =", error);

      Swal.fire({
        icon: "error",
        title: "ส่งข้อความไม่สำเร็จ",
        text: error.response?.data?.message || "กรุณาลองใหม่อีกครั้ง",
        confirmButtonText: "ตกลง",
      });
    } finally {
      setSending(false);
    }
  };

  // =====================================================
  // Enter ส่งข้อความ
  // =====================================================
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  // =====================================================
  // ชื่อลูกค้า
  // =====================================================
  const getCustomerName = (room) => {
    return room?.customer?.username || `ลูกค้า #${room?.customerId || "-"}`;
  };

  // =====================================================
  // ข้อความล่าสุด
  // =====================================================
  const getLastMessage = (room) => {
    const lastMessage = room?.messages?.[0];

    if (!lastMessage) {
      return "ยังไม่มีข้อความ";
    }

    return lastMessage.message;
  };

  // =====================================================
  // กลับรายการแชทบนมือถือ
  // =====================================================
  const handleBackToRooms = () => {
    setSelectedRoom(null);
    setMessages([]);
  };

  return (
    <div className="flex h-[calc(100dvh-128px)] min-h-0 flex-col overflow-hidden bg-[#FFF8F0]">
      {" "}
      {/* ================================================= */}
      {/* Header */}
      {/* ================================================= */}
      <div className="z-40 shrink-0 border-b border-orange-100 bg-white shadow-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-600 transition hover:bg-orange-50 hover:text-orange-500 active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100">
              <MessageCircle className="h-5 w-5 text-orange-500" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold text-gray-800 sm:text-base">
                แชทกับลูกค้า
              </h1>

              <p className="hidden text-xs text-gray-400 sm:block">
                ติดต่อพูดคุยกับลูกค้าของร้าน
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadRooms}
            disabled={loadingRooms}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-500 transition hover:bg-orange-50 hover:text-orange-500 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-5 w-5 ${loadingRooms ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>
      {/* ================================================= */}
      {/* Chat Area */}
      {/* ================================================= */}
      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 overflow-hidden px-0 sm:px-4 sm:py-3">
        <div className="grid min-h-0 w-full overflow-hidden bg-white sm:rounded-3xl sm:border sm:border-orange-100 sm:shadow-sm md:grid-cols-[300px_1fr] lg:grid-cols-[340px_1fr]">
          {/* ================================================= */}
          {/* รายชื่อลูกค้า */}
          {/* ================================================= */}
          <div
            className={`${
              selectedRoom ? "hidden md:flex" : "flex"
            } min-h-0 flex-col border-gray-100 md:border-r`}
          >
            {/* Room Header */}
            <div className="shrink-0 border-b border-gray-100 px-4 py-3.5 sm:px-5 sm:py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-800">ข้อความ</h2>

                  <p className="mt-0.5 text-xs text-gray-400">
                    {rooms.length} ห้องแชท
                  </p>
                </div>

                <MessageCircle className="h-5 w-5 text-orange-400" />
              </div>
            </div>

            {/* Room List */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {loadingRooms ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                </div>
              ) : rooms.length === 0 ? (
                <div className="px-5 py-16 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
                    <MessageCircle className="h-6 w-6 text-orange-300" />
                  </div>

                  <p className="mt-3 text-sm font-medium text-gray-600">
                    ยังไม่มีแชท
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-400">
                    เมื่อลูกค้าทักมา ห้องแชทจะแสดงที่นี่
                  </p>
                </div>
              ) : (
                rooms.map((room) => {
                  const active = selectedRoom?.id === room.id;

                  return (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => setSelectedRoom(room)}
                      className={`flex min-h-[72px] w-full gap-3 border-b border-gray-50 px-4 py-3.5 text-left transition active:bg-orange-100 ${
                        active ? "bg-orange-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                          active
                            ? "bg-orange-500 text-white"
                            : "bg-orange-100 text-orange-500"
                        }`}
                      >
                        <User className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-800">
                            {getCustomerName(room)}
                          </p>

                          <span className="shrink-0 text-[10px] text-gray-400">
                            {room.updatedAt
                              ? new Date(room.updatedAt).toLocaleTimeString(
                                  "th-TH",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )
                              : ""}
                          </span>
                        </div>

                        <p className="mt-1 truncate text-xs text-gray-400">
                          {getLastMessage(room)}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* ================================================= */}
          {/* ห้องแชท */}
          {/* ================================================= */}
          <div
            className={`${
              selectedRoom ? "flex" : "hidden md:flex"
            } min-h-0 flex-col`}
          >
            {!selectedRoom ? (
              <div className="flex flex-1 items-center justify-center px-5">
                <div className="text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-50">
                    <MessageCircle className="h-9 w-9 text-orange-300" />
                  </div>

                  <h3 className="mt-4 font-bold text-gray-700">เลือกแชท</h3>

                  <p className="mt-1 text-sm text-gray-400">
                    เลือกลูกค้าจากด้านซ้ายเพื่อเริ่มพูดคุย
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* ================================================= */}
                {/* Chat Header */}
                {/* ================================================= */}
                <div className="flex shrink-0 items-center gap-2.5 border-b border-gray-100 bg-white px-3 py-2.5 sm:gap-3 sm:px-5 sm:py-4">
                  {/* ปุ่มกลับ เฉพาะมือถือ */}
                  <button
                    type="button"
                    onClick={handleBackToRooms}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-600 transition hover:bg-orange-50 hover:text-orange-500 active:scale-95 md:hidden"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 sm:h-11 sm:w-11">
                    <User className="h-5 w-5 text-orange-500" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-gray-800 sm:text-base">
                      {getCustomerName(selectedRoom)}
                    </p>

                    <p className="text-xs text-gray-400">ลูกค้า</p>
                  </div>
                </div>

                {/* ================================================= */}
                {/* Messages */}
                {/* ================================================= */}
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#FFF8F0]/40 px-3 py-4 sm:px-5 sm:py-5">
                  
                  {loadingMessages ? (
                    <div className="flex h-full items-center justify-center">
                      <Loader2 className="h-7 w-7 animate-spin text-orange-500" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="px-5 text-center">
                        <MessageCircle className="mx-auto h-10 w-10 text-gray-300" />

                        <p className="mt-3 text-sm text-gray-400">
                          ยังไม่มีข้อความ
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5 sm:space-y-3">
                      {messages.map((item, index) => {
                        const isStore = item.senderType === "STORE";

                        const currentDate = new Date(item.createdAt);

                        const previousMessage = messages[index - 1];
                        const previousDate = previousMessage
                          ? new Date(previousMessage.createdAt)
                          : null;

                        const isNewDay =
                          !previousDate ||
                          currentDate.toDateString() !==
                            previousDate.toDateString();

                        const today = new Date();
                        const tomorrow = new Date();

                        tomorrow.setDate(today.getDate() + 1);

                        const isToday =
                          currentDate.toDateString() === today.toDateString();

                        const isTomorrow =
                          currentDate.toDateString() ===
                          tomorrow.toDateString();

                        let dateLabel = "";

                        if (isToday) {
                          dateLabel = "วันนี้";
                        } else if (isTomorrow) {
                          dateLabel = "พรุ่งนี้";
                        } else {
                          dateLabel = currentDate.toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          });
                        }

                        return (
                          <div key={item.id}>
                            {/* ตัวคั่นเมื่อเปลี่ยนวัน */}
                            {isNewDay && (
                              <div className="my-5 flex items-center gap-3">
                                <div className="h-px flex-1 bg-gray-200" />

                                <span className="shrink-0 rounded-full bg-gray-50 px-3 py-1 text-[11px] font-medium text-gray-400">
                                  {dateLabel}
                                </span>

                                <div className="h-px flex-1 bg-gray-200" />
                              </div>
                            )}

                            {/* ข้อความ */}
                            <div
                              className={`flex ${
                                isStore ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[85%] break-words rounded-2xl px-3.5 py-2.5 shadow-sm sm:max-w-[75%] sm:px-4 ${
                                  isStore
                                    ? "rounded-br-md bg-orange-500 text-white"
                                    : "rounded-bl-md bg-white text-gray-700"
                                }`}
                              >
                                <p className="whitespace-pre-wrap break-words text-sm leading-5">
                                  {item.message}
                                </p>

                                <p
                                  className={`mt-1 text-[10px] ${
                                    isStore
                                      ? "text-orange-100"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {currentDate.toLocaleTimeString("th-TH", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}{" "}
                                  น.
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* ================================================= */}
                {/* Input */}
                {/* ================================================= */}
                <div className="shrink-0 border-t border-gray-100 bg-white p-2.5 pb-[calc(4rem+env(safe-area-inset-bottom)+0.625rem)] sm:p-3 sm:pb-3">
                  {" "}
                  <div className="flex items-end gap-2">
                    <textarea
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={1}
                      disabled={sending}
                      placeholder="พิมพ์ข้อความ..."
                      className="max-h-32 min-h-[44px] flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm leading-5 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 disabled:opacity-60 sm:px-4 sm:py-3"
                    />

                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={!message.trim() || sending}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white transition hover:bg-orange-600 active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      {sending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="ml-0.5 h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreChat;
