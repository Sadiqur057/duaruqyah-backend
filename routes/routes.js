const express = require("express");
const router = express.Router();
const { getDuaById, getCategories } = require("../controller/controller");

router.get("/categories", getCategories);


module.exports = router;
