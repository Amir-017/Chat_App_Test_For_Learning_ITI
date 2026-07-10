const { Router } = require("express");
const { createUser, getAllUsers , login} = require("../controller/users.controllers");    
const { auth } = require("../Auth/auth");
const { allMessages,editeMessage,deleteMessage } = require("../controller/messages.controller");

const router = Router();

router.get("/",auth, allMessages);     
router.patch("/editeMessage/:id",auth, editeMessage);
// router.delete("/:id",auth, deleteMessage);
module.exports = router;    
