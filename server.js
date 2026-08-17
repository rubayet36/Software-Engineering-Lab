const express = require('express');
const app = express();
const enrollmentRoutes = require('./route/enrollment');

app.use(express.json()); // parse JSON body

app.use('/api/enrollments', enrollmentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});