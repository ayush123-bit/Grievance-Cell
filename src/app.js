require('dotenv').config();
const express = require("express");
const app = express();
const hbs=require("hbs")
const path = require("path");
const exphbs = require('express-handlebars');
const upload=require('express-fileupload');
const session=require("express-session")
const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partial_path = path.join(__dirname, "../templates/partials");

app.use(upload());
app.use(express.static(static_path));
require("./db/conn");
const UCER = require("./models/login");
const UCER2 = require("./models/login2");
//require('dotenv').config({ path: './.env' });



// Configure Handlebars as the view engine
let tname=0;let category=0;

let tcategory=0;let semester=0
let fsid=0;let section=0
let ftid=0;let branch=0
hbs.registerHelper('formatSatisfied', function(satisfied, actionCount) {
    if (satisfied === 'Yes') {
        return 'satisfied-yes';
    } else {
        if (actionCount === 0) {
            return 'unsolved-no-action';
        } else if (actionCount > 0 && actionCount <= 3) {
            return 'unsolved-action-taken';
        } else {
            return 'unsolved-max-action';
        }
    }
});
hbs.registerHelper('formatDate', function(dateString) {
    const date = new Date(dateString);
    const ISTOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
    const ISTDate = new Date(date.getTime() - ISTOffset);
    return ISTDate.toLocaleString();
  });
// Define a custom Handlebars helper to increment the index
hbs.registerHelper('increment', function(value) {
    return value + 1;
  });

app.set('view engine', 'hbs');
app.set("views", template_path);
hbs.registerPartials(partial_path);

  
  
  app.use(express.urlencoded({extended:false}));
app.use(express.json());
const nodemailer=require("nodemailer");
const schedule=require("node-schedule");
app.use(session({
    secret: process.env.LAST, // Change this to a secure random string
    resave: false,
    saveUninitialized: true
  }));

let teacherId=0;
//=========================================================================================
   

app.get('/i',async(req,res)=>{
      /*  studentId=21220242;
        const ch=await UCER.find({studentId});
    const ch1=ch[0].complains;

    console.log(ch1);
    //const teachers = await UCER2.find();
    res.render('complain',{
        st:studentId,
        complaint:ch1
    });*/
    res.render("ologin");
    })
    
    app.get("/teachertable", async (req, res) => {
        const teachers = await UCER2.find();
        res.render("facultyreport", { teachers: teachers });
        //res.json(teachers);
      });
      
    
 let specialtid=0;
  
let studentId=0
//===========================================================================================




  //===================================================================================================
app.get('/',(req,res)=>{
    /*const url = 'https://quotes15.p.rapidapi.com/quotes/random/?language_code=en';
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'fb7ce984damshe8fef734ff222b2p1fda52jsn817686b81417',
            'X-RapidAPI-Host': 'quotes15.p.rapidapi.com'
        }
    };
    
    fetch(url,options)
    .then(response=>response.json())
    .then((response)=>{
        res.render("ologin",{
            quotes:response.content,
            name:response.originator.name
        });
    })*/
    res.render("ologin",{
        quotes:"quotes",
        name:"Author"
    });

})
    //=====================================================================================
    app.post('/studentlogin', async (req, res) => {
        
        studentId = req.body.sid;
        const password=req.body.password;
        console.log("Email User:", process.env.EMAIL_USER);
        console.log("Email Pass:", process.env.EMAIL_PASS);
        
        const ch = await UCER.findOne({ studentId,password});
        console.log(ch)
             console.log(ch.block);
        if (ch.length != 0 && ch.block!=1) {
            console.log(1);
            res.json({ success: true });

            

        } else {
            console.log(2);
            res.json({ success: false, message: 'Invalid user credentials' });
        }
    });
    app.get('/student',async(req,res)=>{
        const ch=await UCER.findOne({studentId});
        console.log(ch);
        res.render("student", {
            nm: ch.name.toUpperCase()
        });
      })
    
    //====================================================================================

    app.get('/complain', async (req, res) => {
        const ch = await UCER.find({ studentId });
        let ch1 = ch[0].complains;
        
        // Sort complaints and dates together based on the date
        ch1.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Extract sorted dates
        const date = ch1.map(data => data.date);
        
        console.log(ch1);
        // const teachers = await UCER2.find();
        res.render('complain', {
            st: studentId,
            complaint: ch1,
            date: date
        });
    });
    
//=========================================================================================
app.post('/teacherlogin', async (req, res) => {
    try {
        const { tid, password } = req.body;
        const data = await UCER2({ teacherId: tid, password });

        if (!data) {
            return res.status(404).send({ message: "Not found" });
        }
        specialtid=tid;
        if (tid === '6720') {
            return res.send({ message: "Admin" });
        } else {
            return res.send({ message: "Teacher" });
        }
    } catch (error) {
        return res.status(500).send({ message: "Internal Server Error", error: error.message });
    }
});

//===========================================================================================

app.post('/students',async (req,res)=>{
    console.log(req.body);
const students= await new UCER(req.body);
students.save();
res.send("ok");
})
app.post('/teachers',async (req,res)=>{
    console.log(req.body);
const students= await new UCER2(req.body);
students.save();
res.send("ok");
})


app.post('/complain', async (req, res) => {
    try {
         
         const newComplaint = req.body.complaint;
         if(newComplaint==""){
            res.send("Complaint box cannot be empty.")
         }
         else{
         category=req.body.Category;
         const file = req.files ? req.files.file : null; 
         if(file){
         var filename=file.name;
         const destination = './public/images/' + filename; // Include the filename in the destination path
         file.mv(destination, function (err) {
             if (err) {
                 console.log(err);
             } else {
                 console.log("File Uploaded");
             }})}
         
        const student = await UCER.findOne({ studentId });

        if (!student) {
            res.send("Student not found");
        }
        const l=student.complains.length-1;
        if(file){
        student.complains.push({ complain: newComplaint,category:category,url:filename });
        }
        else{
            student.complains.push({ complain: newComplaint,category:category });   
        }
        await student.save();
         
        const lastComplaint = student.complains[student.complains.length - 1];

       
        const result = await UCER.findOne({ studentId }, 'name email');
        const { name, email } = result;

 
        const transporter = await nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
        });

        const mailOptions = {
            from: "process.env.EMAIL_USER",
            to: email,
            subject: "Complaint Received",
            html: `<p><b>Dear ${name},</b></p>

            <p>Thank you for reaching out to us. This email is to confirm that we have received your complaint. Your concerns are important to us, and we appreciate you taking the time to bring them to our attention.</p>
            <p>Complain:<b>${newComplaint}</b></p>
            <p>Thank you.</p>
            
            <p>Best regards,<br>
            UCER MANAGEMENT`
            
        
        };

     
        await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.send("Error");
            } else {
                console.log("Email sent:" + info.response);
                res.render("ac");

      
                setTimeout(async () => {
                    try {
                        console.log("hi");
            
                        const transporter = await nodemailer.createTransport({
                            host: "smtp.gmail.com",
                            port: 587,
                            auth: {
                                user: process.env.EMAIL_USER,
                                pass:process.env.EMAIL_PASS
                            },
                        });
            
                        const mailOptions = {
                            from: "process.env.EMAIL_USER",
                            to: "process.env.EMAIL_USER",
                            subject: "Unfulfilled Complaint",
                            html: `
                                <p>Name: ${name}</p>
                                <p>Student ID: ${studentId}</p>
                                <p>Complaint: <b>${newComplaint}</b></p>
                                <p>Please take this complaint into consideration. This complaint was registered 5 days ago, and no action has been taken from our side.</p>
                                <p>Click <a href="https://www.google.com">here</a> to visit our website.</p>
                                <p>Thank you.</p>
            
                                <p>Best regards,<br>
                                UCER MANAGEMENT`
                        };
            
                       
                        await transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                console.log("Ayush");
                            } else {
                                console.log("Email sent: " + info.response);
                            }
                        });
                    } catch (err) {
                        console.log(err);
                    }
                },60*1000);
            }
        })}
    }

    catch (err) {
        console.log(err);
    }
}); 




