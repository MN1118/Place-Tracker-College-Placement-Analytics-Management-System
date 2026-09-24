const app = require('./app');
const { PORT, NODE_ENV } = require('./config/env');

app.listen(PORT, '0.0.0.0', () => {
  console.log(
    `Placement System API running in ${NODE_ENV} mode on port ${PORT}`
  );
});