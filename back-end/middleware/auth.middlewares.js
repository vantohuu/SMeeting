var dbconfig = require("../dbconfig");
const sql = require("mssql");
const authMethod = require("../helper/auth.helper");
const jwt = require("jsonwebtoken");

exports.isAuth = async (req, res, next) => {
  // Lấy access token từ header
  const accessTokenFromHeader = req.headers.x_authorization;

  console.log(accessTokenFromHeader);
  if (!accessTokenFromHeader) {
    return res.status(401).json({
      success: false,
      message: "accessToken not found",
    });
  }

  const body = req.body;

  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

  const verified = await authMethod.verifyToken(
    accessTokenFromHeader,
    accessTokenSecret
  );

  const decodedToken = jwt.decode(accessTokenFromHeader, {
    complete: true,
  });
  console.log(decodedToken);

  const username = decodedToken.payload.payload.username;

  if (!verified || username != body.username)
    return res.status(401).json({
      success: false,
      message: "You are denied",
    });

  let pool = await sql.connect(dbconfig);
  const queryString =
    "SELECT * from USERS where USERNAME = '" + body.username + "'";
  let users = await pool.request().query(queryString);

  const user = users.recordsets[0][0];

  req.user = user;

  return next();
};
