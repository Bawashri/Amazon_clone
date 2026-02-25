const randomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const calculateExpectedDelivery = (subscription) => {
  const days = subscription === "PREMIUM" ? randomInRange(1, 2) : randomInRange(5, 7);
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};
