const express = require("express");
const router = express.Router();

const {body, validationResult} = require('express-validator');

const connection = require("../config/db");

router.get('/', function(req, res){

});

router.post('/store',[
     //validation
     body('nama').notEmpty(),
     body('nrp').notEmpty()
],(req, res) => {
     const error = validationResult(req);
     if(!error.isEmpty()){
          return res.status(422).json({
               error: error.array()
          });
     }
     let data = {
          nama: req.body.nama,
          nrp: req.body.nrp
     }
     connection.query('insert into mahasiswa set ?', data, function(err, rows){
          if(err){
               return res.status(500).json({
                    status: false,
                    massage: 'server eror',
               })
          }else{
               return res.status(201).json({
                    status: true,
                    massage: 'succes',
                    data: rows[0] 
               })
          }
     })
})


module.exports = router;
