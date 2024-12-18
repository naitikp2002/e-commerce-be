module.exports = (sequelize, DataTypes) => {
  const Brand = sequelize.define(
    "brands",
    {
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
    },
    {
      underscored: true,
    }
  );
  
  Brand.associate = (models) => {
    Brand.hasMany(models.products, { 
      foreignKey: "brand_id", 
      as: "products" 
    });
  };
  
  return Brand;
};
