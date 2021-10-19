import bcrypt from 'bcryptjs';

const hashPassword = password => {
  // Hash password
  const salt = bcrypt.genSaltSync(10);
  const cryptedPassword = bcrypt.hashSync(password, salt);

  return cryptedPassword;
};

export default hashPassword;
