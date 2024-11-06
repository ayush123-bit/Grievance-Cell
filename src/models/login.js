const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    phone: {
        type: String
    },
    password:{
      type:String
    },
    address: {
        type: String
    },
    branch: {
        type: String
    },
    semester: {
        type: Number
    },
    section: {
        type: String
    },
    block: {
        type: Number,
        default:0
    },
    complains: {
        type: [{
            category: {
                type: String
            },
            complain: {
                type: String
            },
            date: {
                type: Date,
                default: () => {
                    const ISTOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
                    const ISTDate = new Date(Date.now() + ISTOffset);
                    return ISTDate;
                }
            },
            url: {
                type: String
            },
            satisfied: {
               type: String
            },
            feedback: {
                type: String
            },
            actionTaken: [{
                action: String,
                url2: String,
                date: {
                    type: Date,
                    default: () => {
                        const ISTOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
                        const ISTDate = new Date(Date.now() + ISTOffset);
                        return ISTDate;
                    }
                }
            }]
        }],
        validate: [
            function(complaints) {
                return complaints.length <= 50; // Limit to 50 complaints
            },
            'Maximum 50 complaints allowed'
        ],
        default: [{ 
            category: "No category",
            complain: "No complains Yet",
            actionTaken:[{ action: "No action taken", url2: "No Url" }] // Default actionTaken
        }]
    }
});

const UCER = mongoose.model("UCER", studentSchema);
module.exports = UCER;
