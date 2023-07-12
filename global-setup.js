/**
 * Because pg-mem does not support for timezones as described in the link below, it means pg-mem run at UTC timezone.
 * Therefore, we need to set up UTC timezone for running unit test.
 * https://github.com/oguimbal/pg-mem/blob/80711baa07b21aa9807535cd9f442d5fcea4fd39/readme.md
 */
module.exports = async () => {
  process.env.TZ = 'UTC';
};
