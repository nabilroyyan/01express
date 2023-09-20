const express = require("express");
const router = express.Router();

const { body, validationResult } = require("express-validator");

const connection = require("../config/db");
router.get("/", function (req, res) {
  connection.query(
    "select * from mahasiswa order by id_m desc",
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
  [
    //validation
    body("nama").notEmpty(),
    body("nrp").notEmpty(),
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
    };
    connection.query("insert into mahasiswa set ?", data, function (err, rows) {
      if (err) {
        return res.status(500).json({
          status: false,
          massage: "server eror",
        });
      } else {
        return res.status(201).json({
          status: true,
          massage: "succes",
          data: rows[0],
        });
      }
    });
  }
);

router.get("/(:id)", function (req, res) {
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
  [body("nama").notEmpty(), body("nrp").notEmpty()],
  (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(422).json({
        error: error.array(),
      });
    }
    let id = req.params.id;
    let data = {
      nama: req.body.nama,
      nrp: req.body.nrp,
    };
    connection.query(
      `update mahasiswa set ? where id_m = ${id}`,
      data,
      function (err, rows) {
        if (err) {
          return res.status(500).json({
            status: false,
            massage: "server eror",
          });
        } else {
          return res.status(200).json({
            status: true,
            massage: "update berhasil",
          });
        }
      }
    );
  }
);

module.exports = router;
