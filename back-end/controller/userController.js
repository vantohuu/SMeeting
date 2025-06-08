const sql = require("mssql");
const bcrypt = require("bcrypt");
const randToken = require("rand-token");

var dbconfig = require("../dbconfig");
const timeHelper = require("../helper/time.helper");
const authMethod = require("../helper/auth.helper");

const userController = {};

userController.registerUser = async (req, res, next) => {
  try {
    const body = req.body;
    console.log(req.body);
    await timeHelper.delay(2000);
    if (!body) {
      res.status(200).json({
        success: false,
        message: "Body is empty",
      });
    }
    let pool = await sql.connect(dbconfig);
    console.log(process.env.SALT_ROUNDS);
    const queryStringCheck =
      "SELECT * from USERS where USERNAME = '" + body.username + "' ";
    let users = await pool.request().query(queryStringCheck);
    console.log(queryStringCheck, users.recordsets);
    if (!Array.isArray(users.recordsets) || users.recordsets[0].length == 0) {
      const hashPassword = bcrypt.hashSync(
        req.body.password,
        parseInt(process.env.SALT_ROUNDS)
      );
      const queryString =
        "INSERT INTO USERS(USERNAME, PASSWORD) VALUES('" +
        body.username +
        "' , '" +
        hashPassword +
        "')";
      console.log(queryString);

      const accessTokenLife = process.env.ACCESS_TOKEN_LIFE;
      const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

      const dataForAccessToken = {
        username: body.username,
      };

      const accessToken = await authMethod.generateToken(
        dataForAccessToken,
        accessTokenSecret,
        accessTokenLife
      );

      if (!accessToken) {
        return res.status(401).json({
          success: false,
          message: "Register unsuccess! Can't create accessToken",
        });
      }

      let users = await pool.request().query(queryString);

      res.status(200).json({
        success: true,
        data: users.recordsets,
        accessToken,
        message: "Success",
      });
    } else {
      res.status(409).json({
        success: false,
        message: "Username was exists",
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({
      sucess: false,
      message: "Sever is faulty",
    });
  }
};

userController.loginUser = async (req, res, next) => {
  try {
    const body = req.body;
    console.log(req.body);
    await timeHelper.delay(2000);
    if (!body || !body.username || !body.password) {
      res.status(401).json({
        success: false,
        message: "Body is invalid",
      });
    }
    let pool = await sql.connect(dbconfig);
    const queryString =
      "SELECT * from USERS where USERNAME = '" + body.username + "'";
    let users = await pool.request().query(queryString);

    let user = {};
    if (!Array.isArray(users.recordsets) || users.recordsets[0].length == 0) {
      res.status(401).json({
        success: false,
        message: "Wrong username",
      });
    } else {
      user = users.recordsets[0][0];
      console.log(user.PASSWORD, users.recordsets[0][0]);
      const isPasswordValid = bcrypt.compareSync(body.password, user.PASSWORD);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: "Wrong password",
        });
      } else {
        const accessTokenLife = process.env.ACCESS_TOKEN_LIFE;
        const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

        const dataForAccessToken = {
          username: body.username,
        };

        const accessToken = await authMethod.generateToken(
          dataForAccessToken,
          accessTokenSecret,
          accessTokenLife
        );
        if (!accessToken) {
          return res.status(401).json({
            success: false,
            message: "Login unsuccess! Please login again",
          });
        }

        let refreshToken = randToken.generate(
          parseInt(process.env.refreshTokenSize)
        ); // tạo 1 refresh token ngẫu nhiên
        if (!user.refreshToken) {
          // Nếu user này chưa có refresh token thì lưu refresh token đó vào database

          const queryString =
            "UPDATE USERS SET refreshToken = '" +
            refreshToken +
            "' WHERE USERNAME = '" +
            user.USERNAME +
            "'";
          let result = await pool.request().query(queryString);
        } else {
          // Nếu user này đã có refresh token thì lấy refresh token đó từ database
          refreshToken = user.refreshToken;
        }
        let data = {
          accessToken,
          refreshToken,
          display_name: user.FIRSTNAME + " " + user.LASTNAME,
          user,
        };
        res.status(200).json({
          success: true,
          data: data,
          message: "Success",
        });
      }
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Sever is faulty",
    });
  }
};

userController.updateInfor = async (req, res) => {
  try {
    const data = req.body;
    console.log(data);
    const queryString =
      "UPDATE USERS SET FIRSTNAME = '" +
      data.firstName +
      "' , LASTNAME = '" +
      data.lastName +
      "', DATEOFBIRTH = CAST('" +
      data.dob +
      "' as date) , PHONE = '" +
      data.phone +
      "' , SEX = " +
      data.sex +
      " WHERE USERNAME = '" +
      data.username +
      "'";
    console.log(queryString);
    let pool = await sql.connect(dbconfig);

    let result = await pool.request().query(queryString);

    res.status(200).json({
      success: true,
      data: result,
      message: "Success",
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Sever is faulty",
    });
  }
};

userController.refreshToken = async (req, res) => {
  // Lấy access token từ header
  const accessTokenFromHeader = req.headers.x_authorization;
  if (!accessTokenFromHeader) {
    return res.status(400).json({
      success: false,
      message: "Not found accessToken",
    });
  }

  // Lấy refresh token từ body
  const refreshTokenFromBody = req.body.refreshToken;
  if (!refreshTokenFromBody) {
    return res.status(400).json({
      success: false,
      message: "Not found refreshToken",
    });
  }

  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
  const accessTokenLife = process.env.ACCESS_TOKEN_LIFE;

  // Decode access token đó
  const decoded = await authMethod.decodeToken(
    accessTokenFromHeader,
    accessTokenSecret
  );
  if (!decoded) {
    return res.status(400).json({
      success: false,
      message: "accessToken invalid",
    });
  }

  const username = decoded.payload.username; // Lấy username từ payload

  let pool = await sql.connect(dbconfig);
  const queryString = "SELECT * from USERS where USERNAME = '" + username + "'";
  let users = await pool.request().query(queryString);
  const user = users.recordsets[0][0];

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "user not exists",
    });
  }

  if (refreshTokenFromBody !== user.refreshToken) {
    return res.status(400).json({
      success: false,
      message: "refreshToken invalid",
    });
  }

  // Tạo access token mới
  const dataForAccessToken = {
    username,
  };

  const accessToken = await authMethod.generateToken(
    dataForAccessToken,
    accessTokenSecret,
    accessTokenLife
  );
  if (!accessToken) {
    return res.status(400).json({
      success: false,
      message: "Create accessToken not success ",
    });
  }
  return res.json({
    accessToken,
  });
};

module.exports = userController;
