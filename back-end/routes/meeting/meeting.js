const express = require("express");
const router = express.Router();
const meetingController = require("../../controller/meetingController");
const { isAuth } = require("../../middleware/auth.middlewares");

router.post("/create", meetingController.createMeeting);
router.get("/get-list-meeting", meetingController.getListMeeting);
router.post(
  "/check-not-exist-code",
  meetingController.checkNotExistCodeMeeting
);
router.post("/create-user-meeting", meetingController.createUserMeeting);
router.post("/update-user-meeting", meetingController.updateUserMeeting);
router.post("/create-choice-meeting", meetingController.createChoiceMeeting);
router.post("/update-choice-meeting", meetingController.updateChoiceMeeting);
router.post("/get-URL-img", meetingController.getURLImg);
// router.post("/get-data-to-predict", meetingController.getDataToPredict);

module.exports = router;
