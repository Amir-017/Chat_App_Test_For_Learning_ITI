const { Router } = require("express");
const { createUser, getAllUsers , login , specificUser} = require("../controller/user.controller");    
const { auth } = require("../Auth/auth");

const router = Router();

router.post("/", createUser);
router.post("/login", login);     
router.get("/",auth, getAllUsers);     
router.get("/userInfo",auth, specificUser);     
module.exports = router;
