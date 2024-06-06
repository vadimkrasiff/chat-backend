import bcrypt from "bcrypt";
const generatePasswordHash = (password: string | Buffer) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(function (err, salt) {
      if (err) return reject(err);

      bcrypt.hash(password, 10, function (err, hash: string) {
        if (err) return reject(err);
        resolve(hash);
      });
    });
  });
  // generate a salt
};

export default generatePasswordHash;
