
const prisma = require("../config/prisma");
const {
  createNotification,
} = require("../controllers/notificationController");

const HOUR = 60 * 60 * 1000;

let isRunning = false;

const checkOldOrders = async () => {
  if (isRunning) return;

  isRunning = true;

  try {
    const oneHourAgo = new Date(Date.now() - HOUR);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { lte: oneHourAgo },
        status: {
          notIn: ["COMPLETED", "CANCELLED"],
        },
      },
      select: {
        id: true,
        storeId: true,
      },
    });

    for (const order of orders) {
      const exists = await prisma.notification.findFirst({
        where: {
          orderId: order.id,
          storeId: order.storeId,
          type: "ORDER_OVER_ONE_HOUR",
        },
        select: { id: true },
      });

      if (exists) continue;

      await createNotification({
        title: "มีออเดอร์ค้างเกิน 1 ชั่วโมง",
        message: `ออเดอร์ #${order.id} ยังไม่เสร็จสิ้น กรุณาตรวจสอบ`,
        type: "ORDER_OVER_ONE_HOUR",
        storeId: order.storeId,
        orderId: order.id,
      });
    }
  } catch (error) {
    console.error("checkOldOrders Error =", error);
  } finally {
    isRunning = false;
  }
};

const startOrderReminder = () => {
  checkOldOrders();

  setInterval(checkOldOrders, 60 * 1000);
};

module.exports = startOrderReminder;
