module.exports = (sequelize, DataTypes) => {
    const Cart = sequelize.define(
      "cartProducts",
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        product_id: {
            type: DataTypes.INTEGER,
            references: {
              model: "products",
              key: "id",
            },
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate:{
                min: 1,
            }
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: "users",
                key: "id",
            },
            allowNull: false,
        },
      },
      {
        underscored: true,
        tableName: "cart_products",
        timestamps: true,
        indexes: [
            {
              unique: true,
              fields: ["product_id", "user_id"], // Enforce unique combination
            },
          ],
      }
    );
    
    Cart.associate = (models) => {
        Cart.belongsTo(models.products, { foreignKey: "product_id", as: "product" });
        Cart.belongsTo(models.users, { foreignKey: "user_id", as: "user" });
      };
      
    return Cart;
  };
  