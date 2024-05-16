const scriptTagPattern = require('../config/patterns.js');

module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
          validate: {
            notEmpty: true, 
            noScriptTags: function(value) {
              if (scriptTagPattern.test(value)) {
                console.log("Validation function called with value:", value);
                throw new Error('Name cannot contain script tags');
              }
            }
          }
        },
        mobile: {
            type: Sequelize.BIGINT,
            allowNull: false,
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
              isEmail: true,
              notEmpty: true, 
            }
        },
        address: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        password: {
          type: Sequelize.STRING,
          allowNull: false,
        }
    });

    return User;
};
