const sql = require("mssql");

var dbconfig = require("../dbconfig");
const timeHelper = require("../helper/time.helper");
const authMethod = require("../helper/auth.helper");

const meetingController = {};

meetingController.createMeeting = async (req, res, next) => {
  try {
    const body = req.body;
    console.log(req.body);
    if (!body) {
      res.status(200).json({
        success: false,
        message: "Body is empty",
      });
    }
    let pool = await sql.connect(dbconfig);
    const queryStringCheck =
      "SELECT * from MEETING where CODE = '" + body.code + "' ";
    let meetings = await pool.request().query(queryStringCheck);
    console.log(queryStringCheck, meetings.recordsets);
    if (
      !Array.isArray(meetings.recordsets) ||
      meetings.recordsets[0].length == 0
    ) {
      const queryString =
        "INSERT INTO MEETING(CODE, OWNER, TOPIC, CAPACITY, STATUS) VALUES('" +
        body.code +
        "' , '" +
        body.username +
        "' ,'" +
        body.topic +
        "' ," +
        body.capacity +
        " ," +
        body.status +
        ")";
      console.log(queryString);

      let meetings = await pool.request().query(queryString);
      console.log(meetings);
      res.status(200).json({
        success: true,
        data: { code: body.code, owner: body.username },
        message: "Success",
      });
    } else {
      res.status(409).json({
        success: false,
        message: "Code was exists",
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Sever is faulty",
    });
  }
};

meetingController.createUserMeeting = async (req, res, next) => {
  try {
    const body = req.body;
    console.log(req.body);
    if (!body) {
      res.status(200).json({
        success: false,
        message: "Body is empty",
      });
    }
    let pool = await sql.connect(dbconfig);

    const queryString =
      "INSERT INTO USER_MEETING(ID, STARTTIME, USERNAME, CODE) VALUES('" +
      body.id +
      "' , " +
      "CONVERT(DATETIME,'" +
      body.starttime +
      "') ,'" +
      body.username +
      "' ,'" +
      body.code +
      "' )";
    console.log(queryString);

    let meetings = await pool.request().query(queryString);
    console.log(meetings);
    res.status(200).json({
      success: true,
      data: body,
      message: "Success",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Sever is faulty",
    });
  }
};

meetingController.updateUserMeeting = async (req, res, next) => {
  try {
    const body = req.body;
    console.log(req.body);
    if (!body) {
      res.status(200).json({
        success: false,
        message: "Body is empty",
      });
    }
    let pool = await sql.connect(dbconfig);

    const queryString =
      "UPDATE USER_MEETING SET " +
      "ENDTIME = " +
      "CONVERT(DATETIME,'" +
      body.endtime +
      "')" +
      " WHERE ID = '" +
      body.id +
      "'";
    console.log(queryString);

    let meetings = await pool.request().query(queryString);
    console.log(meetings);
    res.status(200).json({
      success: true,
      data: body,
      message: "Success",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Sever is faulty",
    });
  }
};

meetingController.createChoiceMeeting = async (req, res, next) => {
  try {
    const body = req.body;
    console.log(req.body);
    if (!body) {
      res.status(200).json({
        success: false,
        message: "Body is empty",
      });
    }
    let pool = await sql.connect(dbconfig);

    let queryString =
      "INSERT INTO CHOICEIMG(ID, STYLE,RATE, WHO, IMPACT, WORKPLACE, HOUR, IDUSMT) VALUES('" +
      body.id +
      "' , '" +
      body.style +
      "' ," +
      "1" +
      " ,'" +
      body.who +
      "' ,'" +
      body.impact +
      "' ,'" +
      body.workplace +
      "' ," +
      body.hour +
      " ," +
      body.idusmt +
      ")";
    console.log(queryString);

    await pool.request().query(queryString);

    queryString = "EXEC select_data_to_predict @ID_CHOICEIMG = " + body.id;
    console.log(queryString);

    let data = await pool.request().query(queryString);
    // if (!Array.isArray(data.recordsets) || data.recordsets[0].length == 0) {
    //   res.status(404).json({
    //     success: false,
    //     message: "Data not found",
    //   });
    // }
    const dt = data.recordsets[0][0];
    console.log(data.recordsets);
    return res.status(200).json({
      success: true,
      data: dt,
      message: "Success",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Sever is faulty",
    });
  }
};

meetingController.updateChoiceMeeting = async (req, res, next) => {
  try {
    const body = req.body;
    console.log(req.body);
    if (!body) {
      res.status(200).json({
        success: false,
        message: "Body is empty",
      });
    }
    let pool = await sql.connect(dbconfig);

    const queryString =
      "UPDATE CHOICEIMG SET " +
      "RATE = " +
      body.rate +
      " ,IDIMG = " +
      body.idimg +
      " WHERE ID = '" +
      body.id +
      "'";
    console.log(queryString);

    await pool.request().query(queryString);
    res.status(200).json({
      success: true,
      data: body,
      message: "Success",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Sever is faulty",
    });
  }
};
meetingController.getURLImg = async (req, res, next) => {
  try {
    const body = req.body;
    console.log(req.body);
    if (!body) {
      res.status(200).json({
        success: false,
        message: "Body is empty",
      });
    }
    let pool = await sql.connect(dbconfig);

    const queryString = "SELECT * FROM IMAGE " + " WHERE ID = " + body.id + "";
    console.log(queryString);

    let imgs = await pool.request().query(queryString);
    if (!Array.isArray(imgs.recordsets) || imgs.recordsets[0].length == 0) {
      res.status(404).json({
        success: false,
        message: "Img not found",
      });
    }
    const img = imgs.recordsets[0][0];
    res.status(200).json({
      success: true,
      data: img,
      message: "Success",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Sever is faulty",
    });
  }
};

// meetingController.getDataToPredict = async (req, res, next) => {
//   try {
//     const body = req.body;
//     console.log(req.body);
//     if (!body) {
//       res.status(200).json({
//         success: false,
//         message: "Body is empty",
//       });
//     }
//     let pool = await sql.connect(dbconfig);

//     const queryString =
//       "EXEC select_data_to_predict @ID_CHOICEIMG = " + body.id;
//     console.log(queryString);

//     let data = await pool.request().query(queryString);
//     if (!Array.isArray(data.recordsets) || data.recordsets[0].length == 0) {
//       res.status(404).json({
//         success: false,
//         message: "Data not found",
//       });
//     }
//     const dt = data.recordsets[0][0];
//     res.status(200).json({
//       success: true,
//       data: dt,
//       message: "Success",
//     });
//   } catch (e) {
//     console.log(e);
//     res.status(500).json({
//       success: false,
//       message: "Sever is faulty",
//     });
//   }
// };
meetingController.getListMeeting = async (req, res, next) => {
  try {
    let pool = await sql.connect(dbconfig);
    const queryStringCheck = "SELECT * from MEETING";
    let meetings = await pool.request().query(queryStringCheck);
    console.log(queryStringCheck, meetings.recordsets);

    res.status(200).json({
      success: true,
      data: meetings,
      message: "Success",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Sever is faulty",
    });
  }
};

meetingController.checkNotExistCodeMeeting = async (req, res, next) => {
  try {
    const code = req.body.code;
    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Body is invalid",
      });
    }
    let pool = await sql.connect(dbconfig);
    const queryStringCheck =
      "SELECT * from MEETING where CODE = '" + code + "'";
    let meetings = await pool.request().query(queryStringCheck);
    console.log(queryStringCheck, meetings.recordsets);
    if (meetings.recordsets[0].length > 0) {
      return res.status(401).json({
        success: false,
        data: meetings,
        message: "Code was exists",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Success",
      });
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "Sever is faulty",
    });
  }
};

module.exports = meetingController;
