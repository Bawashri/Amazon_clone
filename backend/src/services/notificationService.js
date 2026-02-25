export const notifyAdminNewPendingOrder = (orderId, userId) => {
  console.log(`[ADMIN NOTIFY] New pending order #${orderId} from user #${userId}`);
};

export const notifyUserStatusChange = (userId, orderId, status) => {
  console.log(`[USER NOTIFY] User #${userId} order #${orderId} changed to ${status}`);
};