app.get('/cd',(req,res)=>{
    res.render("cdadmin",{
       d:tcategory,
       t:tname ,
       
    });
})


app.post('/complaindata',async(req,res)=>{
   const category=req.body.category;
    
   console.log("Yew");
    const branch=req.body.branch;
    
    const  semester=req.body.semester;
    
    const section=req.body.section;
    
    if(section!="All"){
    if(category=="All"){
    const result =await UCER.find(
        { branch: branch, semester: semester, section: section },
        { _id: 0,name:1,studentId:1, complains: 1 }
      );
      if (result === null || result.length === 0) {
        res.send('No complains found.');
    } 
    else
    {console.log("t3");
    const responseData = {
        totalComplaints: result.length,
        complaints: result
    };
      console.log("t3");
      console.log(responseData);
      res.render('ct', responseData);
    }}
      else{
        const result = await UCER.find(
            {
                branch: branch,
                semester: semester,
                section: section,
                'complains.category': category
            },
            { _id: 0, name: 1, studentId: 1, complains: 1 }
        );
        
        if (result === null || result.length === 0) {
            res.send('No complains found.');
        } else {
            const responseData = {
                totalComplaints: result.reduce((acc, item) => acc + item.complains.filter(c => c.category === category).length, 0),
                complaints: result.map(item => ({
                    
                    studentId: item.studentId,
                    name: item.name,
                    complains: item.complains.filter(c => c.category === category)
                }))
            };
        
            res.render('ct', responseData);
        }
        
        
        
      }
    }
      else{
        if(category=="All"){
            const result =await UCER.find(
                { branch: branch, semester: semester },
                { _id: 0,name:1,studentId:1, complains: 1 }
              );
              if (result === null || result.length === 0) {
                res.send('No complains found.');
            } 
            else
            {
              const responseData = {
                  totalComplaints: result.length,
                  complaints: result
              };
              console.log("YeshAyush")
              try {
                console.log(responseData)
                res.render('ct', responseData);
              } catch (error) {
                console.error("Error rendering template:", error);
                res.status(500).send("Internal Server Error");
              }
            } }
              else{
                const result = await UCER.find(
                    {
                        branch: branch,
                        semester: semester,
                        
                        'complains.category': category
                    },
                    { _id: 0, name: 1, studentId: 1, complains: 1 }
                );
                
                if (result === null || result.length === 0) {
                    res.send('No complains found.');
                } else {
                    const responseData = {
                        totalComplaints: result.reduce((acc, item) => acc + item.complains.filter(c => c.category === category).length, 0),
                        complaints: result.map(item => ({
                           
                            studentId: item.studentId,
                            name: item.name,
                            complains: item.complains.filter(c => c.category === category)
                        }))
                    };
                console.log(responseData);
                    res.render('ct', responseData);
                }
                
                
              }
              
        
      }
 

})
app.get('/feedback',(req,res)=>{
    res.render("feedback");
})

app.post('/feedback', async (req, res) => {
    const data=req.body.complaint.split("-");
    const complain=data[0];
   
    console.log(complain);
    const satisfied = req.body.satisfied;
    const feedback = req.body.feedback;
    console.log("1");
    const student = await UCER.findOne({ studentId });
  
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
if(student.complains.length!=0){
      
    const matchingComplaint = student.complains.find(existingComplaint => existingComplaint.complain === complain);
if(matchingComplaint.actionTaken.length==0){
   res.send("No action has been taken on your complain.")
}
     else{     
    if (matchingComplaint) {

      matchingComplaint.satisfied = satisfied;
      matchingComplaint.feedback = feedback;
    
      await student.save();
       
        const transporter = await nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
        });
          if(satisfied=="No"){
        const mailOptions = {
            from: "process.env.EMAIL_USER",
            to: student.email, 
            subject: "Your feedback is important to us!",
            html: `<p>Dear<b> ${student.name},</b></p>

            <p>I hope this email finds you well. I wanted to reach out to express our gratitude for taking the time to provide us with your feedback. Your insights are valuable to us, and we genuinely appreciate your openness in sharing your experiences.</p>
          
            <p>I want to extend my sincerest apologies for any frustration or inconvenience you may have experienced. Your concerns are of the utmost importance to us, and we are committed to addressing them promptly.</p>
          
            <p>We have initiated an investigation into the matter and would appreciate any additional details you could share to help us better understand the specifics of your situation. Our goal is to resolve this matter thoroughly and efficiently.</p>
          
            <p>Rest assured, we take all feedback seriously, and your insights will contribute to ongoing improvements within our system. We are actively working on [briefly mention any immediate steps you are taking].</p>
          
            <p>Once again, I apologize for any inconvenience this may have caused, and I assure you that we are committed to finding a resolution. If you have any further thoughts or suggestions, we welcome additional feedback.</p>
          
            <p>Thank you for your understanding and patience.</p>
          
            <p>Best regards,<br>
            UCER MANAGEMENT`
          };
          await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.send("Error");
            } else {
                console.log("Email sent:" + info.response);
            res.render("af");
            }
        });
        
        }
          else{
            const mailOptions = {
                from: "process.env.EMAIL_USER",
                to: student.email, 
                subject: "Thank you for your feedback!",
                html: `<p>Dear<b> ${student.name},</b></p>

                <p>I hope this message finds you well. We wanted to extend our sincere gratitude for your recent positive feedback. Your kind words have truly brightened our day, and we are delighted to hear about your positive experience.</p>
              
                <p>Your appreciation means a lot to us, and it serves as a motivating factor for our team to continue delivering excellent service. We're thrilled that liked our work, and it reinforces our commitment to solve your issue in best possible way.</p>
              
                <p>It's students like you who make our work so rewarding. We value your feedback and are always here to assist you. If you have any further comments, suggestions, or if there's anything specific you'd like to share, please feel free to reach out.</p>
              
                
              
                <p>Best regards,<br>
                UCER MANAGEMENT</p>`
              };
              await transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    res.send("Error");
                } else {
                    console.log("Email sent:" + info.response);
                res.render("af");
                }
            }); 

          }}
          else{
            res.send("No new complain has been registered.")
          }

        
    } }else {
        res.send("No complaint registered by You till date.");
    }
});
//=======================================================
const bodyParser = require('body-parser');

// const twilio = require('twilio');
// const { LogInstance } = require("twilio/lib/rest/serverless/v1/service/environment/log");


// const client = twilio(
//     process.env.TWILIOFIRST,
//     process.env.TWILIOSECOND
// );
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
//==============================================================
app.get('/teacherv',(req,res)=>{
    res.render("teacherv");
})
app.post('/teacherverification',async(req,res)=>{
     teacherId=req.body.teacherId;
    const tname=req.body.tname;
   const  pnum=req.body.phonenumber;
    const teacher=await UCER2.findOne({teacherId});
   
    if(teacher==null){
        res.send("Teacher ID doesnot exist");
    }
    if(name==teacher.name){
     console.log("Yeshi")
  const otp = Math.floor(1000 + Math.random() * 9000); // Generate a random 4-digit OTP
  req.session.otp=otp
  client.messages
    .create({
      body: `Your OTP is: ${otp}`,
      from: 447888865292,
      to: pnum,
    })
    .then(() => {
      res.render("checkotp");
      // You may want to store this OTP in a database associated with the phone number for verification later
    })
    .catch((err) => {
      console.error('Error sending OTP:', err);
      res.status(500).send('Error sending OTP');
    });


    }
    else{
        res.send("Wrong Input")
    }
})

