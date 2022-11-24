module.exports = () => {
  process.env.TZ = 'Europe/London';
  process.env.NODE_ENV = 'test';
  process.env.APPINSIGHTS_INSTRUMENTATIONKEY = 'test';
};
