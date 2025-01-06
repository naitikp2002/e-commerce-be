module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define("order_items", {
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "orders",
        key: "id",
      },
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    product_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  OrderItem.associate = (models) => {
    OrderItem.belongsTo(models.orders, { foreignKey: "order_id", as: "orders" });
    OrderItem.belongsTo(models.products, {
      foreignKey: "product_id",
      as: "product",
    });
    OrderItem.belongsTo(models.users, { foreignKey: "user_id", as: "user" });
  };

  return OrderItem;
};
