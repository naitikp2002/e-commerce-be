module.exports = (sequelize, DataTypes) => {
    const Favourites = sequelize.define(
      "favourites",
      {
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "users",
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
      },
      {
        underscored: true,
        indexes: [
            {
              unique: true,
              fields: ["product_id", "user_id"], // Enforce unique combination
            },
          ],
      }
    );
    
    Favourites.associate = (models) => {
      Favourites.belongsTo(models.users, { 
        foreignKey: "user_id", 
        as: "user" 
      });
      Favourites.belongsTo(models.products, { 
        foreignKey: "product_id", 
        as: "product" 
      });
      
    };

    return Favourites;
};