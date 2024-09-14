// i have used npm packages commander to make cli commands and used fs inbuild module to read and update file

const { Command } = require('commander');
const fs = require('fs');
const program = new Command();

const cartFile = 'cart.json';

const products = {
  "P001": { name: "Laptop", price: 1000.00, category: "Electronics" , currency : "USD" },
  "P002": { name: "Phone", price: 500.00, category: "Electronics" ,currency : "USD" },
  "P003": { name: "T-Shirt", price: 50.00, category: "Fashion" , currency : "USD"},
};

// Cart object
let cart = {};

function saveCart() {
  try {
    fs.writeFileSync(cartFile, JSON.stringify(cart, null, 2));
  } catch (error) {
    console.error("Error saving cart:", error);
  }
}

function loadCart() {
  try {
    if (fs.existsSync(cartFile)) {
      const data = fs.readFileSync(cartFile, 'utf8');
      cart = JSON.parse(data);
    } else {
      cart = {}; 
    }
  } catch (error) {
    console.error("Error loading cart:", error);
    cart = {}; 
  }
}

function addToCart(productId, quantity) {
  loadCart(); 
  if (products[productId]) {
    if (cart[productId]) {
      if (quantity > 0) {
        cart[productId].quantity += quantity;
      } else {
        cart[productId].quantity -= Math.abs(quantity);
        if (cart[productId].quantity <= 0) {
          delete cart[productId];
        }
      }
    } else {
      if (quantity > 0) {
        cart[productId] = { ...products[productId], quantity: quantity };
      }
    }
    console.log(`${products[productId].name} added to the cart.`);
    console.log("Current Cart State:", cart);
    saveCart(); 
  } else {
    console.log("Invalid Product ID.");
  }
}

// function removeFromCart(productId, quantity) {
//   loadCart(); // Load the cart before modifying
//   if (cart[productId]) {
//     if (cart[productId].quantity > quantity) {
//       cart[productId].quantity -= quantity;
//       console.log(`${quantity} unit(s) removed from ${products[productId].name}.`);
//     } else {
//       delete cart[productId];
//       console.log(`${products[productId].name} removed from the cart.`);
//     }
//     saveCart(); // Save the updated cart
//   } else {
//     console.log("Product not in cart.");
//   }
// }

function viewCart() {
  loadCart(); 
  console.log("Your Cart:");
  let totalCost = 0;
  for (let productId in cart) {
    const item = cart[productId];
    const itemTotal = item.price * item.quantity;
    totalCost += itemTotal;
    console.log(`${item.name} - ${item.price} USD x ${item.quantity} = ${itemTotal} USD`);
  }
  console.log(`Total Cart Cost (Before Discounts): $${totalCost.toFixed(2)}`);
  return totalCost; 
}

const discounts = [
  {
    name: "Buy 1 Get 1 Free on Fashion",
    category: "Fashion",
    type: "BOGO",
    apply: (cart) => {
      let discount = 0;
      for (let productId in cart) {
        const item = cart[productId];
        if (item.category === "Fashion") {
          discount += Math.floor(item.quantity / 2) * item.price;
        }
      }
      return discount;
    }
  },
  {
    name: "10% Off on Electronics",
    category: "Electronics",
    type: "percentage",
    apply: (cart) => {
      let discount = 0;
      for (let productId in cart) {
        const item = cart[productId];
        if (item.category === "Electronics") {
          discount += (item.price * item.quantity) * 0.10;
        }
      }
      return discount;
    }
  }
];

function listAvailableDiscounts() {
  console.log("Available Discounts:");
  discounts.forEach((discount, index) => {
    console.log(`${index + 1}. ${discount.name}`);
  });
}

function applyDiscounts(cart) {
  let totalDiscount = 0;
  discounts.forEach((discount) => {
    totalDiscount += discount.apply(cart);
  });
  return totalDiscount;
}

function calculateTotal() {
  loadCart(); 
  let total = 0;
  for (let productId in cart) {
    let itemTotal = cart[productId].price * cart[productId].quantity;
    console.log(`${cart[productId].name}: ${cart[productId].quantity} unit(s) - $${itemTotal.toFixed(2)}`);
    total += itemTotal;
  }
  console.log(`Total cost: $${total.toFixed(2)}`);
  return total;
}

function checkout() {
  loadCart(); 
  const totalCost = viewCart(); 
  const discount = applyDiscounts(cart);
  const finalCost = totalCost - discount;
  console.log(`Total Discounts: $${discount.toFixed(2)}`);
  console.log(`Final Price: $${finalCost.toFixed(2)}`);
  console.log("Checkout complete.");
}

program
  .command('add <productId> <quantity>')
  .description('Add a product to the cart')
  .action((productId, quantity) => {
    addToCart(productId, parseInt(quantity, 10));
  });

program
  .command('total')
  .description('View total cost of items in the cart')
  .action(() => {
    calculateTotal();
  });

program
  .command('view')
  .description('View cart')
  .action(() => {
    viewCart();
  });

program
  .command('discounts')
  .description('List available discounts')
  .action(() => {
    listAvailableDiscounts();
  });

program
  .command('checkout')
  .description('Checkout with discounts')
  .action(() => {
    checkout();
  });


program.parse(process.argv);
