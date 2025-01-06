module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define("orders", {
    payment_id: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    total_sub_amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    tax: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    total_amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    total_items: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    address_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "addresses",
        key: "id",
      },
    },
    payment_method: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payment_status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payment_details: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  });

  Order.associate = (models) => {
    Order.belongsTo(models.users, { foreignKey: "user_id", as: "user" });
    Order.belongsTo(models.address, {
      foreignKey: "address_id",
      as: "address",
    });
    Order.hasMany(models.order_items, {
      foreignKey: "order_id",
      as: "order_items",
    });
  };

  return Order;
};
