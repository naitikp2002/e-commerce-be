module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define("categories", {
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
    },{
      underscored: true,
    });
    
    Category.associate = (models) => {
      Category.hasMany(models.products, { 
        foreignKey: "category_id", 
        as: "products" 
      });
    };
    
    return Category;
  };
  