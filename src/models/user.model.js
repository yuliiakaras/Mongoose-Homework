import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    firstName: {
        type: String, 
        minlength: 4,
        maxlength: 50,
        required: true, 
        trim: true
    },
    lastName: {
        type: String,
        minlength: 3,
        maxlength: 60, 
        required: true,
        trim: true
    },
    fullName: {
        type: String
    },
    email: {
        type: String, 
        required: true, 
        validate: {
            validator: function(value) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            }, 
            message: 'Invalid email format'
        },
        lowercase: true
    },
    role: {
        type: String,
        enum: ['admin', 'writer', 'guest']
        },
    age: {
        type: Number, 
        min: [1, 'Age must be at least 1'],
        max: [99, 'Age must be at most 99']
    },
    numberOfArticles: {
        type: Number, 
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.pre('save', function (next) {
    console.log('Running pre-save middleware...');
    console.log('Current age:', this.age);
    
    if (this.age < 0) {
        console.log('Adjusting age to 1...');
        this.age = 1;
    }

    console.log('Calculating fullName...');
    this.fullName = `${this.firstName} ${this.lastName}`;
    console.log('Updated age:', this.age);
    console.log('Updated fullName:', this.fullName);

    this.updatedAt = new Date();
    console.log('Updated updatedAt:', this.updatedAt);

    next();
})

const User = mongoose.model('User', userSchema);

export default User;
