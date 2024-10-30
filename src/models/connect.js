    // import { Sequelize } from "sequelize";
    // import configDb from '../config/connect_db.js';
    // const sequelize = new Sequelize(
    //    'youtube_mini', //tên database
    //    'root', // tên user
    //    '123456',// mật khẩu
    //    {
    //       host:'localhost',
    //       port: 3307,
    //       dialect: 'mysql'
    //    }
    //    configDb.database,
    //    configDb.user,
    //    configDb.pass,
    //    {
    //       host:configDb.host,
    //       port:configDb.port,
    //       dialect:configDb.dialect,
    //    }
    // );
    // export default sequelize;
import { Sequelize } from "sequelize";
import configDb from '../config/connect_db.js';
const sequelize = new Sequelize(
    configDb.database,//ten database
    configDb.user,//ten user
    configDb.pass,//password
    {
        host: configDb.host,
        port: configDb.port,
        // dialect: configDb.dialect
        dialect: "mysql"
    }
);

export default sequelize;