//=====================================================================================
app.get("/student",(req,res)=>{
    res.render("student")
})
//=====================================================================================
app.get("/teacher",(req,res)=>{
    res.render("teacher")
})
//======================================================================================
app.post('/resolved',async(req,res)=>{
    const category=req.body.category;
    

    const branch=req.body.branch;
    
    const  semester=req.body.semester;
    
    const section=req.body.section;
    
    if(section!="All"){
        console.log(1);
    if(category=="All"){
    const result =await UCER.find(
        { branch: branch, semester: semester, section: section },
        { _id: 0,name:1,studentId:1, complains: 1 }
      );
      if (result === null || result.length === 0) {
        res.send('No complains found.');
    } 
    else {
        const responseData = {
            totalComplaints: result.reduce((acc, item) => acc + item.complains.filter(c => c.satisfied === "Yes").length, 0),
            students: result.map(item => ({
                name: item.name,
                studentId: item.studentId,
                complaints: item.complains.filter(c => {
                    console.log("Category:", category);
                    console.log("Complaint:", c);
                    return  c.satisfied === "Yes";
                })
                

            }))
        };
    
        res.render('rct', responseData);}
    

}
      else{
        console.log(1);
        const result = await UCER.find(
            {
                branch: branch,
                semester: semester,
                section: section,
                'complains.category': category,
                
            },
            { _id: 0, name: 1, studentId: 1, complains: 1 }
        );
        
        if (result === null || result.length === 0) {
            res.send('No complains found.');
        } else {
            const responseData = {
                totalComplaints: result.reduce((acc, item) => acc + item.complains.filter(c => c.category === category).length, 0),
                students: result.map(item => ({
                    name: item.name,
                    studentId: item.studentId,
                    complaints: item.complains.filter(c => {
                        console.log("Category:", category);
                        console.log("Complaint:", c);
                        return c.category === category && c.satisfied === "Yes";
                    })
                    

                }))
            };
        
            res.render('rct', responseData);
        }
        
        
        
      }
    }
      else{
        if(category=="All"){
            const result =await UCER.find(
                { branch: branch, semester: semester},
                { _id: 0,name:1,studentId:1, complains: 1 }
              );
              if (result === null || result.length === 0) {
                res.send('No complains found.');
            } 
            else {
                const responseData = {
                    totalComplaints: result.reduce((acc, item) => acc + item.complains.filter(c => c.satisfied === "Yes").length, 0),
                    students: result.map(item => ({
                        name: item.name,
                        studentId: item.studentId,
                        complaints: item.complains.filter(c => {
                            console.log("Category:", category);
                            console.log("Complaint:", c);
                            return  c.satisfied === "Yes";
                        })
                        
        
                    }))
                };
            
                res.render('rct', responseData);
            }
             }
              else{
                const result = await UCER.find(
                    {
                        branch: branch,
                        semester: semester,
                        
                        'complains.category': category,
                        
                    },
                    { _id: 0, name: 1, studentId: 1, complains: 1 }
                );
                
                if (result === null || result.length === 0) {
                    res.send('No complains found.');
                } else {
                    const responseData = {
                        totalComplaints: result.reduce((acc, item) => acc + item.complains.filter(c => c.category === category).length, 0),
                        students: result.map(item => ({
                            name: item.name,
                            studentId: item.studentId,
                            complaints: item.complains.filter(c => c.category === category && c.satisfied === "Yes")

                        }))
                    };
                
                    res.render('rct', responseData);
                }
                
                
              }
        
      }
    
})
//==============================================================================================
app.post('/unresolved', async (req, res) => {
    category = req.body.category;
     branch = req.body.branch;
     semester = req.body.semester;
     section = req.body.section;
    if (section != "All") {
        if (category == "All") {
            const result = await UCER.find(
                { branch: branch, semester: semester, section: section },
                { _id: 0, name: 1, studentId: 1, 'complains.category': 1, 'complains.complain': 1,'complains.url': 1, 'complains.date': 1, 'complains.satisfied': 1, 'complains.feedback': 1, 'complains.actionTaken': 1 }
            );

            if (result === null || result.length === 0) {
                res.send('No complains found.');
            } else {
                const responseData = {
                    totalComplaints: result.reduce((acc, item) => acc + item.complains.filter(c => c.satisfied === "No" || !c.satisfied).length, 0),
                    students: result.map(item => ({
                        name: item.name,
                        studentId: item.studentId,
                        complaints: item.complains.filter(c => c.category != undefined && (c.satisfied === "No" || !c.satisfied))
                    }))
                };

                res.render('rrct', responseData);
            }
        } else {
            console.log(1);
            const result = await UCER.find(
                {
                    branch: branch,
                    semester: semester,
                    section: section,
                    'complains.category': category,
                },
                { _id: 0, name: 1, studentId: 1,'complains.url': 1, 'complains.category': 1, 'complains.complain': 1, 'complains.date': 1, 'complains.satisfied': 1, 'complains.feedback': 1, 'complains.actionTaken': 1 }
            );

            if (result === null || result.length === 0) {
                res.send('No complains found.');
            } else {
                const responseData = {
                    totalComplaints: result.reduce((acc, item) => acc + item.complains.filter(c => c.satisfied === "No" || !c.satisfied).length, 0),
                    students: result.map(item => ({
                        studentId: item.studentId,
                        name: item.name,
                        complaints: item.complains.filter(c => c.category != undefined && c.category == category && (c.satisfied === "No" || !c.satisfied))
                    }))
                };

                res.render('rrct', responseData);
            }
        }
    } else {
        if (category == "All") {
            const result = await UCER.find(
                { branch: branch, semester: semester },
                { _id: 0, name: 1, studentId: 1,'complains.url': 1, 'complains.category': 1, 'complains.complain': 1, 'complains.date': 1, 'complains.satisfied': 1, 'complains.feedback': 1, 'complains.actionTaken': 1 }
            );

            if (result === null || result.length === 0) {
                res.send('No complains found.');
            } else {
                const responseData = {
                    totalComplaints: result.reduce((acc, item) => acc + item.complains.filter(c => c.satisfied === "No" || !c.satisfied).length, 0),
                    students: result.map(item => ({
                        studentId: item.studentId,
                        name: item.name,
                        complaints: item.complains.filter(c => c.category != undefined && (c.satisfied === "No" || !c.satisfied))
                    }))
                };

                res.render('rrct', responseData);
            }
        } else {
            const result = await UCER.find(
                {
                    branch: branch,
                    semester: semester,
                    'complains.category': category,
                },
                { _id: 0, name: 1, studentId: 1,'complains.url': 1, 'complains.category': 1, 'complains.complain': 1, 'complains.date': 1, 'complains.satisfied': 1, 'complains.feedback': 1, 'complains.actionTaken': 1 }
            );

            if (result === null || result.length === 0) {
                res.send('No complains found.');
            } else {
                const responseData = {
                    totalComplaints: result.reduce((acc, item) => acc + item.complains.filter(c => c.satisfied === "No" || !c.satisfied).length, 0),
                    students: result.map(item => ({
                        name: item.name,
                        studentId: item.studentId,
                        complaints: item.complains.filter(c => c.category != undefined && c.category == category && (c.satisfied === "No" || !c.satisfied))
                    }))
                };
                console.log(responseData);
                res.render('rrct', responseData);
            }
        }
    }
})
//=========================================================================================================
app.post('/unresolved2', async (req, res) => {
    const category = req.body.category;
    const branch = req.body.branch;
    const semester = req.body.semester;
    const section = req.body.section;
    
    if (section != "All") {
        if (category == "All") {
            const result = await UCER.find(
                { branch: branch, semester: semester, section: section },
                { _id: 0, name: 1, studentId: 1, 'complains.url': 1,'complains.category': 1, 'complains.complain': 1, 'complains.date': 1, 'complains.satisfied': 1, 'complains.feedback': 1, 'complains.actionTaken': 1 }
            );

            if (result === null || result.length === 0) {
                res.send('No complains found.');
            } else {
                const responseData = {
                    totalComplaints: result.reduce((acc, item) => acc + item.complains.filter(c => c.satisfied === "No" || !c.satisfied).length, 0),
                    students: result.map(item => ({
                        name: item.name,
                        studentId: item.studentId,
                        complaints: item.complains.filter(c => c.category != undefined && (c.satisfied === "No" || !c.satisfied))
                    }))
                };

                res.render('rrct2', responseData);
            }
        } else {
            console.log(1);
            const result = await UCER.find(
                {
                    branch: branch,
                    semester: semester,
                    section: section,
                    'complains.category': category,
                },
                { _id: 0, name: 1, studentId: 1,'complains.url': 1, 'complains.category': 1, 'complains.complain': 1, 'complains.date': 1, 'complains.satisfied': 1, 'complains.feedback': 1, 'complains.actionTaken': 1 }
            );

            if (result === null || result.length === 0) {
                res.send('No complains found.');
            } else {
                const responseData = {
                    totalComplaints: result.reduce((acc, item) => acc + item.complains.filter(c => c.satisfied === "No" || !c.satisfied).length, 0),
                    students: result.map(item => ({
                        studentId: item.studentId,
                        name: item.name,
                        complaints: item.complains.filter(c => c.category != undefined && c.category == category && (c.satisfied === "No" || !c.satisfied))
                    }))
                };

                res.render('rrct2', responseData);
            }
        }
    } else {
        if (category == "All") {
            const result = await UCER.find(
                { branch: branch, semester: semester },
                { _id: 0, name: 1, studentId: 1,'complains.url': 1, 'complains.category': 1, 'complains.complain': 1, 'complains.date': 1, 'complains.satisfied': 1, 'complains.feedback': 1, 'complains.actionTaken': 1 }
            );

            if (result === null || result.length === 0) {
                res.send('No complains found.');
            } else {
                const responseData = {
                    totalComplaints: result.reduce((acc, item) => acc + item.complains.filter(c => c.satisfied === "No" || !c.satisfied).length, 0),
                    students: result.map(item => ({
                        studentId: item.studentId,
                        name: item.name,
                        complaints: item.complains.filter(c => c.category != undefined && (c.satisfied === "No" || !c.satisfied))
                    }))
                };

                res.render('rrct2', responseData);
            }
        } else {
            const result = await UCER.find(
                {
                    branch: branch,
                    semester: semester,
                    'complains.category': category,
                },
                { _id: 0, name: 1, studentId: 1,'complains.url': 1, 'complains.category': 1, 'complains.complain': 1, 'complains.date': 1, 'complains.satisfied': 1, 'complains.feedback': 1, 'complains.actionTaken': 1 }
            );

            if (result === null || result.length === 0) {
                res.send('No complains found.');
            } else {
                const responseData = {
                    totalComplaints: result.reduce((acc, item) => acc + item.complains.filter(c => c.satisfied === "No" || !c.satisfied).length, 0),
                    students: result.map(item => ({
                        name: item.name,
                        studentId: item.studentId,
                        complaints: item.complains.filter(c => c.category != undefined && c.category == category && (c.satisfied === "No" || !c.satisfied))
                    }))
                };
                console.log(responseData);
                res.render('rrct2', responseData);
            }
        }
    }
})

