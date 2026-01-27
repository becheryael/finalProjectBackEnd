import mongoose, { Document } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

export interface UserInterface extends Document {
  name: string;
  personalNum: string;
  email: string;
  avatar: string;
  manager: boolean;
  password: string;
  tokens: { token: string }[];
  generateAuthToken: () => Promise<string>;
  isModified: (password: string) => boolean;
  requests: {}[];
}

interface UserModel extends mongoose.Model<UserInterface> {
  findByCredentials(email: string, password: string): Promise<UserInterface>;
}

const PERSONAL_NUM_LENGTH = 7;
const PASSWORD_LENGTH = 7;

const userSchema = new mongoose.Schema<UserInterface>(
  {
    name: {
      type: String,
      require: true,
      trim: true,
      unique: true,
      validate(value: string) {
        if (value === "") {
          throw new Error(`Your name must contain at least one character.`);
        }
      }
    },
    personalNum: {
      type: String,
      require: true,
      trim: true,
      unique: true,
      match: [/^\d+$/, "Personal number must contain only digits"],
      validate(value: string) {
        if (value.length !== PERSONAL_NUM_LENGTH) {
          throw new Error(
            `Your personal number must contain exactly ${PERSONAL_NUM_LENGTH} digits.`
          );
        }
      }
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      validate(value: string) {
        if (!validator.isEmail(value)) {
          throw new Error("Your email must contain a valid email.");
        }
      }
    },
    avatar: {
      type: String,
      default: "koala",
      validate(value: string) {
        if (
          value !== "beaver" &&
          value !== "deer" &&
          value !== "koala" &&
          value !== "raccoon"
        ) {
          throw new Error("Not a valid avatar.");
        }
      }
    },
    manager: {
      type: Boolean,
      default: false
    },
    password: {
      type: String,
      required: true,
      minLength: 7,
      trim: true,
      validate(value: string) {
        if (value.length < PASSWORD_LENGTH) {
          throw new Error(
            `Your password must contain at least ${PASSWORD_LENGTH} characters.`
          );
        }
      }
    },
    tokens: [
      {
        token: {
          type: String,
          required: true
        }
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

userSchema.virtual("requests", {
  ref: "Request",
  localField: "_id",
  foreignField: "owner"
});

userSchema.pre<UserInterface>("save", async function () {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
});

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.SECRET!, {
    expiresIn: "1h"
  });
  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Unable to login");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Unable to login");
  }

  return user;
};

const User = mongoose.model<UserInterface, UserModel>("User", userSchema);

export default User;
