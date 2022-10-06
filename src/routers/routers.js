const express = require("express");
const Register = require("../models/register");
const auth = require("../middleware/auth");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const router = new express.Router();


var imagename = "";

//upload image
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './uploads');
    },
    filename: (req, file, callback) => {
        console.log(file);
        imagename = file.originalname;
        // callback(null, Date.now() + file.originalname);
        callback(null, file.originalname);
    }
});
const upload = multer({ storage: storage });



router.get("/", (req, res) => {
    const username = { "username": req.cookies.username }
    res.render('index', username);

});

router.get("/secret", auth, (req, res) => {
    // console.log(`save cookies in local storage ${req.cookies.jwt}`);
    res.render('secret');

});

//health api create
router.get("/health", (req, res) => {
    // console.log(`save cookies in local storage ${req.cookies.jwt}`);
    res.render('health');

});

router.get('/about', (req, res) => {
    res.render('about');
})

router.get('/weather', (req, res) => {
    res.render('weather');
})

router.get('/contacts', (req, res) => {
    res.render('contacts');
})

router.get('/reset_password', (req, res) => {
    res.render('reset_password');
})

router.get("/Profile", async(req, res) => {

    try {
        const veryfyUser = jwt.verify(req.cookies.jwt, process.env.SECRET_KEY);
        const user = await Register.findOne({ _id: veryfyUser._id });
        // console.log(user);
        res.render('Profile', user);
    } catch (error) {
        console.log("please log in");
        res.render("login");
    }


});

router.get('/login', (req, res) => {

    const username = { "username": req.cookies.username }

    res.render('login', username);
})

router.get('/logout', async(req, res) => {

    try {
        const veryfyUser = jwt.verify(req.cookies.jwt, process.env.SECRET_KEY);
        const user = await Register.findOne({ _id: veryfyUser._id });
        // console.log(veryfyUser);
        const DeleteAccount = { "DeleteAccount": veryfyUser._id, "Loginusersize": user.tokens.length };
        // console.log(DeleteAccount);
        // console.log(user.tokens.length);
        res.render("logout", DeleteAccount);
    } catch (error) {
        res.render("index");
    }
});

router.get('/logoutsingle', auth, async(req, res) => {
    try {
        // console.log(req.user._id);
        // console.log(req.user.tokens); //All the token print
        // console.log(req.user.tokens.length); //All the token size print

        // for single device logout
        req.user.tokens = req.user.tokens.filter((curretUserToken) => {
            return curretUserToken.token != req.token
        });

        // LOGOUT all Device 
        // req.user.tokens = [];

        res.clearCookie("jwt");
        res.clearCookie("username");
        console.log("Log out successful");

        await req.user.save();
        res.render("login");
    } catch (error) {
        res.status(500).send(error);
    }

});

router.get('/logoutmul', auth, async(req, res) => {

    try {
        // console.log(req.user);

        //for single device logout
        // req.user.tokens = req.user.tokens.filter((curretUserToken) => {
        //     return curretUserToken.token != req.token
        // });

        // LOGOUT all Device
        req.user.tokens = [];

        res.clearCookie("jwt");
        res.clearCookie("username");
        console.log("Log out successful");

        await req.user.save();
        res.render("login");
    } catch (error) {
        res.status(500).send(error);
    }

})

//secure register
router.post("/contacts", upload.single('myfile'), async(req, res) => {

    try {
        const password = req.body.password;
        const confirmPassword = req.body.confirmPassword;
        console.log(imagename);

        if (password === confirmPassword) {

            const user = new Register({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                confirmPassword: req.body.confirmPassword,
                phone: req.body.phone,
                message: req.body.message,
                image: imagename
            });

           

            // console.log("the succcess part " + user);
            const token = await user.genereteAuthToken();
            // console.log("the token part " + token);

            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 6000000)
            });

            res.cookie("username", user.username, {
                expires: new Date(Date.now() + 6000000),
                httpOnly: true,
                // secure:true
            });

            // console.log(cookie);
            // console.log(cookies.get("jwt"));


            const createuser = await user.save();
            // console.log("the page part " + createuser);
            const username = { "username": req.body.username };
            res.status(201).render('index', username);
        } else {
            res.status(400).send("Please check password confirm..");
        }
    } catch (e) {
        res.status(400).send(e);
    }

});

// //login register
router.post("/login", async(req, res) => {

    try {
        const email = req.body.email;
        const password = req.body.password;

        // console.log(email);

        const userData = await Register.findOne({ email: email });

        if(!userData){
            res.status(400).send("Please valid login.");
        }
        // const userData = await Register.find({ email: email }).then(user => {
        //     if (user) {
        //         return res.status(400).send("Please valid login.");
        //     }
        // });

        // console.log(userData.password);
        // console.log(req.body.password);
        const passwordmatch = await bcrypt.compare(password, userData.password)
            // console.log(passwordmatch);

        if (passwordmatch) {

            const token = await userData.genereteAuthToken();
            // console.log("the token part " + token);

            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 6000000),
                httpOnly: true,
                // secure:true
            });

            res.cookie("username", userData.username, {
                expires: new Date(Date.now() + 6000000),
                httpOnly: true,
                // secure:true
            });

            const username = { "username": req.cookies.username }
            res.status(201).render('index', username);
        } else {
            res.status(400).send("Please valid login.");
            // res.status(400).render('login');
        }
    } catch (e) {
        res.status(400).send(e);
    }

});


