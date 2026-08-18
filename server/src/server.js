const app = require('./app');
const { PORT, NODE_ENV } = require('./config/env');

app.listen(PORT, () => {
  console.log(`Placement System API running in ${NODE_ENV} mode on http://localhost:${PORT}`);
});
