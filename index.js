const express = require("express");
const app = express();
const port = 3000;

const bodyps = require('body-parser');
app.use(bodyps.urlencoded({extended: false}));
app.use(bodyps.json());

const mhsRouter = require('./routes/mahasiswa');
app.use('/api/mhs', mhsRouter);

app.listen(port, () => {
  console.log(`aplikasi berjalan di http:://localhost:${port}`);
});