//====================================================================================
app.get('/unresolvedagain', async (req, res) => {
    const category1 = category;
    const branch1 = branch;
    const section1 = section;
    const semester1 = semester;

    console.log(category1);

    if (section1 != "All") {
        if (category1 == "All") {
            const result = await UCER.find(
                { branch: branch1, semester: semester1, section: section1 },
                { _id: 0, name: 1, studentId: 1, 'complains.category': 1, 'complains.complain': 1, 'complains.url': 1, 'complains.date': 1, 'complains.satisfied': 1, 'complains.feedback': 1, 'complains.actionTaken': 1 }
            );

            if (result === null || result.length === 0) {
                res.send('No complaints found.');
            } else {
                const responseData = {
                    totalComplaints: result.reduce((acc, item) => acc + item.complains.filter(c => c.satisfied === "No" || !c.satisfied).length, 0),
                    students: result
                        .filter(item => item.complains.some(c => c.actionTaken.length >= 3)) // Filter out students with all complaints having 3 or more actions taken
                        .map(item => ({
                            name: item.name,
                            studentId: item.studentId,
                            complaints: item.complains.filter(c => c.category != undefined && (c.satisfied === "No" || !c.satisfied))
                        }))
                };

                res.render('rrct3', responseData);
            }
        } else {
            console.log(1);
            const result = await UCER.find(
                {
                    branch: branch1,
                    semester: semester1,
                    section: section1,
                    'complains.category': category1,
                },
                { _id: 0, name: 1, studentId: 1, 'complains.url': 1, 'complains.category': 1, 'complains.complain': 1, 'complains.date': 1, 'complains.satisfied': 1, 'complains.feedback': 1, 'complains.actionTaken': 1 }
            );

            if (result === null || result.length === 0) {
                res.send('No complaints found.');
            } else {
                const responseData = {
                    totalComplaints: result.reduce((acc, item) => acc + item.complains.filter(c => c.satisfied === "No" || !c.satisfied).length, 0),
                    students: result
                        .filter(item => item.complains.some(c => c.actionTaken.length >= 3)) // Filter out students with all complaints having 3 or more actions taken
                        .map(item => ({
                            studentId: item.studentId,
                            name: item.name,
                            complaints: item.complains.filter(c => c.category != undefined && c.category == category1 && (c.satisfied === "No" || !c.satisfied))
                        }))
                };
                    console.log(responseData);
                res.render('rrct3', responseData);
            }
        }
    } else {
        if (category1 == "All") {
            const result = await UCER.find(
                { branch: branch1, semester: semester1 },
                { _id: 0, name: 1, studentId: 1, 'complains.url': 1, 'complains.category': 1, 'complains.complain': 1, 'complains.date': 1, 'complains.satisfied': 1, 'complains.feedback': 1, 'complains.actionTaken': 1 }
            );
                   console.log(result);
            if (result === null || result.length === 0) {
                res.send('No complaints found.');
            } else {
                const responseData = {
                    students: result
                        .filter(item => item.complains.some(c => c.actionTaken.length >= 3))
                        .map(item => ({
                            studentId: item.studentId,
                            name: item.name,
                            complaints: item.complains.filter(c => c.actionTaken.length >= 3 && (c.category != undefined && (c.satisfied === "No" || !c.satisfied)))
                        }))
                };
                
                     console.log(responseData);
                res.render('rrct3', responseData);
            }
        } else {
            const result = await UCER.find(
                {
                    branch: branch1,
                    semester: semester1,
                    'complains.category': category1,
                },
                { _id: 0, name: 1, studentId: 1, 'complains.url': 1, 'complains.category': 1, 'complains.complain': 1, 'complains.date': 1, 'complains.satisfied': 1, 'complains.feedback': 1, 'complains.actionTaken': 1 }
            );

            if (result === null || result.length === 0) {
                res.send('No complaints found.');
            } else {
                const responseData = {
                    totalComplaints: result.reduce((acc, item) => acc + item.complains.filter(c => c.satisfied === "No" || !c.satisfied).length, 0),
                    students: result
                        .filter(item => item.complains.some(c => c.actionTaken.length >= 3)) // Filter out students with all complaints having 3 or more actions taken
                        .map(item => ({
                            name: item.name,
                            studentId: item.studentId,
                            complaints: item.complains.filter(c => c.category != undefined && c.category == category1 && (c.satisfied === "No" || !c.satisfied))
                        }))
                };
                console.log(responseData);
                res.render('rrct3', responseData);
            }
        }
    }
})


//===========================================================================================

