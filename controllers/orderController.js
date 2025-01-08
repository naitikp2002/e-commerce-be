const db = require("../models/index");
const Category = db.categories;
const Product = db.products;
const Brand = db.brands;
const Cart = db.cartProducts;
const Order = db.orders;
const User = db.users;
const OrderItem = db.order_items;

const placeOrder = async (data) => {
  const { userId, addressId, paymentMethod, paymentDetails, paymentId } = data;
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

const getOrderDetailsByOrderId = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const orders = await Order.findOne({
      where: { id: orderId },
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              as: "product",
            },
          ],
          as: "order_items",
        },
      ],
    });
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

const getOrderListAdmin = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { sort_term, direction, search } = req.query;

    const whereClause = {};

    if (search) {
      whereClause[db.Sequelize.Op.or] = [
        { payment_status: { [db.Sequelize.Op.like]: `%${search}%` } },
        { "$user.name$": { [db.Sequelize.Op.like]: `%${search}%` } },
      ];
    }

    const order = [];
    if (sort_term && direction) {
      order.push([sort_term, direction]);
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name", "email"],
        },
      ],
      order,
      limit,
      offset,
    });

    res.status(200).json({
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalItems: count,
      filters: {
        search: search || null,
        sort_term: sort_term || null,
        direction: direction || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAllOrdersByUserId = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const orders = await Order.findAll({
      where: { user_id: userId },
      //   include: [
      //     {
      //       model: OrderItem,
      //       include: [
      //         {
      //           model: Product,
      //           attributes: ["name", "price"],
      //           as: "product",
      //         },
      //       ],
      //       as: "order_items",
      //     },
      //   ],
    });
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      // include: [
      //   {
      //     model: OrderItem,
      //     include: [
      //       {
      //         model: Product,
      //         attributes: ["name", "price"],
      //         as: "product",
      //       },
      //     ],
      //     as: "order_items",
      //   },
      // ],
    });
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  placeOrder,
  getAllOrdersByUserId,
  getAllOrders,
  getOrderDetailsByOrderId,
  getOrderListAdmin,
};
