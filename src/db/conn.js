const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/imagehealthapi", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false 
}).then(() => {
    console.log("Connection is successful....");
}).catch((e) => {
    console.log("No connection"); 
})