//health api create
router.post("/health", async(req, res) => {

    try {
        const healthname = req.body.healthname;
        const healthnumber = req.body.healthnumber;
        const healthimage = req.body.healthimage;
        const healthurl = req.body.healthurl;
        const healthmessage = req.body.healthmessage;


        const veryfyUser = jwt.verify(req.cookies.jwt, process.env.SECRET_KEY);
        const healthuser = await Register.findOne({ _id: veryfyUser._id });

        const token = await healthuser.genereteHealthApi(healthname, healthnumber, healthimage, healthurl, healthmessage);

        res.status(201).render('index');
    } catch (e) {
        res.status(400).send(e);
    }

});

//profical password reset
router.post("/passreset", async(req, res) => {

    try {

        const currentpass = req.body.Currpassword;
        const newpassword = req.body.newpassword;
        const repassword = req.body.repassword;

        const veryfyUser = jwt.verify(req.cookies.jwt, process.env.SECRET_KEY);
        const user = await Register.findOne({ _id: veryfyUser._id });


        const passwordmatch = await bcrypt.compare(currentpass, user.password)

        const nnewpassword = await bcrypt.hash(newpassword, 10);
        const nrepassword = await bcrypt.hash(repassword, 10);

        if (passwordmatch) {

            const result = await Register.updateOne({ _id: user._id }, {
                $set: {
                    password: nnewpassword,
                    confirmPassword: nrepassword
                }
            });

            // console.log(result);

            const username = { "username": req.cookies.username }
            res.status(201).render('index');

        } else {
            // res.status(400).send("Please valid login.");
            res.status(201).render('Profical');
        }

    } catch (error) {
        res.status(400).send(e);
    }
})

// Password reset
router.post("/reset_password", async(req, res) => {

    try {

        const email = req.body.email;
        const rpassword = req.body.rpassword;
        const rcpassword = req.body.rcpassword;

        const user = await Register.findOne({ email: email });
        if(!user){
            res.status(400).send("Please valid login.");
        }

        const nrpassword = await bcrypt.hash(rpassword, 10);
        const nrcpassword = await bcrypt.hash(rcpassword, 10);

        if (email == user.email) {

            console.log("reset password");
            const result = await Register.updateOne({ _id: user._id }, {
                $set: {
                    password: nrpassword,
                    confirmPassword: nrcpassword
                }
            });

            console.log(result);

            const username = { "username": req.cookies.username }
            res.status(201).render('index');

        } else {
            // res.status(400).send("Please valid login.");
            res.status(201).render('reset_password');
        }

    } catch (error) {
        res.status(400).send(e);
    }
})

//show api particular usre
router.get("/healthshow", async(req, res) => {

    try {
        const veryfyUser = jwt.verify(req.cookies.jwt, process.env.SECRET_KEY);
        const healthuser = await Register.find({ _id: veryfyUser._id }, { _id: 0, tokens: 0, password: 0, confirmPassword: 0, healthapi: { _id: 0 }, __v: 0 });

        res.status(201).send(healthuser);
    } catch (e) {
        res.status(400).send(e);
    }

});

//crud app
router.get('/crud', async(req, res) => {
    await Register.find((err, docs) => {
        if (!err) {
            res.status(201).render("crud", {
                list: docs
            });
        } else {
            console.log('Error in retrieving crud list :' + err);
        }
    });
});

//delete the students by it id
router.get("/delete/:id", async(req, res) => {
    try {

        // const _id = req.params.id;

        const deletStudent = await Register.findByIdAndDelete(req.params.id);

        if (!req.params.id) {
            return res.status(400).redirect("../crud");
        }

        //delete account cookies delete
        res.clearCookie("jwt");
        res.clearCookie("username");

        res.status(400).redirect('../');
    } catch (e) {
        res.status(500).send(e);
    }
});


// update crud
// router.get('/update', (req, res) => {
//     res.render('update');
// })

router.get('/update/:id', async(req, res) => {
    // console.log(req.params.id);

    // const _id = req.params.id;
    try {
        const updatedata = await Register.findById(req.params.id);
        res.render('update', {
            register: updatedata
        });
    } catch (error) {
        res.status(400).redirect('../crud');
    }
});

router.post("/update", async(req, res) => {
    try {

        const _id = req.body.id;
        const updateStudents = await Register.findOneAndUpdate({ _id: req.body._id }, req.body, {
            new: true
        });

        res.status(400).redirect('/crud');
        // console.log(updateStudents);
    } catch (e) {
        res.status(400).redirect('../crud');
    }
})




//404 error page
router.get('*', (req, res) => {
    res.render("404error", {
        errorMsg: 'Opps! Page Not Found'
    });
})



module.exports = router;