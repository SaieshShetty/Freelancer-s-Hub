const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('./models/user');
const PostModel = require('./models/post');
const ReviewModel = require('./models/review');
const upload = require('./config/multerconfig');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('LoginPage');
})

app.post('/', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(500).send("User not found!");
        }

        bcrypt.compare(password, user.password, (err, result) => {
            if (err || !result) {
                return res.status(500).send("Invalid credentials.");
            }

            const token = jwt.sign(
                { email: user.email, userid: user._id },
                'shhhh',
                { expiresIn: '1h' }
            );


            res.cookie("token", token);


            if (user.accountType == "freelancer") {
                res.redirect(`/profile/freelancer`);
            } else if (user.accountType == "client") {
                res.redirect(`/profile/client`);
            } else {
                res.status(500).send("Something went wrong.");
            }
        });
    } catch (error) {
        res.status(500).send("Something went wrong!");
    }
});


app.get('/profile/freelancer', isLoggedIn, async (req, res) => {
    try {
        if (!req.user || !req.user.userid) {
            return res.status(403).send("Unauthorized access!");
        }

        const loggedInUser = await UserModel.findOne({email : req.user.email});

        if (loggedInUser && loggedInUser.accountType === 'freelancer') {
            const clients = await UserModel.find({ accountType: 'client' }).populate("posts");

            res.render('landing', { users: clients });
        } else {
            res.status(403).send("Unauthorized access!");
        }
    } catch (error) {
        console.error("Error fetching freelancer profile:", error);
        res.status(500).send("Server error!");
    }
});

app.get('/profile/client', isLoggedIn, async (req, res) => {
    try {
        if (!req.user || !req.user.userid) {
            return res.status(403).send("Unauthorized access!");
        }
        const loggedInUser = await UserModel.findOne({email : req.user.email});
        if (loggedInUser && loggedInUser.accountType === 'client') {
            const freelancers = await UserModel.find({ accountType: 'freelancer' }).populate("posts");
            res.render('landingClient', { users: freelancers });
        } else {
            res.status(403).send("Unauthorized access!");
        }
    } catch (error) {
        console.error("Error fetching client profile:", error);
        res.status(500).send("Server error!");
    }
});


app.get('/create', (req, res) => {
    res.render('Profilelogin');
})

app.get('/rating' , isLoggedIn , (req,res) =>{
    res.render('Ratings') ;
})

app.get('/edit/:userid' , isLoggedIn , async (req,res) =>{
    let user = await UserModel.findOne({_id : req.params.userid})
    res.render('Edit' , {user}) ;
})

app.post('/edit/:userid', isLoggedIn , upload.single("profilePhoto"), async (req, res) => {
    try {
        let newuser = await UserModel.findOneAndUpdate(
            { _id: req.params.userid },
            {
                username: req.body.username,
                email: req.body.email,
                Age: req.body.age,
                Phno: req.body.Phno,
                profilePhoto: req.file.filename, 
            },
            { new: true }
        );

        if (!newuser) {
            return res.status(404).send("User not found!"); // Handle case where user is not found
        }

        res.redirect('/about'); // Redirect after successful update
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).send("Something went wrong while updating the user!");
    }
});


app.get('/about' , isLoggedIn , async (req,res) =>{
    let user = await UserModel.findOne({email : req.user.email}) ;
    res.render('Profile' , {user}) ;
})

app.get('/aboutassign/:postId', isLoggedIn, async (req, res) => {
    try {
        const postId = req.params.postId;
        
        const post = await PostModel.findById(postId).populate('user');
        
        if (!post) {
            return res.status(404).send("Post not found");
        }
        
        res.render('Aboutassign', { post }); 
    } catch (error) {
        console.error("Error fetching post:", error);
        res.status(500).send("Server error!");
    }
});

app.post('/post', isLoggedIn, async (req, res) => {
    try {
        let user = await UserModel.findOne({ email: req.user.email });

        if (!user) {
            return res.status(404).send("User not found!");
        }

        let { content, projectTitle, budget, deadline } = req.body;

        let post = await PostModel.create({
            user: user._id,
            content,
            projectTitle,
            budget,
            deadline
        });

        user.posts.push(post._id);
        await user.save(); 

        if (user.accountType === 'client') {
            res.redirect('/profile/client');
        } else if (user.accountType === 'freelancer') {
            res.redirect('/profile/freelancer');
        } else {
            res.redirect('/'); 
        }
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).send("Server error!");
    }
});


app.post('/create',upload.single("profilePhoto"), async (req, res) => {
    try {
        let { username, email, Phno, password, Age, accountType } = req.body;

        let user = await UserModel.findOne({ email });
        if (user) {
            return res.status(500).send("User already registered!");
        }

        bcrypt.genSalt(10, (err, salt) => {
            if (err) {
                return res.status(500).send("Error.!");
            }

            bcrypt.hash(password, salt, async (err, hash) => {
                if (err) {
                    return res.status(500).send("Error!");
                }

                let createduser = await UserModel.create({
                    username,
                    email,
                    Phno,
                    Age,
                    password: hash,
                    accountType,
                    profilePhoto : req.file.filename
                });

                let token = jwt.sign(
                    { email: createduser.email, userid: createduser._id },
                    "shhhh"
                );

                res.cookie("token", token);

                if (createduser.accountType == "freelancer") {
                    return res.render("landing");
                } else if (createduser.accountType == "client") {
                    return res.render("landingClient");
                }
            });
        });
    } catch (error) {
        res.status(500).send("Something went wrong!");
    }
});

app.get('/logout', (req, res) => {
    res.cookie("token", "");
    res.redirect('/');
})

function isLoggedIn(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        res.status(401).redirect("/");
    }

    try {
        let data = jwt.verify(token, "shhhh");
        req.user = data;
        next();
    } catch (err) {
        return res.status(403).send("Invalid or expired token!");
    }
}


app.listen(3000);
