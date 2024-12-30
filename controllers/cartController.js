const db = require("../models/index");
const Product = db.products;
const Cart = db.cartProducts;

const getCartDetails = async (req, res) => {
    try {
        const userId = req.params.userId;
        const cartDetails = await Cart.findAll({
            where: { user_id: userId },
            include: [
                { model: Product, as: 'product' },
            ],
        });
        return res.status(200).json(cartDetails);
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred while fetching cart details.' });
    }
};

const addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log("userId", userId);
        const productId = req.body.productId;
        const quantity = req.body.quantity;
        const existingCartItem = await Cart.findOne({
            where: { user_id: userId, product_id: productId },
        });
        if (existingCartItem) {
            existingCartItem.quantity += quantity;
            if (existingCartItem.quantity <= 0) {
                await existingCartItem.destroy();
                return res.status(200).json({ message: 'Item removed from the cart.' });
            } else {
                await existingCartItem.save();
                return res.status(200).json({ message: 'Item updated in the cart.' });
            }
        } else {
            const newCartItem = await Cart.create({
                user_id: userId,
                product_id: productId,
                quantity,
            });
            return res.status(201).json({ message: 'Item added to the cart.' });
        }
    } catch (error) {
        console.log("error", error);
        return res.status(500).json({ error: 'An error occurred while adding to the cart.' });
    }
};

module.exports = {
    getCartDetails,
    addToCart,
};

