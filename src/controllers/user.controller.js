const { where } = require("sequelize");
const validator = require("email-validator");
const db = require("../models");
const User = db.User;

exports.create = (req, res) => {
    User.findOne({ where: { email: req.body.email } })
        .then(emailData => {
            if(emailData) {
                return res.send({
                    message : "User with the email id already exists"
                });   
            }
            else {
                User.findOne({ where: {mobile: req.body.mobile } })
                    .then(mobileData => {
                        if(mobileData) {
                            return res.send({
                                message : "User with the mobile number already exists"
                            }); 
                        }
                        else {
                            const user = {
                                name: req.body.name,
                                mobile: req.body.mobile,
                                email: req.body.email,
                                address: req.body.address
                            };
                        
                              User.create(user)
                              .then(data => {
                                res.send(data);
                              })
                              .catch(err => {
                                res.status(500).send({
                                  message:
                                    err.message || "Some error occurred while saving user details."
                                });
                            });

                        }
                    }) 
            }
        }); 
    };


    

  exports.findAll = (_req,res) => {
    User.findAll()
        .then(users => {
            let requiredFields = users.map(user => {
                return {
                    name : user.name,
                    mobile : user.mobile,
                    email : user.email,
                    address : user.address
                }
            })
            res.send(requiredFields);
        })
        .catch(err => {
            res.status(500).send({
                message : "Error fetching user details" + err
            });
        });
  };



  exports.findUserById = (req, res) => {
    User.findByPk(req.params.id)
        .then(data => {
            if (!data) {
                return res.status(404).send({
                    message: "No user found"
                });
            }
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: "Error fetching user details:" + err
            });
        });
};




   exports.updateUserById = (req, res) => {
    const id = req.params.id;
    const { email, mobile } = req.body;

    User.findOne({ where: { email: email }})
        .then(emailData => {
            if (emailData && emailData.id != id) {
                return res.send({
                    message: "User with the email id already exists. Try with some other email!"
                }); 
            } else {
                User.findOne({ where: { mobile: mobile }})
                    .then(mobileData => {
                        if (mobileData && mobileData.id != id) {
                            return res.send({
                                message: "User with the mobile number already exists"
                            }); 
                        } else {
                            User.update(req.body, { where: { id: id }})
                                .then(() => {
                                    res.send({
                                        message: "User details updated successfully"
                                    });
                                })
                                .catch(err => {
                                    res.status(500).send({
                                        message: err.message || "Some error occurred while updating user details."
                                    });
                                });
                        }
                    })
            }
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while updating user details."
            });
        });
};



exports.deleteUserById = (req, res) => {
    const id = req.params.id;

    User.destroy({
        where : {id: id}
    })
    .then(num => {
        if(num == 1){
            res.send({
                message : "User deleted successfully"
            });
        }
        else{
            res.status(404).send({
                message : "User not found"
            });
        }   
    })
    .catch(err => {
        res.status(500).send({
            message:
              err.message || "Some error occurred while deleting a user."
          });
    });
  };



  exports.deleteAll = (req, res) => {
    User.truncate()
    .then(() => {
        res.send({
            message : "Users deleted successfully"
        }); 
    })
    .catch(err => {
        res.status(500).send({
            message:
              err.message || "Some error occurred while deleting users"
          });
    });
  };