app.post('/updateTeacher', async (req, res) => {
    try {
      const names = req.body.name;
      const phoneNumbers = req.body.phonenumber;
      const categories = req.body.category;
  
      if (!names || !phoneNumbers || !categories) {
        return res.status(400).send('Invalid form data');
      }
  
      // Assuming names, phoneNumbers, and categories have the same length
      const teachersData = names.map((name, index) => ({
        
        _id: req.body._id[index], // Assuming _id is sent along with the form data
        name: name,
        phonenumber: phoneNumbers[index],
        category: categories[index],
      }));
  
      // Iterate through the submitted data and update only the changed values in the database
      for (const teacherData of teachersData) {
        const filter = { _id: teacherData._id };
        const existingTeacher = await UCER2.findById(teacherData._id);
  
        if (!existingTeacher) {
          return res.status(404).send(`Teacher with ID ${teacherData._id} not found`);
        }
  
        const update = {};
  
        // Compare existing values with submitted values and update only if they differ
        if (existingTeacher.name !== teacherData.name) {
          update.name = teacherData.name;
        }
  
        if (existingTeacher.phonenumber !== teacherData.phonenumber) {
          update.phonenumber = teacherData.phonenumber;
        }
  
        if (existingTeacher.category !== teacherData.category) {
          update.category = teacherData.category;
        }
  
        await UCER2.findOneAndUpdate(filter, update);
      }
  
      res.render("afterup");
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
  //==============================================================================================
  
  app.get('/teacherlogin',(req,res)=>{
    const url = 'https://quotes15.p.rapidapi.com/quotes/random/?language_code=en';
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'fb7ce984damshe8fef734ff222b2p1fda52jsn817686b81417',
            'X-RapidAPI-Host': 'quotes15.p.rapidapi.com'
        }
    };
    
    fetch(url,options)
    .then(response=>response.json())
    .then((response)=>{
        res.render("teacherlogin",{
            quotes:response.content,
            name:response.originator.name
        });
    })

})
  
  
  //=================================================================================
  
  
  
  
  
  app.post("/teacherlogin",async(req,res)=>{
    specialtid=req.body.tid;
    teacherId=specialtid;
    const password=req.body.password;
    const result=await UCER2.find({teacherId:specialtid});

    
    
  if(result.length!=0){
    tname=result[0].name;
    const tn=tname.toUpperCase();
    tcategory=result[0].category;
    if(password==result[0].password){

        if(specialtid==6720){
             // Convert to uppercase
           
             res.json({ success: true, message: 'Admin' });
        
        }
        else{
           
            res.json({ success: true, message: 'Teacher' });
    }}
    else{
      
        res.json({ success: false, message: 'Invalid user credentials' });
    }
}
else{
      
    res.json({ success: false, message: 'Invalid user credentials' });
}
})
app.get('/staff',async(req,res)=>{
    const result=await UCER2.find({teacherId:specialtid});
    tname=result[0].name;
    console.log("staff");
    const tn=tname.toUpperCase();
    res.render("faculty2", {
        nm: tn,
        anchorlink:'/complaindata'
    });
})
  
app.get('/admin', async (req, res) => {
    try {
        console.log(specialtid);

    

        const result = await UCER2.find({ teacherId: specialtid });

        if (result.length === 0) {
            return res.status(404).send({ message: "No teacher found" });
        }

        console.log(result);

        const tname = result[0].name;
        const tn = tname.toUpperCase();

        res.render("faculty", {
            nm: tn,
            anchorlink: '/cd'
        });

    } catch (error) {
        return res.status(500).send({ message: "Internal Server Error", error: error.message });
    }
});

  
  //========================================================================================
  
//=========================================================================================
app.get('/complaindata',(req,res)=>{
    
        
        res.render("cd3", {
            val:tcategory,
            d:tcategory,
            t:tname
         });
    
})
//=========================================================================================
app.get('/seestcom', async (req, res) => {
    const ch = await UCER.find({ studentId }, { _id: 0, name: 1, studentId: 1, complains: 1 });
    
    // Sort complaints and dates together based on the date
    ch.forEach(student => {
        student.complains.sort((a, b) => new Date(b.date) - new Date(a.date));
    });

    console.log(ch);

    const responseData = {
        totalComplaints: ch.length,
        complaints: ch
    };

    console.log(responseData);
    res.render('newsttable', responseData);
});

//======================================================================================================
app.post('/forgetpassword',async(req,res)=>{
const fpn=req.body.fpn;
const modifiedFpn = fpn.substring(2);
fsid=req.body.fsid;

console.log(fsid);
const result=await UCER.find({studentId:fsid});
if(result.length!=0){
    const pn=result[0].phone;
if(pn==modifiedFpn){
    const otp = Math.floor(1000 + Math.random() * 9000); // Generate a random 4-digit OTP
  req.session.otp=otp
  client.messages
    .create({
      body: `Your OTP is: ${otp}`,
      from: 447888865292,
      to: fpn,
    })
    .then(() => {
      res.render("checkotp");
      // You may want to store this OTP in a database associated with the phone number for verification later
    })
    .catch((err) => {
      console.error('Error sending OTP:', err);
      res.status(500).send('Error sending OTP');
    });
 res.render("checkotp");
}
else{
    res.send("wrong phonenumber");
}
}else{
    res.send('error')
}

})
//===========================================================================================
app.post('/verifyotp', (req, res) => {
    const otp2=req.session.otp;
    const d1=req.body.digit1;
    const d2=req.body.digit2;
    const d3=req.body.digit3;
    const d4=req.body.digit4;
    const ot=d1+d2+d3+d4;
    const otp=parseInt(ot,10);
if(otp2==otp)
{
res.render("newpassword");
}
else
res.send("Wrong OTP");
})
//=================================================================================================
app.post('/verifyotp1', (req, res) => {
    const otp2=req.session.otp;
    const d1=req.body.digit1;
    const d2=req.body.digit2;
    const d3=req.body.digit3;
    const d4=req.body.digit4;
    const ot=d1+d2+d3+d4;
    const otp=parseInt(ot,10);
if(otp2==otp)
{
res.render("newpassword1");
}
else
res.send("Wrong OTP");
})
//============================================================================================
app.post('/changepassword',async(req,res)=>{
    const newpassword=req.body.newpassword;
    
    const cnp=req.body.confirmpassword;
    const cha=await UCER.findOne({studentId:fsid});
    const name=cha.name;
    const femail=cha.email;
    if(newpassword==cnp){
        const  result=await UCER.updateOne({studentId:fsid},{$set:{password:newpassword}});

        const transporter = await nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
        });

        const mailOptions = {
            from: "process.env.EMAIL_USER",
            to: femail,
            subject: "Password Changed Successfully",
            html: `<p>Dear  ${name},</p>

            <p>We hope this email finds you well.</p>
        
            <p>This is to inform you that the password for your account with our website has been successfully changed. Your account security is important to us, and we appreciate your proactive approach to keeping your information safe.</p>
        
            <p>If you did not initiate this password change or have any concerns about the security of your account, please contact us in college.</p>
        
           
        
            <p>Best regards,<br>
            UCER MANAGEMENT

            </p>`,
        };

     
        await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.send("Error");
            } else {
                console.log("Email sent:" + info.response);
                

            }})




    
        res.send("Password set successfully,Now you can try to login with new password.")
    }
    else{
        res.send("Passwords are not matching");
    }
    
})
//===============================================================================================
app.post('/forgetpassword1',async(req,res)=>{
    const fpn=req.body.fpn;
    const modifiedFpn = fpn.substring(2);
     ftid=req.body.ftid;
    const result=await UCER2.find({teacherId:ftid});
    if(result.length!=0){
        const pn=result[0].phonenumber;
    if(pn==modifiedFpn){
        const otp = Math.floor(1000 + Math.random() * 9000); // Generate a random 4-digit OTP
      req.session.otp=otp
      client.messages
        .create({
          body: `Your OTP is: ${otp}`,
          from: 447888865292,
          to: fpn,
        })
        .then(() => {
          res.render("checkotp");
          // You may want to store this OTP in a database associated with the phone number for verification later
        })
        .catch((err) => {
          console.error('Error sending OTP:', err);
          res.status(500).send('Error sending OTP');
        });
     res.render("checkotp1");
    }
    else{
        res.send("wrong phonenumber");
    }
 
}else{
        res.send('error')
    }
})
//===============================================================================================
app.post('/changepassword1',async(req,res)=>{
    const newpassword=req.body.newpassword;
    
    const cnp=req.body.confirmpassword;
    const cha=await UCER2.findOne({teacherId:ftid});
    const name=cha.name;
    const femail=cha.email;
    if(newpassword==cnp){
        const  result=await UCER2.updateOne({teacherId:ftid},{$set:{password:newpassword}});
        const transporter = await nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
        });

        const mailOptions = {
            from: "process.env.EMAIL_USER",
            to: femail,
            subject: "Password Changed Successfully",
            html: `<p>Dear  ${name},</p>

            <p>We hope this email finds you well.</p>
        
            <p>This is to inform you that the password for your account with our website has been successfully changed. Your account security is important to us, and we appreciate your proactive approach to keeping your information safe.</p>
        
            <p>If you did not initiate this password change or have any concerns about the security of your account, please contact us in college.</p>
        
           
        
            <p>Best regards,<br>
            UCER MANAGEMENT

            </p>`,
        
        };

     
        await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.send("Error");
            } else {
                console.log("Email sent:" + info.response);
                

            }})



            res.send("Password set successfully,Now you can try to login with new password.")
    }
    else{
        res.send("Passwords are not matching");
    }
    
})
//====================================================================================================
app.post('/again',async(req,res)=>{


    const data = req.body;
    const categories=data.category;
    console.log(categories);
     console.log(data.action);
    const teachers = await UCER2.find({ category: { $in: categories } });
    
        console.log(teachers);
    const transporter = await nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
    });
    const recipients = teachers.map(teacher => teacher.email); 
    const mailOptions = {
        from: "process.env.EMAIL_USER",
        to: recipients.join(','), 
        subject: "Your feedback is important to us!",
        html: `<p>Dear UCER faculty member,</p>

        <p><b>${data.action}</b></p>
      
        
      
        <p>Thank you for your understanding and patience.</p>
      
        <p>Best regards,<br>
        UCER MANAGEMENT`
      };
      await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.send("Error");
        } else {
            console.log("Email sent:" + info.response);
        res.json("success");
        }
    });
    
    
})
//==================================================================================
app.post('/again2',async(req,res)=>{
    const categories = req.body;

    const teachers = await UCER.find({ studentId: { $in: categories } });
    
        console.log(teachers);
    const transporter = await nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
    });
    const recipients = teachers.map(teacher => teacher.email); 
    const mailOptions = {
        from: "process.env.EMAIL_USER",
        to: recipients.join(','), 
        subject: "Important!",
        html: `<p>Dear UCER Faculty Members</b></p>

        <p>I hope this email finds you well. I wanted to reach out to express our gratitude for taking the time to provide us with your feedback. Your insights are valuable to us, and we genuinely appreciate your openness in sharing your experiences.</p>
      
        <p>I want to extend my sincerest apologies for any frustration or inconvenience you may have experienced. Your concerns are of the utmost importance to us, and we are committed to addressing them promptly.</p>
      
        <p>We have initiated an investigation into the matter and would appreciate any additional details you could share to help us better understand the specifics of your situation. Our goal is to resolve this matter thoroughly and efficiently.</p>
      
        <p>Rest assured, we take all feedback seriously, and your insights will contribute to ongoing improvements within our system. We are actively working on [briefly mention any immediate steps you are taking].</p>
      
        <p>Once again, I apologize for any inconvenience this may have caused, and I assure you that we are committed to finding a resolution. If you have any further thoughts or suggestions, we welcome additional feedback.</p>
      
        <p>Thank you for your understanding and patience.</p>
      
        <p>Best regards,<br>
        UCER MANAGEMENT`
      };
      await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.send("Error");
        } else {
            console.log("Email sent:" + info.response);
        res.json("success");
        }
    });
    
})

