module.exports = (sequelize, DataTypes) => {
  const Products = sequelize.define(
    "products",
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
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      images: {
        type: DataTypes.TEXT("long"),
        get() {
          const rawValue = this.getDataValue("images");
          return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
          this.setDataValue("images", JSON.stringify(value));
        },
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      rating: {
        type: DataTypes.ENUM("1", "2", "3", "4", "5"),
        allowNull: false,
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      brand_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "brands",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "categories",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    },
    {
      underscored: true,
    }
  );

  Products.associate = function (models) {
    Products.belongsTo(models.brands, {
      foreignKey: "brand_id",
      as: "brand",
      targetKey: "id",
    });
    Products.belongsTo(models.categories, {
      foreignKey: "category_id",
      as: "category",
      targetKey: "id",
    });
  };

  return Products;
};
