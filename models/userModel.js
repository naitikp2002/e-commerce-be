module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define("users", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    mobile: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "user"),
      allowNull: false,
      defaultValue: "user",
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stripe_customer_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },{
    underscored: true,
  });
  return Users;
};