//==============================================================================================================================
app.post('/DateWise', async (req, res) => {
    const category = req.body.category;
    const branch = req.body.branch;
    const semester = req.body.semester;
    const section = req.body.section;

    let result;
  
    

    if (section !== "All") {
        if (category === "All") {
            result = await UCER.find(
                { branch: branch, semester: semester, section: section },
                { _id: 0, complains: 1 }
            );
        } else {
            result = await UCER.find(
                {
                    branch: branch,
                    semester: semester,
                    section: section,
                    'complains.category': category
                },
                { _id: 0, complains: 1 }
            );
        }
    } else {
        if (category === "All") {
            result = await UCER.find(
                { branch: branch, semester: semester },
                { _id: 0, complains: 1 }
            );
        } else {
            result = await UCER.find(
                {
                    branch: branch,
                    semester: semester,
                    'complains.category': category
                },
                { _id: 0, complains: 1 }
            );
        }
    }

    if (!result || result.length === 0) {
        res.send('No complaints found.');
    } else {
        // Flatten the array of arrays to sort complaints by date
        const flattenedComplaints = result.flatMap(item => item.complains);
        const sortedComplaints = flattenedComplaints.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Fetch student information for each complaint
        const resolvedComplaints = [];
        for (const complaint of sortedComplaints) {

            const studentInfo = await UCER.findOne({ 'complains.complain': complaint.complain, 'complains.date': complaint.date});
           
            if (studentInfo) {
                resolvedComplaints.push({
                
                    name: studentInfo.name,
                    id: studentInfo.studentId,
                    sortedcomplaint:complaint
                });
            }
        }
     console.log(resolvedComplaints);
        res.render('againdate', { complaints: resolvedComplaints });
    }
});
//========================================================================================================
app.post('/DateWise2', async (req, res) => {
    
        const category = req.body.category;
        const branch = req.body.branch;
        const semester = req.body.semester;
        const section = req.body.section;
    
        let result;
      

    if (section !== "All") {
        if (category === "All") {
            result = await UCER.find(
                { branch: branch, semester: semester, section: section },
                { _id: 0, studentId: 1, name: 1, complains: 1 }
            );
        } else {
            result = await UCER.find(
                {
                    branch: branch,
                    semester: semester,
                    section: section,
                    'complains.category': category
                },
                { _id: 0, studentId: 1, name: 1, complains: 1 }
            );
        }
    } else {
        if (category === "All") {
            result = await UCER.find(
                { branch: branch, semester: semester },
                { _id: 0, studentId: 1, name: 1, complains: 1 }
            );
        } else {
            result = await UCER.find(
                {
                    branch: branch,
                    semester: semester,
                    'complains.category': category
                },
                { _id: 0, studentId: 1, name: 1, complains: 1 }
            );
        }
    }

    if (!result || result.length === 0) {
        res.send('No complaints found.');
    } else {
        // Filter complaints based on category
        const filteredComplaints = result.map(item => ({
            studentId: item.studentId,
            name: item.name,
            complains: item.complains.filter(c => c.category === category)
        }));

        // Flatten the array of arrays to sort complaints by date
        const flattenedComplaints = filteredComplaints.flatMap(item => item.complains);
        const sortedComplaints = flattenedComplaints.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Fetch student information for each complaint
        const resolvedComplaints = [];
        for (const complaint of sortedComplaints) {
            const studentInfo = await UCER.findOne({ 'complains.complain': complaint.complain, 'complains.date': complaint.date, 'complains.category': category });
            if (studentInfo) {
                resolvedComplaints.push({
                    name: studentInfo.name,
                    id: studentInfo.studentId,
                    sortedcomplaint: complaint
                    
                });
            }
        }

        res.render('againdate2', { complaints: resolvedComplaints});
    }
});

//=================================================================================================================

