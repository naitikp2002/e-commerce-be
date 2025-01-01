const db = require("../models/index");
const Favourites = db.favourites;
const Product = db.products;
const Category = db.categories; // Add this line
const Brand = db.brands; // Add this line

const toggleFavourite = async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body;

  try {
    let favourite = await Favourites.findOne({
      where: { user_id: userId, product_id: productId },
    });

    if (favourite) {
      // If the product is already in favourites, remove it
      await Favourites.destroy({
        where: { user_id: userId, product_id: productId },
      });
      return res
        .status(200)
        .json({ message: "Product removed from favourites" });
    } else {
      // If the product is not in favourites, add it
      await Favourites.create({
        user_id: userId,
        product_id: productId,
      });
      return res.status(200).json({ message: "Product added to favourites" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const getFavourites = async (req, res) => {
  const userId = req.user.id;

  try {
    const favourites = await Favourites.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          as: "product",
          include: [
            // Add this block
            {
              model: Category,
              as: "category",
            },
            {
              model: Brand,
              as: "brand",
            },
          ],
        },
      ],
    });
    // Get user's favourites
    // const userFavourites = await Favourites.findAll({
    //   where: { user_id: userId },
    //   attributes: ["product_id"],
    // });
    // const favouriteProductIds = userFavourites.map((fav) => fav.product_id);

    const formattedProducts = favourites.map((product) => {
      const productJSON = product.product.toJSON();
      let images = [];

      try {
        if (productJSON.images) {
          images = JSON.parse(productJSON.images);
        }
      } catch (parseError) {
        console.error("Error parsing images JSON:", parseError);
        images = [];
      }

      return {
        ...productJSON,
        images
        // favourite: favouriteProductIds.includes(productJSON.id), // Add favourite flag
      };
    });

    return res.status(200).json({ products: formattedProducts });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  toggleFavourite,
  getFavourites,
};
