const config = {
  user: "sa", // sql user
  password: "123", //sql user password
  server: "127.0.0.1", // if it does not work try- localhost
  database: "smeeting",
  options: {
    trustedconnection: true,
    enableArithAbort: true,
    encrypt: false,
    instancename: "HP", // SQL Server instance name
  },
  port: 1433,
};

module.exports = config;