app.post('/textarea',async (req, res) => {
    // Access form fields and uploaded file
    const data = req.body;

    
    
        const file = req.files ? req.files.file : null; 
        if(file){
    var filename=file.name;
         const destination = './public/images/' + filename; // Include the filename in the destination path
         file.mv(destination, function (err) {
             if (err) {
                 console.log(err);
             } else {
                 console.log("File Uploaded");
             }})}
  
    console.log(data); // Form fields
    console.log(file); // Uploaded file information
  
    
  
        
    
    try {
        // Find the student document
        const student = await UCER.findOne({ studentId: data.studentId });
        
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        
        console.log(data.date.toString());
        
        // Iterate through complaints to find the one with matching date
        const complaintToUpdate = student.complains.find(complaint => {
            // Convert complaint date to Date object before comparing
            return complaint.complain === data.complain;
        });
        
        console.log(complaintToUpdate);
        
        if (!complaintToUpdate) {
            return res.status(404).json({ message: "Complaint not found for the given date" });
        }

        // Update actionTaken at the specified index
// Update actionTaken at the specified index
if (file) {
    complaintToUpdate.actionTaken.push({ action: data.actionTaken, url2: filename });
} else {
    complaintToUpdate.actionTaken.push({ action: data.actionTaken });
}

        // Save changes
        await student.save();

        const transporter = await nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        const mailOptions = {
            from: "process.env.EMAIL_USER",
            to: student.email, 
            subject: "Your feedback is important to us!",
            html: `<p>Dear<b> ${student.name},</b></p>
            
            <p>We have taken some action on your complain please give you feedback. You feedback will be helpful to us in knowing that how our complaint system is working in order to resolve the complains of the students.</p>
            
            <p>Action:<b>${data.actionTaken}</b></p>
            
            
            
            <p>Thank you.</p>
            
            <p>Best regards,<br>
            UCER MANAGEMENT`
        };
        
        await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.send("Error");
            } else {
                console.log("Email sent:" + info.response);
                res.render("af");
            }
        });
        
        res.json({ message: "Action taken for complaint successfully updated" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }

})

