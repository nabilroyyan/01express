const express = require("express");
const router = express.Router();
const connection = require("../config/db");
const { body, validationResult } = require("express-validator");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (reg, file, cb) => {
    cb(null, "public/images");
  },
  filename: (reg, file, cb) => {
    console.log(file);
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

//filter ga,bar jpg/png
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true); //izinkan file
  } else {
    cb(new Error("jenis file salah"), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

router.get("/", function (req, res) {
  connection.query(
    "SELECT a.nama, b.nama_jurusan AS jurusan FROM mahasiswa a JOIN jurusan b ON b.id_j = a.id_jurusan ORDER BY a.id_m DESC",
    function (err, rows) {
      if (err) {
        return res.status(500).json({
          status: false,
          message: "Server Failed",
        });
      } else {
        return res.status(200).json({
          status: true,
          message: "Data Mahasiswa",
          data: rows,
        });
      }
    }
  );
});

router.post(
  "/store",
  upload.fields([
    { name: "gambar", maxCount: 1 },
    { name: "swa_foto", maxCount: 1 },
  ]),
  [
    //validation
    body("nama").notEmpty(),
    body("nrp").notEmpty(),
    body("id_jurusan").notEmpty(),
  ],
  (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(422).json({
        error: error.array(),
      });
    }
    let data = {
      nama: req.body.nama,
      nrp: req.body.nrp,
      id_jurusan: req.body.id_jurusan,
      gambar: req.files.gambar[0].filename,
      swa_foto: req.files.swa_foto[0].filename,
    };
    connection.query("insert into mahasiswa set ?", data, function (err, rows) {
      if (err) {
        return res.status(500).json({
          status: false,
          massage: "server eror",
          error: error.array(),
        });
      } else {
        return res.status(201).json({
          status: true,
          massage: "succes",
          data: rows[0],
          error: error.array(),
        });
      }
    });
  }
);

router.get("/:id", function (req, res) {
  let id = req.params.id;
  connection.query(
    `select * from mahasiswa where id_m = ${id}`,
    function (err, rows) {
      if (err) {
        return res.status(500).json({
          status: false,
          massage: "server eror",
        });
      }
      if (rows.length <= 0) {
        return res.status(404).json({
          status: false,
          massage: "not found",
        });
      } else {
        return res.status(200).json({
          status: true,
          massage: "data mahasiswa",
          data: rows[0],
        });
      }
    }
  );
});

router.patch(
  "/update/:id",
  upload.fields([
    { name: "gambar", maxCount: 1 },
    { name: "swa_foto", maxCount: 1 },
  ]),
  [
    body("nama").notEmpty(),
    body("nrp").notEmpty(),
    body("id_jurusan").notEmpty(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array(),
      });
    }

    const id = req.params.id;

    const gambar = req.files["gambar"] ? req.files["gambar"][0].filename : null;
    const swa_foto = req.files["swa_foto"]
      ? req.files["swa_foto"][0].filename
      : null;

    connection.query(
      `SELECT * FROM mahasiswa WHERE id_m = ${id}`,
      function (err, rows) {
        if (err) {
          return res.status(500).json({
            status: false,
            message: "Server Error",
          });
        }
        if (rows.length === 0) {
          return res.status(404).json({
            status: false,
            message: "Not Found",
          });
        }

        const gambarLama = rows[0].gambar;
        const swa_fotoLama = rows[0].swa_foto;

        if (gambarLama && gambar) {
          const pathGambar = path.join(
            __dirname,
            "../public/images",
            gambarLama
          );
          fs.unlinkSync(pathGambar);
        }
        if (swa_fotoLama && gambar) {
          const pathSwa = path.join(
            __dirname,
            "../public/images",
            swa_fotoLama
          );
          fs.unlinkSync(pathSwa);
        }

        let Data = {
          nama: req.body.nama,
          nrp: req.body.nrp,
          id_jurusan: req.body.id_jurusan,
          gambar: gambar,
          swa_foto: swa_foto,
        };

        connection.query(
          `UPDATE mahasiswa SET ? WHERE id_m = ${id}`,
          Data,
          function (err, result) {
            if (err) {
              return res.status(500).json({
                status: false,
                message: "Server Error",
              });
            } else {
              return res.status(200).json({
                status: true,
                message: "Update Sukses..!",
              });
            }
          }
        );
      }
    );
  }
);

router.delete("/delete/:id_m", function (req, res) {
  const id_m = req.params.id_m;

  connection.query(
    `SELECT * FROM mahasiswa WHERE id_m = ${id_m}`,
    function (err, rows) {
      if (err) {
        return res.status(500).json({
          status: false,
          message: "Server Error",
        });
      }
      if (rows.length === 0) {
        return res.status(404).json({
          status: false,
          message: "Not Found",
        });
      }

      const gambarLama = rows[0].gambar;
      const swa_fotoLama = rows[0].swa_foto;
      // Hapus file lama jika ada
      if (gambarLama) {
        const pathfileLama = path.join(
          __dirname,
          "../public/images",
          gambarLama
        );
        fs.unlinkSync(pathfileLama);
      }
      if (swa_fotoLama) {
        const pathfileLama = path.join(
          __dirname,
          "../public/images",
          swa_fotoLama
        );
        fs.unlinkSync(pathfileLama);
      }
      connection.query(
        `delete from mahasiswa where id_m = ${id_m}`,
        function (err, result) {
          if (err) {
            return res.status(500).json({
              status: false,
              message: "Server Error",
            });
          } else {
            return res.status(200).json({
              status: true,
              message: "Deleted Sukses..!",
            });
          }
        }
      );
    }
  );
});

module.exports = router;
