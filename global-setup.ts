/**
 * To set up Asia/Tokyo timezone for running unit tests and e2e test.
 */
export default async () => {
  process.env.TZ = 'Asia/Tokyo';
};