//====================================================================================================================
app.post('/sendEmailtofaculty', async (req, res) => {
    try {
        const data = req.body;
        
        const teacher = await UCER2.findOne({ category: data.category });

        const transporter = await nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: "process.env.EMAIL_USER",
            to: teacher.email,
            subject: "Action not taken",
            html: `<p>Dear<b> ${teacher.name},</b></p>

            <p>You have not taken any action on this complain the details are as follows:</p>

            <p>Complain:${data.complain}</p>
            <p>Date:${data.date}</p>
            <p>Name of student:${data.name}</p>
            <p>StudentId:${data.studentId}</p>
<p>Please take some action on that and resolve this complain as soon as possible</p>
            UCER MANAGEMENT`
        };

        await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.send("Error");
            } else {
                console.log("Email sent:" + info.response);
                
            }
        });

        res.json({ message: "Action taken for complaint successfully updated" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
//========================================================================================================================
app.get('/takeiteasy', async (req, res) => {
    

    // Fetch all data without any condition
    const result = await UCER.find(
        { 
            'complains.0': { $exists: true } // Check if the 'complains' array has at least one element
        },
        { 
            _id: 0, 
            studentId: 1, 
            name: 1, 
            complains: 1, 
            branch: 1, 
            semester: 1 
        }
    );
    
    console.log(result);

    if (!result || result.length === 0) {
        res.send('No complaints found.');
    } else {
        // Flatten the array of arrays to sort complaints by date
        const flattenedComplaints = result.flatMap(item => item.complains);
        const sortedComplaints = flattenedComplaints.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Fetch student information for each complaint
        const resolvedComplaints = [];
        for (const complaint of sortedComplaints) {
            const studentInfo = await UCER.findOne({ 'complains.complain': complaint.complain, 'complains.date': complaint.date });
            if (studentInfo) {
                resolvedComplaints.push({
                    name: studentInfo.name,
                    id: studentInfo.studentId,
                    branch:studentInfo.branch,
                    semester:studentInfo.semester,
                    sortedcomplaint: complaint
                });
            }
        }

        res.render('againdate2', { complaints: resolvedComplaints });
    }
});
//=================================================================================================================
app.get('/takeiteasy2', async (req, res) => {
     // Assuming you're passing category through query params
     console.log(tcategory);
     if(specialtid==6713||specialtid==6714||specialtid==6721||specialtid==6722||specialtid==6723||specialtid==6724||specialtid==6725||specialtid==6726){
        try {const tbranchdata=await UCER2.findOne({teacherId:specialtid});
        const tbranch=tbranchdata.branch;
        console.log(tbranch);
            // Fetch all data without any condition
            const result = await UCER.find({branch:tbranch}, { _id: 0, studentId: 1, name: 1, complains: 1, branch: 1, semester: 1 });
            
            console.log(result);
    
            if (!result || result.length === 0) {
                res.send('No complaints found.');
            } else {
                // Flatten the array of arrays to sort complaints by date
                const flattenedComplaints = result.flatMap(item => item.complains);
                const filteredComplaints = flattenedComplaints.filter(complaint => complaint.category === tcategory);
                const sortedComplaints = filteredComplaints.sort((a, b) => new Date(b.date) - new Date(a.date));
    
                // Fetch student information for each complaint
                const resolvedComplaints = [];
                for (const complaint of sortedComplaints) {
                    const studentInfo = await UCER.findOne({ 'complains.complain': complaint.complain, 'complains.date': complaint.date, 'complains.category': tcategory });
                    if (studentInfo) {
                        resolvedComplaints.push({
                            name: studentInfo.name,
                            id: studentInfo.studentId,
                            branch: studentInfo.branch,
                            semester: studentInfo.semester,
                            sortedcomplaint: complaint
                        });
                    }
                }
          if(specialtid==6713||specialtid==6724||specialtid==6725||specialtid==6726)
                res.render('againdate4', { complaints: resolvedComplaints });
            else
            res.render('againdate5', { complaints: resolvedComplaints });
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }  
     }
     else{
        try {
            // Fetch all data without any condition
            const result = await UCER.find({}, { _id: 0, studentId: 1, name: 1, complains: 1, branch: 1, semester: 1 });
            
            console.log(result);
    
            if (!result || result.length === 0) {
                res.send('No complaints found.');
            } else {
                // Flatten the array of arrays to sort complaints by date
                const flattenedComplaints = result.flatMap(item => item.complains);
                const filteredComplaints = flattenedComplaints.filter(complaint => complaint.category === tcategory);
                const sortedComplaints = filteredComplaints.sort((a, b) => new Date(b.date) - new Date(a.date));
    
                // Fetch student information for each complaint
                const resolvedComplaints = [];
                for (const complaint of sortedComplaints) {
                    const studentInfo = await UCER.findOne({ 'complains.complain': complaint.complain, 'complains.date': complaint.date, 'complains.category': tcategory });
                    if (studentInfo) {
                        resolvedComplaints.push({
                            name: studentInfo.name,
                            id: studentInfo.studentId,
                            branch: studentInfo.branch,
                            semester: studentInfo.semester,
                            sortedcomplaint: complaint
                        });
                    }
                }
    
                res.render('againdate3', { complaints: resolvedComplaints });
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
     }
 
    
   
});
//================================================================================================================
app.get('/direct1', (req, res) => {
    const complaint = req.query.complaint;
    const date = req.query.date;
    res.render('complainfed', {complain: complaint,date: date ,st:studentId});
});
//=======================================================================================================================
app.get('/graph', async (req, res) => {
    try {
        const data = await UCER.aggregate([
            {
                $unwind: "$complains" // Split complains array into separate documents
            },
            {
                $group: {
                    _id: { $month: "$complains.date" }, // Group by month
                    count: { $sum: 1 } // Count the number of documents in each group
                }
            },
            {
                $sort: { "_id": 1 } // Sort by month
            }
        ]);

        const graphData = Array.from({ length: 12 }, (_, i) => {
            const monthData = data.find(item => item._id === i + 1);
            return monthData ? monthData.count : 0;
        });
        const data1 = JSON.stringify(graphData);

        res.render('adgraph',{data:data1})
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
//====================================================================================================
app.post("/filterGraph",async(req,res)=>{
 const selectedCategory=req.body.selectedValue;
 try {
    const data = await UCER.aggregate([
        {
            $unwind: "$complains" // Split complains array into separate documents
        },
        {
            $match: {
                "complains.category": selectedCategory // Only include allowed categories
            }
        },

        {
            $group: {
                _id: { $month: "$complains.date" }, // Group by month
                count: { $sum: 1 } // Count the number of documents in each group
            }
        },
        {
            $sort: { "_id": 1 } // Sort by month
        }
    ]);

    const graphData = Array.from({ length: 12 }, (_, i) => {
        const monthData = data.find(item => item._id === i + 1);
        return monthData ? monthData.count : 0;
    });
    
    //const data1 = JSON.stringify(graphData);
    return res.json( { graphData });
} catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
}
})
//=====================================================================================================
app.get('/fgraph',async(req,res)=>{
   const data=await UCER2.findOne({teacherId:teacherId}) ;
   const selectedCategory=data.category;
   try {
      const data = await UCER.aggregate([
          {
              $unwind: "$complains" // Split complains array into separate documents
          },
          {
              $match: {
                  "complains.category": selectedCategory // Only include allowed categories
              }
          },
  
          {
              $group: {
                  _id: { $month: "$complains.date" }, // Group by month
                  count: { $sum: 1 } // Count the number of documents in each group
              }
          },
          {
              $sort: { "_id": 1 } // Sort by month
          }
      ]);
  
      const graphData = Array.from({ length: 12 }, (_, i) => {
          const monthData = data.find(item => item._id === i + 1);
          return monthData ? monthData.count : 0;
      });
      
      const data1 = JSON.stringify(graphData);
      res.render("graph",{
        data:data1
      })
  } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal server error" });
  }
})
//=================================================================================================================
app.get('/unresolvedagain1', async (req, res) => {
    try {
        const results = await UCER.aggregate([
            { $unwind: "$complains" }, // Deconstruct the complains array
            { 
                $match: { 
                    $expr: { 
                        $gt: [{ $size: { $ifNull: ["$complains.actionTaken", []] } }, 2] // Ensure actionTaken is an array and filter documents with more than 2 actions
                    }
                } 
            },
            { $sort: { "complains.date": -1 } }, // Sort by date in descending order
            { 
                $project: { 
                    studentId: 1, 
                    name: 1,
                    branch:1,
                    semester:1, 
                    "complains.category": 1, 
                    "complains.complain": 1, 
                    "complains.date": 1,
                    "complains.actionTaken": 1 ,
                    "complains.feedback": 1,
                    "complains.satisfied": 1 
                }
            }
        ]);
        console.log(results);
        res.render("morethan",{
            complaints:results
        }) // Send the results as JSON response
    } catch (error) {
        console.error("Error fetching complaints with more than two actions:", error);
        res.status(500).send("Internal Server Error"); // Send an error response
    }
});
//========================================================================================================================
app.post('/morethanemail',async(req,res)=>{
    
    const categories = req.body.studentIds;

    const teachers = await UCER.find({ studentId: { $in: categories } });
    
        console.log(teachers);
    const transporter = await nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
    });
    const recipients = teachers.map(teacher => teacher.email); 
    const mailOptions = {
        from: "process.env.EMAIL_USER",
        to: recipients.join(','), 
        subject: "Important!",
        html: `<p>Dear UCER Students,</p>

        <p>We hope this email finds you well. We would like to inform you about an upcoming meeting regarding your recent complaint. Your feedback is valuable to us, and we appreciate your patience throughout this process.</p>
        
        <p>The meeting is scheduled to discuss the actions taken regarding your complaint and to address any further concerns you may have. Your presence at this meeting is important to us, and we encourage you to attend.</p>
        
        <p>Date:<b> ${req.body.meetingDate}</b><br>
        Time: <b> ${req.body.meetingTime}</b><br>
        Location:<b> ${req.body.meetingLocation}</b></p>
        
        <p>If you have any scheduling conflicts or require further assistance, please let us know as soon as possible.</p>
        
        <p>We look forward to meeting with you and working towards a resolution.</p>
        
        <p>Thank you for your cooperation.</p>
        
        <p>Best regards,<br>
        UCER Management</p>
        `
      };
      await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.send("Error");
        } else {
            console.log("Email sent:" + info.response);
        res.json("success");
        }
    });
    
})
//====================================================================================================
app.post('/filter',(req,res)=>{
    res.json(req.body.selectedValue);
})
//========================================================================================================
app.post('/block',async(req,res)=>{
    try {
        const data = req.body.studentId; // Get studentId from the request body
        const student = await UCER.findOne({ studentId: data });
               
        if (student) {
            // Set the block field to 1
            student.block = 1;
            await student.save();

            // Respond to the client
            res.status(200).send({ message: 'Student blocked for 2 minutes' });

            // Set a timer to unblock the student after 2 minutes
            setTimeout(async () => {
                student.block = 0;
                await student.save();
            }, 120000); // 120000 milliseconds = 2 minutes
        } else {
            res.status(404).send({ message: 'Student not found' });
        }
    } catch (error) {
        console.error('Error blocking student:', error);
        res.status(500).send({ message: 'Internal server error' });
    }

})
//========================================================================================================
app.post('/unblock',async(req,res)=>{
    try {
        const data = req.body.studentId; // Get studentId from the request body
        const student = await UCER.findOne({ studentId: data });

        if (student) {
            // Set the block field to 1
            student.block = 0;
            await student.save();

            // Respond to the client
            res.status(200).send({ message: 'Student has been unblocked' });

            // Set a timer to unblock the student after 2 minutes
         
        }
    } catch (error) {
        console.error('Error blocking student:', error);
        res.status(500).send({ message: 'Internal server error' });
    }

})
//===============================================================================================
app.post('/blockvision',async(req,res)=>{
    try {
        const data = req.body.studentId; // Get studentId from the request body
        const student = await UCER.findOne({ studentId: data });
    console.log(student);
        if (student) {
            // Set the block field to 1
            
            // Respond to the client
            res.send({block:student.block});

            // Set a timer to unblock the student after 2 minutes
         
        }
    } catch (error) {
        console.error('Error blocking student:', error);
        res.send({ message: 'Internal server error' });
    }

})
//==========================================================================================================
app.get('/blocked',async(req,res)=>{
    
    // Fetch all data without any condition
    const result = await UCER.find(
        { 
            
             block:1
        },
        { 
            _id: 0, 
            studentId: 1, 
            name: 1, 
        
            branch: 1, 
            semester: 1,
             
        }
    );
    
    console.log(result);
    res.render("blocked",{complaints:result});})
    //=====================================================================================================
    app.post('/facultycomplaintemail', async (req, res) => {
        console.log(req.body);
        const fid = req.body.faculty;
      
        try {
          const faculty = await UCER2.findOne({ teacherId: fid });
          console.log(faculty.email);
      
          const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS
            },
          });
      
          const mailOptions = {
            from: "process.env.EMAIL_USER",
            to: faculty.email,
            subject: "IMPORTANT!",
            html: `<p>Dear <b>${faculty.name},</b></p>
                   <p>Please pay attention to this complaint which is related to you.</p>
                   <p>Complaint: <b>${req.body.complaint}</b></p>
                   <p>Branch: <b>${req.body.branch}</b></p>
                   <p>Semester: <b>${req.body.semester}</b></p>
                   <p>Thank you,<br>UCER MANAGEMENT</p>`
          };
      
          await transporter.sendMail(mailOptions);
          console.log("Email sent");
          res.render("af");
      
        } catch (error) {
          console.error(error);
          res.status(500).send("Error sending email");
        }
      });
      
      


//================================================================================================================
app.listen(3700,()=>{
    console.log(`Server is running at port 3700`)
})
//=============================================================================================

    
