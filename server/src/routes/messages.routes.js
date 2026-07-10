const { Router } = require("express");
const { createUser, getAllUsers , login} = require("../controller/user.controller");    
const { auth } = require("../Auth/auth");
const { allMessages,editeMessage,deleteMessage } = require("../controller/message.controller");

const router = Router();

router.get("/",auth, allMessages);     
router.patch("/editeMessage/:id",auth, editeMessage);
router.delete("/deleteMessage/:id",auth, deleteMessage);
module.exports = router;
