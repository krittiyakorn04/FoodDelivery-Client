import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send, Store, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

import usefoodDelivery from "../../globalState/fooddeliveryStore";
import {
  getOrCreateStoreChat,
  getChatMessages,
  sendChatMessage,
} from "../../api/Chat";

import socket from "../../socket";

const CustomerChat = () => {
  const navigate = useNavigate();
  const { storeId } = useParams();

  const token = usefoodDelivery((state) => state.token);
  const user = usefoodDelivery((state) => state.user);

  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  /*
    ความสูงของ UserNavbar ด้านล่าง

    ถ้า UserNavbar ของคุณสูงประมาณ 64px
    ให้ใช้ 64px ตรงนี้
  */
  const NAVBAR_HEIGHT = 64;

  useEffect(() => {
    if (!room?.id) return;

    socket.connect();

    socket.emit("joinChatRoom", room.id);

    const handleNewMessage = (newMessage) => {
      setMessages((prev) => {
        const exists = prev.some((item) => item.id === newMessage.id);

        if (exists) {
          return prev;
        }

        return [...prev, newMessage];
      });
    };

    socket.on("newChatMessage", handleNewMessage);

    return () => {
      socket.emit("leaveChatRoom", room.id);
      socket.off("newChatMessage", handleNewMessage);
      socket.disconnect();
    };
  }, [room?.id]);

  useEffect(() => {
    const viewport = window.visualViewport;

    if (!viewport) return;

    const updateKeyboard = () => {
      const keyboard = window.innerHeight - viewport.height;

      setKeyboardHeight(keyboard > 100 ? keyboard : 0);
    };

    updateKeyboard();

    viewport.addEventListener("resize", updateKeyboard);

    return () => {
      viewport.removeEventListener("resize", updateKeyboard);
    };
  }, []);

  const scrollToBottom = (smooth = true) => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "end",
      });
    }, 80);
  };

  const loadChat = async () => {
    if (!token || !storeId) return;

    try {
      setLoading(true);

      const res = await getOrCreateStoreChat(token, storeId);

      const chatRoom = res.data?.room;

      if (!chatRoom) {
        throw new Error("ไม่พบห้องแชท");
      }

      setRoom(chatRoom);

      const messageRes = await getChatMessages(token, chatRoom.id);

      setMessages(
        Array.isArray(messageRes.data?.messages)
          ? messageRes.data.messages
          : [],
      );

      setTimeout(() => {
        scrollToBottom(false);
      }, 100);
    } catch (error) {
      console.error("loadChat Error =", error);

      await Swal.fire({
        icon: "error",
        title: "ไม่สามารถเปิดแชทได้",
        text: error.response?.data?.message || "กรุณาลองใหม่อีกครั้ง",
        confirmButtonText: "ตกลง",
      });

      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChat();
  }, [token, storeId]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSend = async () => {
    const text = message.trim();

    if (!text || !room || sending) return;

    try {
      setSending(true);

      await sendChatMessage(token, room.id, text);

      setMessage("");

      if (textareaRef.current) {
        textareaRef.current.style.height = "44px";
      }

      setTimeout(() => {
        textareaRef.current?.focus();
        scrollToBottom();
      }, 100);
    } catch (error) {
      console.error("sendChatMessage Error =", error);

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

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (event) => {
    setMessage(event.target.value);

    event.target.style.height = "44px";

    event.target.style.height = `${Math.min(event.target.scrollHeight, 120)}px`;
  };

  const handleFocus = () => {
    setTimeout(() => {
      scrollToBottom();
    }, 300);
  };

  if (loading) {
    return (
      <div className="flex h-[100dvh] flex-col bg-[#FFF8F0] animate-pulse">
        {/* HEADER */}
        <div className="flex items-center gap-3 border-b border-orange-100 bg-white px-4 py-3">
          <div className="h-10 w-10 rounded-full bg-gray-200" />

          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded-lg bg-gray-200" />
            <div className="h-3 w-20 rounded-lg bg-gray-100" />
          </div>

          <div className="h-9 w-9 rounded-full bg-gray-100" />
        </div>

        {/* CHAT */}
        <div className="flex-1 space-y-5 overflow-hidden px-4 py-5">
          {/* ฝั่งร้าน */}
          <div className="flex items-end gap-2">
            <div className="h-8 w-8 shrink-0 rounded-full bg-orange-100" />

            <div className="space-y-2">
              <div className="h-10 w-48 rounded-2xl rounded-bl-md bg-white shadow-sm" />
              <div className="h-3 w-12 rounded bg-gray-100" />
            </div>
          </div>

          {/* ฝั่งเรา */}
          <div className="flex justify-end">
            <div className="space-y-2">
              <div className="h-10 w-56 rounded-2xl rounded-br-md bg-orange-100" />
              <div className="ml-auto h-3 w-12 rounded bg-gray-100" />
            </div>
          </div>

          {/* ฝั่งร้าน */}
          <div className="flex items-end gap-2">
            <div className="h-8 w-8 shrink-0 rounded-full bg-orange-100" />

            <div className="space-y-2">
              <div className="h-14 w-64 rounded-2xl rounded-bl-md bg-white shadow-sm" />
              <div className="h-3 w-12 rounded bg-gray-100" />
            </div>
          </div>

          {/* ฝั่งเรา */}
          <div className="flex justify-end">
            <div className="h-10 w-40 rounded-2xl rounded-br-md bg-orange-100" />
          </div>
        </div>

        {/* INPUT */}
        <div className="border-t border-orange-100 bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-11 flex-1 rounded-2xl bg-gray-100" />
            <div className="h-11 w-11 shrink-0 rounded-full bg-orange-100" />
          </div>
        </div>
      </div>
    );
  }

  const inputBottom = keyboardHeight > 0 ? keyboardHeight : NAVBAR_HEIGHT;

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-[#FFF8F0]">
      {/* ================= HEADER ================= */}
      <header className="absolute left-0 right-0 top-0 z-30 border-b border-orange-100 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-3 sm:px-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-600 hover:bg-orange-50 hover:text-orange-500 active:bg-orange-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100">
            <Store className="h-5 w-5 text-orange-500" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-gray-800 sm:text-base">
              {room?.store?.storeName || "ร้านค้า"}
            </p>

            <p className="text-[11px] text-gray-400">แชทกับร้านค้า</p>
          </div>
        </div>
      </header>

      {/* ================= MESSAGES ================= */}
      <main
        className="absolute left-0 right-0 top-16 overflow-y-auto"
        style={{
          bottom: inputBottom + 70,
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div className="mx-auto w-full max-w-3xl px-3 py-4 sm:px-4 sm:py-5">
          {messages.length === 0 ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="px-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                  <Store className="h-7 w-7 text-orange-500" />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-gray-700 sm:text-base">
                  เริ่มพูดคุยกับร้านค้า
                </h3>

                <p className="mt-1 text-xs leading-5 text-gray-400 sm:text-sm">
                  สอบถามเกี่ยวกับเมนูหรือรายละเอียดร้านได้เลย
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 sm:space-y-3">
              {messages.map((item, index) => {
                const isMine =
                  item.senderType === "CUSTOMER" &&
                  Number(item.senderId) === Number(user?.id);

                // ===============================
                // วันที่ของข้อความ
                // ===============================
                const currentDate = new Date(item.createdAt);

                const previousMessage = messages[index - 1];
                const previousDate = previousMessage
                  ? new Date(previousMessage.createdAt)
                  : null;

                // แสดงตัวคั่นเมื่อเปลี่ยนวัน
                const isNewDay =
                  !previousDate ||
                  currentDate.toDateString() !== previousDate.toDateString();

                // ===============================
                // ชื่อวันที่
                // ===============================
                const today = new Date();
                const tomorrow = new Date();

                tomorrow.setDate(today.getDate() + 1);

                const isToday =
                  currentDate.toDateString() === today.toDateString();

                const isTomorrow =
                  currentDate.toDateString() === tomorrow.toDateString();

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
                    {/* ===============================
          DATE SEPARATOR
      =============================== */}
                    {isNewDay && (
                      <div className="my-5 flex items-center gap-3">
                        <div className="h-px flex-1 bg-gray-200" />

                        <span className="shrink-0 rounded-full bg-gray-50 px-3 py-1 text-[11px] font-medium text-gray-400">
                          {dateLabel}
                        </span>

                        <div className="h-px flex-1 bg-gray-200" />
                      </div>
                    )}

                    {/* ===============================
          MESSAGE
      =============================== */}
                    <div
                      className={`flex ${
                        isMine ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm sm:max-w-[75%] sm:px-4 ${
                          isMine
                            ? "rounded-br-md bg-orange-500 text-white"
                            : "rounded-bl-md bg-white text-gray-700"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words text-sm leading-5">
                          {item.message}
                        </p>

                        <p
                          className={`mt-1 text-[9px] ${
                            isMine ? "text-orange-100" : "text-gray-400"
                          }`}
                        >
                          {currentDate.toLocaleTimeString("th-TH", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} className="h-1" />
            </div>
          )}
        </div>
      </main>

      {/* ================= INPUT ================= */}
      <div
        className="fixed left-0 right-0 z-40 border-t border-orange-100 bg-white"
        style={{
          bottom: inputBottom,
          paddingBottom:
            keyboardHeight > 0 ? "6px" : "env(safe-area-inset-bottom)",
        }}
      >
        <div className="mx-auto flex w-full max-w-3xl items-end gap-2 px-3 py-2.5 sm:px-4">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            rows={1}
            placeholder="พิมพ์ข้อความ..."
            disabled={sending}
            enterKeyHint="send"
            className="min-h-[44px] max-h-[120px] flex-1 resize-none overflow-y-auto rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm leading-5 outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 disabled:opacity-60"
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={!message.trim() || sending}
            aria-label="ส่งข้อความ"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white shadow-sm transition active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="ml-0.5 h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerChat;
