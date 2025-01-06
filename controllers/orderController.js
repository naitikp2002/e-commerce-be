const db = require("../models/index");
const Category = db.categories;
const Product = db.products;
const Brand = db.brands;
const Cart = db.cartProducts;
const Order = db.orders;
const OrderItem = db.order_items;

const placeOrder = async (data) => {
  const { userId, addressId, paymentMethod, paymentDetails, paymentId } =
    data;
  //   const t = await sequelize.transaction();
  try {
    // Fetch cart items
    const cartItems = await Cart.findAll({
      where: { user_id: userId },
      include: [{ model: Product, as: "product" }],
    });
    if (!cartItems.length) {
      throw new Error("Cart is empty");
    }

    // Calculate order details
    const totalSubAmount = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const totalQuantity = cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const tax = totalSubAmount * 0.1; // Example: 10% tax
    const totalAmount = totalSubAmount + tax;
    const totalItems = cartItems.length;

    // Create the order
    const newOrder = await Order.create(
      {
        user_id: userId,
        total_sub_amount: totalSubAmount,
        tax,
        total_amount: totalAmount,
        total_items: totalItems,
        total_quantity: totalQuantity,
        address_id: addressId,
        payment_id: paymentId,
        payment_method: paymentMethod,
        payment_status: "Success",
        payment_details: paymentDetails,
      }
      //   { transaction: t }
    );

    // Insert order items
    const orderItemsData = cartItems.map((item) => ({
      order_id: newOrder.id,
      product_id: item.product_id,
      user_id: userId,
      product_name: item.product.name,
      quantity: item.quantity,
    }));

    // await OrderItem.bulkCreate(orderItemsData, { transaction: t });
    await OrderItem.bulkCreate(orderItemsData);

    // Clear the cart
    // await Cart.destroy({ where: { user_id: userId }, transaction: t });
    await Cart.destroy({ where: { user_id: userId } });

    // await t.commit();
    return newOrder;
  } catch (error) {
    // await t.rollback();
    throw error;
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: ["id", "name"],
    });
    return res
      .status(200)
      .json({ message: "Categories fetched successfully", categories });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching categories", error: error.message });
  }
};

module.exports = {
  placeOrder,
};
